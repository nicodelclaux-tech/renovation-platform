import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: NextRequest) {
    try {
        const { message, styleBible } = await req.json();

        const completion = await openai.chat.completions.create({
            model: "anthropic/claude-3.5-sonnet",
            messages: [
                {
                    role: "system",
                    content: "You are 'The Architect', an elite interior designer for high-end industrial projects. Your Style Bible for this project: " + JSON.stringify(styleBible)
                },
                { role: "user", content: message }
            ],
        });

        return NextResponse.json({ response: completion.choices[0].message.content });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to chat', details: error }, { status: 500 });
    }
}
