
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

const MOODBOARD_DNA = `
Eres el 'Designer Agent' de 5 Pembroke Villas. Tu estilo es 'Understated Elegance' y 'Neo-Classical Industrial'.
REGLAS DE DISEÑO:
1. Base neutra (cremas, taupe, piedra).
2. Materiales: Lino, travertino, madera natural, latón envejecido.
3. Acentos: Verde musgo, rojo profundo.
4. Conservación: NUNCA sugieras quitar molduras, columnas o chimeneas originales.
`;

export async function POST(req: NextRequest) {
  const { messages, screenshotUrl } = await req.json();

  const response = await openai.chat.completions.create({
    model: 'anthropic/claude-3.5-sonnet',
    messages: [
      { role: 'system', content: MOODBOARD_DNA },
      ...messages
    ],
  });

  return NextResponse.json({ 
    reply: response.choices[0].message.content,
    agent: 'Designer'
  });
}
