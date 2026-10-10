import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { ChatMessage, StyleBible } from '@/lib/types/database';
import { GENERATE_MARKER_PREFIX, extractGenerateIntent } from './intent';

/*
 * Streaming protocol (Server-Sent Events, one JSON object per `data:` line):
 *
 *   data: {"content": "..."}                         visible text delta
 *   data: {"intent": {"instruction": "..."}}         model asked to render (Task 10)
 *   data: {"done": true, "content": "<clean text>"}  authoritative final visible text
 *   data: {"error": "..."}                           failure after the stream started
 *   data: [DONE]                                     end of stream
 *
 * Generation intent: the model is instructed to end its reply with a line
 * exactly `[[GENERATE: <one-line instruction>]]`. Response headers cannot be
 * set once streaming has begun, so the intent travels as its own SSE event
 * emitted after the model finishes. The marker itself never reaches the
 * client: while streaming we hold back any tail of the buffer that could be
 * the start of the marker (see `safeEmitLength`), and once the marker begins
 * nothing after it is emitted. The saved assistant message is the clean text
 * (marker stripped); the `done` event carries that same text so the client
 * can reconcile anything withheld.
 */

const HISTORY_LIMIT = 20;
const CHAT_MODEL = process.env.OPENROUTER_CHAT_MODEL || 'anthropic/claude-sonnet-4';

const postSchema = z.object({
  roomId: z.guid(),
  message: z.string().trim().min(1, 'Message is required').max(4000, 'Message is too long'),
});

const getSchema = z.object({ roomId: z.guid() });

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

/** Length of `text` that can be emitted without risking leaking a partial marker. */
function safeEmitLength(text: string): number {
  const markerAt = text.indexOf(GENERATE_MARKER_PREFIX);
  if (markerAt !== -1) return markerAt;
  // Hold back the longest suffix that is a prefix of the marker.
  for (let len = Math.min(GENERATE_MARKER_PREFIX.length - 1, text.length); len > 0; len--) {
    if (GENERATE_MARKER_PREFIX.startsWith(text.slice(-len))) return text.length - len;
  }
  return text.length;
}

function formatStyleBible(styleBible: StyleBible | null | undefined): string {
  if (!styleBible || Object.keys(styleBible).length === 0) return 'Not specified';
  return JSON.stringify(styleBible, null, 2);
}

