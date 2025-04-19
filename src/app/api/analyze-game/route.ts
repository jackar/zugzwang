import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { pgn, players, currentMove } = await request.json();

    const prompt = `Analyze this chess game between ${players.white} and ${players.black}:

${pgn}

${currentMove ? `Focus on explaining the current move from ${currentMove.from} to ${currentMove.to}.` : 'Provide an overview of the game.'}

Provide a structured analysis with:
1. A brief overview of the game
2. Key strategic moments
3. Move-by-move analysis

Format your response as JSON with this structure:
{
  "overview": "Brief game overview",
  "keyMoments": ["moment1", "moment2", "moment3"],
  "moveByMove": [
    {
      "moveNumber": 1,
      "move": "e4",
      "explanation": "explanation of the move"
    }
  ]
}`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a chess expert providing detailed game analysis. Focus on explaining the strategic ideas behind each move in clear, instructive language."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }
    const analysis = JSON.parse(content);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error analyzing game:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return NextResponse.json(
      { error: 'Failed to analyze game', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 