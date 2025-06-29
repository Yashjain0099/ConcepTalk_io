// src/app/api/quiz/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();

    const chatHistory = [
      {
        role: "user",
        parts: [
          { text: `Generate 3 multiple-choice questions with 4 options each (A, B, C, D), and indicate the correct answer (A, B, C, or D), for the following technical topic: "${topic}". Structure the output as a JSON array of objects, where each object has 'question', 'options' (array of strings like "A. Option 1"), and 'correct' (string, e.g., "A").` }
        ]
      }
    ];

    const apiKey = process.env.GEMINI_API_KEY || "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: chatHistory,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              question: { type: "STRING" },
              options: { type: "ARRAY", items: { type: "STRING" } },
              correct: { type: "STRING" }
            },
            required: ["question", "options", "correct"]
          }
        }
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini Quiz API error:', errorData);
      return NextResponse.json({ error: 'Failed to generate quiz from AI', details: errorData }, { status: response.status });
    }

    const result = await response.json();
    const quizData = JSON.parse(result.candidates[0].content.parts[0].text);
    return NextResponse.json({ quiz: quizData });
  } catch (error) {
    console.error('Server-side quiz generation error:', error);
    return NextResponse.json({ error: 'Internal server error during quiz generation' }, { status: 500 });
  }
}