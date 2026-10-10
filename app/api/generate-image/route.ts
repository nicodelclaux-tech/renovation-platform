import { NextRequest, NextResponse } from 'next/server';
import { toFile } from 'openai';
import { z } from 'zod';
import type { Generation, Json, StyleBible } from '@/lib/types/database';
import { getAuthContext, getStorageClient, userOwnsProject } from '@/lib/ai/route-auth';
import {
  ARCHITECT_MODEL,
  IMAGE_MODEL,
  IMAGE_QUALITY,
  IMAGE_SIZE,
  MissingApiKeyError,
  getOpenAI,
  getOpenRouter,
} from '@/lib/ai/clients';
import {
  ARCHITECT_SYSTEM_PROMPT,
  buildArchitectRequest,
  buildFallbackImagePrompt,
} from '@/prompts/master-template';

// Image generation routinely takes 30–90s.
export const maxDuration = 300;

const RENDERS_BUCKET = 'renders';

// Contract: see GenerateImageRequest in lib/ai/types.ts
const bodySchema = z.object({
  roomId: z.string().min(1),
  projectId: z.string().min(1),
  instruction: z.string().trim().max(4000).optional(), // may be multi-line markdown (e.g. a chat designer reply)
  sourceGenerationId: z.string().min(1).optional(),
});

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function POST(req: NextRequest) {
  // 1. Validate input
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: `Invalid request: ${parsed.error.issues.map((i) => `${i.path.join('.') || 'body'} ${i.message}`).join('; ')}` },
      { status: 400 }
    );
  }
  const { roomId, projectId, sourceGenerationId } = parsed.data;
  const instruction = parsed.data.instruction || undefined;

  // 2. Auth
  const auth = await getAuthContext();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { user, db } = auth;

  // 3. Ownership: room must belong to project, project must belong to user
  const { data: room } = await db.from('rooms').select('*').eq('id', roomId).maybeSingle();
  if (!room || room.project_id !== projectId) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }
  if (!(await userOwnsProject(db, user.id, projectId))) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  // 4. Optional source generation (refinement)
  let source: Generation | null = null;
  if (sourceGenerationId) {
    const { data } = await db.from('generations').select('*').eq('id', sourceGenerationId).maybeSingle();
    if (!data || data.room_id !== roomId) {
      return NextResponse.json({ error: 'Source generation not found' }, { status: 404 });
    }
    source = data;
  }

  // 5. AI clients (lazy — fail clearly if keys are missing, before creating any row)
  let openai: ReturnType<typeof getOpenAI>;
  let openrouter: ReturnType<typeof getOpenRouter>;
  try {
    openai = getOpenAI();
    openrouter = getOpenRouter();
  } catch (error) {
    if (error instanceof MissingApiKeyError) {
      return NextResponse.json({ error: `Image generation is not configured: ${error.message}` }, { status: 500 });
    }
    throw error;
  }

  const { data: project } = await db.from('projects').select('style_bible').eq('id', projectId).maybeSingle();
  const styleBible: StyleBible = project?.style_bible || {};

  const isRefinement = !!source?.image_url;
  const metadata: { [key: string]: Json } = {
    model: IMAGE_MODEL,
    size: IMAGE_SIZE,
    mode: isRefinement ? 'edit' : 'generate',
  };
  if (sourceGenerationId) metadata.source_generation_id = sourceGenerationId;
  if (instruction) metadata.instruction = instruction;

  // 6. Create generation record
  const { data: generation, error: insertError } = await db
    .from('generations')
    .insert({
      room_id: roomId,
      prompt: instruction || room.design_brief || 'Renovation concept',
      status: 'generating',
      metadata,
    })
    .select()
    .single();

  if (!generation) {
    console.error('Failed to create generation:', insertError);
    return NextResponse.json({ error: 'Failed to create generation' }, { status: 500 });
  }

  try {
    // 7. Architect — craft the master prompt via Claude (OpenRouter)
    const architectResponse = await openrouter.chat.completions.create({
      model: ARCHITECT_MODEL,
      messages: [
        { role: 'system', content: ARCHITECT_SYSTEM_PROMPT },
        {
          role: 'user',
          content: buildArchitectRequest({
            room,
            styleBible,
            instruction,
            previousPrompt: isRefinement ? source?.master_prompt || source?.prompt : null,
          }),
        },
      ],
    });

    const masterPrompt =
      architectResponse.choices[0]?.message?.content?.trim() ||
      buildFallbackImagePrompt({ room, styleBible, instruction });

    await db.from('generations').update({ master_prompt: masterPrompt }).eq('id', generation.id);

    // 8. Image — edit the source render (keeps geometry) or generate a fresh one
    let imageResponse;
    if (isRefinement && source?.image_url) {
      const sourceRes = await fetch(source.image_url);
      if (!sourceRes.ok) {
        throw new Error(`Could not download source image (HTTP ${sourceRes.status})`);
      }
      const contentType = sourceRes.headers.get('content-type') || 'image/png';
      const extension = contentType.includes('jpeg') ? 'jpg' : contentType.includes('webp') ? 'webp' : 'png';
      const sourceFile = await toFile(Buffer.from(await sourceRes.arrayBuffer()), `source.${extension}`, {
        type: contentType,
      });

      imageResponse = await openai.images.edit({
        model: IMAGE_MODEL,
        image: sourceFile,
        prompt: masterPrompt,
        size: IMAGE_SIZE,
        quality: IMAGE_QUALITY,
        input_fidelity: 'high',
        n: 1,
      });
    } else {
      imageResponse = await openai.images.generate({
        model: IMAGE_MODEL,
        prompt: masterPrompt,
        size: IMAGE_SIZE,
        quality: IMAGE_QUALITY,
        n: 1,
      });
    }

    const imageData = imageResponse.data?.[0];
    if (!imageData?.b64_json && !imageData?.url) {
      throw new Error('Image model returned no image');
    }

    // 9. Upload to Supabase Storage
    let publicUrl = imageData.url ?? null;
    if (imageData.b64_json) {
      const buffer = Buffer.from(imageData.b64_json, 'base64');
      const storagePath = `${roomId}/${generation.id}.png`;

      // Ownership verified above with the session client.
      const storage = getStorageClient(db).storage;
      const { error: uploadError } = await storage
        .from(RENDERS_BUCKET)
        .upload(storagePath, buffer, { contentType: 'image/png', upsert: true });
      if (uploadError) throw new Error(`Upload to storage failed: ${uploadError.message}`);

      publicUrl = storage.from(RENDERS_BUCKET).getPublicUrl(storagePath).data.publicUrl;
      metadata.storage_path = storagePath;
    }

    // 10. Mark completed
    const { data: completed, error: updateError } = await db
      .from('generations')
      .update({ status: 'completed', image_url: publicUrl, master_prompt: masterPrompt, metadata })
      .eq('id', generation.id)
      .select()
      .single();
    if (!completed) throw new Error(`Failed to save generation: ${updateError?.message ?? 'unknown error'}`);

    return NextResponse.json({ generation: completed });
  } catch (error) {
    const message = errorMessage(error);
    console.error('Generation error:', error);

    await db
      .from('generations')
      .update({ status: 'failed', metadata: { ...metadata, error: message } })
      .eq('id', generation.id);

    return NextResponse.json({ error: `Generation failed: ${message}` }, { status: 500 });
  }
}
