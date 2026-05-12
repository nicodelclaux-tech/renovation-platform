import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: NextRequest) {
    try {
        const { room, promptContext } = await req.json();

        // 1. Obtener Style Bible de Supabase para consistencia
        const { data: styleBible } = await supabase.from('style_bible').select('*');
        const styleContext = styleBible?.map(rule => `${rule.key}: ${rule.value}`).join(', ');

        const finalPrompt = `Photorealistic architectural render of ${room}. Style DNA: ${styleContext}. Detail: ${promptContext}`;

        // 2. Generar imagen (Simulado/Real vía OpenRouter)
        const response = await openai.images.generate({
            model: "openai/dall-e-3",
            prompt: finalPrompt,
            size: "1024x1024",
            quality: "hd",
            n: 1
        });

        const imageUrl = response.data[0].url;

        // 3. Registrar en Supabase
        await supabase.from('generations').insert([
            { room, prompt: finalPrompt, image_url: imageUrl, status: 'completed' }
        ]);

        return NextResponse.json({ url: imageUrl });
    } catch (error) {
        return NextResponse.json({ error: 'Generation failed', details: error }, { status: 500 });
    }
}
