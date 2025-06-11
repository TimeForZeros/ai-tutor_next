'use server';
import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
const openai = createOpenAI();

export async function POST(request: NextRequest) {
  console.count();
  const prompt = await request.text(); // Parse JSON body
  if (!prompt) return NextResponse.error();
  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    prompt,
  });
  return NextResponse.json({ text });
}
