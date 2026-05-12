import { supabase } from '@/lib/supabase'
     1|
     2|import { NextRequest, NextResponse } from 'next/server';
     3|import OpenAI from 'openai';
     4|
     5|const openai = new OpenAI({
     6|  apiKey: process.env.OPENROUTER_API_KEY,
     7|  baseURL: 'https://openrouter.ai/api/v1',
     8|});
     9|
    10|const MOODBOARD_DNA = `
    11|Eres el 'Designer Agent' de 5 Pembroke Villas. Tu estilo es 'Understated Elegance' y 'Neo-Classical Industrial'.
    12|REGLAS DE DISEÑO:
    13|1. Base neutra (cremas, taupe, piedra).
    14|2. Materiales: Lino, travertino, madera natural, latón envejecido.
    15|3. Acentos: Verde musgo, rojo profundo.
    16|4. Conservación: NUNCA sugieras quitar molduras, columnas o chimeneas originales.
    17|`;
    18|
    19|export async function POST(req: NextRequest) {
    20|  const { messages, screenshotUrl } = await req.json();
    21|
    22|  const response = await openai.chat.completions.create({
    23|    model: 'anthropic/claude-3.5-sonnet',
    24|    messages: [
    25|      { role: 'system', content: MOODBOARD_DNA },
    26|      ...messages
    27|    ],
    28|  });
    29|
    30|  return NextResponse.json({ 
    31|    reply: response.choices[0].message.content,
    32|    agent: 'Designer'
    33|  });
    34|}
    35|