/** GET /api/chat-designer?roomId=… → { messages, projectId } (RLS-scoped). */
export async function GET(req: NextRequest) {
  const parsed = getSchema.safeParse({ roomId: req.nextUrl.searchParams.get('roomId') });
  if (!parsed.success) return jsonError('Invalid roomId', 400);
  const { roomId } = parsed.data;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError('Unauthorized', 401);

  const { data: room } = await supabase.from('rooms').select('id, project_id').eq('id', roomId).maybeSingle();
  if (!room) return jsonError('Room not found', 404);

  const { data: messages, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('room_id', roomId)
    .neq('role', 'system')
    .order('created_at', { ascending: true });
  if (error) return jsonError(error.message, 500);

  return NextResponse.json({ messages: messages ?? [], projectId: room.project_id });
}

export async function POST(req: NextRequest) {
  try {
    // Create the OpenRouter client lazily so `next build` works without keys.
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return jsonError('Chat is not configured: OPENROUTER_API_KEY is missing', 500);

    const body = await req.json().catch(() => null);
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? 'Invalid request', 400);
    const { roomId, message } = parsed.data;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return jsonError('Unauthorized', 401);

    // RLS: a row only comes back if the user can access this room.
    const { data: room } = await supabase.from('rooms').select('*').eq('id', roomId).maybeSingle();
    if (!room) return jsonError('Room not found', 404);

    const [{ data: project }, { data: approved }, { data: recent }] = await Promise.all([
      supabase.from('projects').select('name, style_bible').eq('id', room.project_id).maybeSingle(),
      supabase
        .from('generations')
        .select('prompt')
        .eq('room_id', roomId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('chat_messages')
        .select('role, content')
        .eq('room_id', roomId)
        .neq('role', 'system')
        .order('created_at', { ascending: false })
        .limit(HISTORY_LIMIT),
    ]);

    const history = ((recent ?? []) as Pick<ChatMessage, 'role' | 'content'>[]).reverse();

    // A retry after a mid-stream failure re-sends a message that was already saved.
    const last = history[history.length - 1];
    const alreadySaved = last?.role === 'user' && last.content === message;

    const systemPrompt = `You are 'The Architect', an elite interior design AI assistant for high-end renovation projects.

You help the user refine their room design through conversation. You're knowledgeable about materials, textures and finishes; lighting design and color temperature; spatial flow and furniture placement; architectural styles and historical references; color theory and palette composition.

Project: ${project?.name || 'Unknown'}
Room: ${room.name}${room.floor ? ` (floor: ${room.floor})` : ''}${room.wing ? ` (wing: ${room.wing})` : ''}

FIXED ARCHITECTURE (immutable — never propose moving or removing walls, windows, doors, ceilings or other structural elements listed here):
${room.fixed_architecture || 'Not specified'}

DESIGN BRIEF:
${room.design_brief || 'Not specified'}

PROJECT STYLE BIBLE (house-wide rules; stay consistent with them):
${formatStyleBible(project?.style_bible)}

CURRENTLY APPROVED DESIGN:
${approved?.prompt || 'None approved yet'}

Be concise, professional, and opinionated. Offer specific recommendations with reasoning. Use Markdown (short paragraphs, bullet lists) where it helps.

Rendering: when the user asks you to generate, render or visualize a design (or clearly agrees to your proposal to render one), end your reply with a final line exactly in this form and nothing after it:
${GENERATE_MARKER_PREFIX} <one-line instruction describing the changes to render>]]
Only include this line when a render should actually be started. Never mention the marker itself.`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ...(alreadySaved ? [] : [{ role: 'user' as const, content: message }]),
    ];

    const openrouter = new OpenAI({ apiKey, baseURL: 'https://openrouter.ai/api/v1' });
    const stream = await openrouter.chat.completions.create(
      { model: CHAT_MODEL, messages, stream: true },
      { signal: req.signal }
    );

    if (!alreadySaved) {
      const { error: insertError } = await supabase
        .from('chat_messages')
        .insert({ room_id: roomId, role: 'user', content: message });
      if (insertError) console.error('chat-designer: failed to save user message', insertError);
    }

    const encoder = new TextEncoder();
    const send = (controller: ReadableStreamDefaultController<Uint8Array>, payload: unknown) =>
      controller.enqueue(encoder.encode(`data: ${typeof payload === 'string' ? payload : JSON.stringify(payload)}\n\n`));

    const readableStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let fullContent = '';
        let emitted = 0;
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content || '';
            if (!delta) continue;
            fullContent += delta;
            const safe = safeEmitLength(fullContent);
            if (safe > emitted) {
              send(controller, { content: fullContent.slice(emitted, safe) });
              emitted = safe;
            }
          }

          const { text, instruction } = extractGenerateIntent(fullContent);
          // Flush any withheld text that turned out not to be a marker.
          const markerAt = fullContent.indexOf(GENERATE_MARKER_PREFIX);
          const visibleEnd = markerAt === -1 ? fullContent.length : markerAt;
          if (visibleEnd > emitted) send(controller, { content: fullContent.slice(emitted, visibleEnd) });

          const saved = text || (instruction ? `Rendering: ${instruction}` : '');
          if (saved) {
            const { error: saveError } = await supabase
              .from('chat_messages')
              .insert({ room_id: roomId, role: 'assistant', content: saved });
            if (saveError) console.error('chat-designer: failed to save assistant message', saveError);
          }

          if (instruction) send(controller, { intent: { instruction } });
          send(controller, { done: true, content: saved });
          send(controller, '[DONE]');
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Stream failed';
          console.error('chat-designer: stream error', error);
          try {
            send(controller, { error: msg });
            send(controller, '[DONE]');
          } catch {
            // Client disconnected.
          }
        } finally {
          try {
            controller.close();
          } catch {
            // Already closed.
          }
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Chat failed';
    console.error('chat-designer: request error', error);
    return jsonError(msg, 500);
  }
}
