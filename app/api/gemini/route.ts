// src/app/api/gemini/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { chatHistory } = await req.json();

    // Use the API key provided by the Canvas environment, or from .env.local for local dev
      // Map chatHistory to Gemini's expected format
      const apiKey = process.env.GEMINI_API_KEY || "";
      const formattedHistory = chatHistory.map((msg: { role: string, text: string }) => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: formattedHistory }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return NextResponse.json({ error: 'Failed toooooo get response from AI', details: errorData }, { status: response.status });
    }

    const result = await response.json();
    if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
      return NextResponse.json({ text: result.candidates[0].content.parts[0].text });
    } else {
      console.error("Unexpected Gemini API response structure:", result);
      return NextResponse.json({ error: 'Unexpected AI response structure' }, { status: 500 });
    }
  } catch (error) {
    console.error('Server-side error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}