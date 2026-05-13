import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import OpenAI from 'openai';

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

export async function POST(req: NextRequest) {
  try {
    const { message, roomId } = await req.json();
    const supabase = createServerClient();

    // Fetch room context
    const { data: room } = await supabase
      .from('rooms')
      .select('*, project:projects(*)')
      .eq('id', roomId)
      .single();

    // Fetch chat history
    const { data: history } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(20);

    // Save user message
    await supabase.from('chat_messages').insert({
      room_id: roomId,
      role: 'user',
      content: message,
    });

    const styleBible = (room as any)?.project?.style_bible || {};
    const systemPrompt = `You are 'The Architect', an elite interior design AI assistant for high-end renovation projects.

You help the user refine their room design through conversation. You're knowledgeable about:
- Materials, textures, and finishes
- Lighting design and color temperature
- Spatial flow and furniture placement
- Architectural styles and historical references
- Color theory and palette composition

Context for this room:
- Room: ${room?.name || 'Unknown'}
- Fixed Architecture: ${room?.fixed_architecture || 'Not specified'}
- Design Brief: ${room?.design_brief || 'Not specified'}
- Style Bible: ${JSON.stringify(styleBible)}

Be concise, professional, and opinionated. Offer specific recommendations with reasoning. When the user asks to generate or render, respond with enthusiasm and describe what you'd create.`;

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    // Stream response
    const stream = await openrouter.chat.completions.create({
      model: 'anthropic/claude-sonnet-4',
      messages,
      stream: true,
    });

    // Create a ReadableStream for the response
    const encoder = new TextEncoder();
    let fullContent = '';

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullContent += content;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          
          // Save assistant message to DB
          await supabase.from('chat_messages').insert({
            room_id: roomId,
            role: 'assistant',
            content: fullContent,
          });

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
