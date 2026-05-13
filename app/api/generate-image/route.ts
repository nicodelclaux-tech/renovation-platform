import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

export async function POST(req: NextRequest) {
  try {
    const { roomId, projectId } = await req.json();
    const supabase = createServerClient();

    // 1. Fetch room data
    const { data: room } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

    // 2. Fetch project style bible
    const { data: project } = await supabase
      .from('projects')
      .select('style_bible')
      .eq('id', projectId)
      .single();

    const styleBible = project?.style_bible || {};

    // 3. Create generation record (pending)
    const { data: generation } = await supabase
      .from('generations')
      .insert({
        room_id: roomId,
        prompt: room.design_brief || 'Renovation concept',
        status: 'generating',
      })
      .select()
      .single();

    if (!generation) return NextResponse.json({ error: 'Failed to create generation' }, { status: 500 });

    // 4. Phase 1: Architect — craft master prompt via Claude
    const architectResponse = await openrouter.chat.completions.create({
      model: 'anthropic/claude-sonnet-4',
      messages: [
        {
          role: 'system',
          content: `You are an elite architectural visualization prompt engineer. Craft a detailed, photorealistic image generation prompt. Be specific about materials, lighting, perspective, and atmosphere. Output ONLY the prompt text, nothing else.`,
        },
        {
          role: 'user',
          content: `Create an image generation prompt for this room renovation:

Room: ${room.name}
Fixed Architecture: ${room.fixed_architecture || 'Not specified'}
Design Brief: ${room.design_brief || 'Modern renovation'}
Style Bible: ${JSON.stringify(styleBible)}

Generate a photorealistic architectural visualization prompt.`,
        },
      ],
    });

    const masterPrompt = architectResponse.choices[0]?.message?.content || room.design_brief || 'Modern interior renovation';

    // Update generation with master prompt
    await supabase
      .from('generations')
      .update({ master_prompt: masterPrompt })
      .eq('id', generation.id);

    // 5. Phase 2: Generate image via OpenAI gpt-image-1
    const imageResponse = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: masterPrompt,
      size: '1536x1024',
      quality: 'high',
      n: 1,
    });

    const imageData = imageResponse.data?.[0];
    
    if (!imageData?.b64_json && !imageData?.url) {
      await supabase.from('generations').update({ status: 'failed' }).eq('id', generation.id);
      return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });
    }

    // 6. Upload to Supabase Storage
    let publicUrl = imageData.url;
    
    if (imageData.b64_json) {
      const buffer = Buffer.from(imageData.b64_json, 'base64');
      const fileName = `${generation.id}.png`;
      
      const { error: uploadError } = await supabase.storage
        .from('renders')
        .upload(fileName, buffer, {
          contentType: 'image/png',
          upsert: true,
        });

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('renders').getPublicUrl(fileName);
        publicUrl = urlData.publicUrl;
      }
    }

    // 7. Update generation as completed
    await supabase
      .from('generations')
      .update({
        status: 'completed',
        image_url: publicUrl,
        metadata: { model: 'gpt-image-1', size: '1536x1024' },
      })
      .eq('id', generation.id);

    return NextResponse.json({
      id: generation.id,
      image_url: publicUrl,
      master_prompt: masterPrompt,
      status: 'completed',
    });
  } catch (error: any) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Generation failed', details: error.message },
      { status: 500 }
    );
  }
}
