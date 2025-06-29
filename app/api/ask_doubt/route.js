import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize Gemini AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    // Parse the request body
    const { question, followUp = false, previousContext = '' } = await request.json();

    // Validate input
    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Create a comprehensive prompt for educational responses
    let prompt;
    
    if (followUp && previousContext) {
      prompt = `You are ConcepTalk AI, an expert B.Tech education assistant. A student is asking a follow-up question based on a previous explanation.

Previous Context: ${previousContext}

Follow-up Question: ${question}

Please provide a detailed, educational response that:
1. Directly addresses the follow-up question
2. Connects to the previous explanation
3. Uses simple language suitable for B.Tech students
4. Includes practical examples where relevant
5. Maintains continuity with the previous response

Keep the response comprehensive but focused on the specific follow-up query.`;
    } else {
      prompt = `You are ConcepTalk AI, an expert B.Tech education assistant helping engineering students understand technical concepts.

Student Question: ${question}

Please provide a detailed, educational response that:
1. Explains the concept step by step
2. Uses simple, clear language suitable for B.Tech students
3. Includes practical examples or real-world applications
4. Breaks down complex topics into digestible parts
5. Encourages further learning

If the question is about:
- Programming: Include code examples and explanations
- Mathematics: Show step-by-step solutions
- Engineering concepts: Explain the theory and practical applications
- Technology: Explain how it works and its significance

Format your response to be engaging and educational. End with a question to encourage deeper thinking.`;
    }

    // Generate content using Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();

    // Return the AI response
    return NextResponse.json({
      success: true,
      response: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Handle specific API errors
    if (error.message?.includes('API_KEY')) {
      return NextResponse.json(
        { error: 'Invalid API key configuration' },
        { status: 401 }
      );
    }
    
    if (error.message?.includes('QUOTA_EXCEEDED')) {
      return NextResponse.json(
        { error: 'API quota exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Failed to process your question. Please try again.' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}