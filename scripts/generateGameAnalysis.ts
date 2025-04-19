import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { Chess } from 'chess.js';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type GameAnalysis = {
  gameId: string;
  title: string;
  players: {
    white: string;
    black: string;
  };
  moves: Array<{
    moveNumber: number;
    move: string;
    from: string;
    to: string;
    explanation: string;
    position: string; // FEN string
  }>;
  overview: string;
  keyMoments: string[];
};

async function analyzeGame(pgn: string, gameId: string): Promise<GameAnalysis> {
  console.log(`\nStarting analysis for game: ${gameId}`);
  
  const chess = new Chess();
  chess.loadPgn(pgn);
  
  const header = chess.header();
  const moves = chess.history({ verbose: true });
  
  console.log(`Found ${moves.length} moves to analyze`);
  console.log(`Game between ${header.White} and ${header.Black}`);
  
  // Create a comprehensive prompt for the entire game analysis
  const prompt = `Analyze this chess game between ${header.White} and ${header.Black}:

${pgn}

Provide a complete analysis in the following JSON format:
{
  "gameId": "${gameId}",
  "title": "${header.White} vs ${header.Black}",
  "players": {
    "white": "${header.White || 'Unknown'}",
    "black": "${header.Black || 'Unknown'}"
  },
  "moves": [
    // For each move, provide:
    // - moveNumber: the move number (1, 2, 3, etc.)
    // - move: the algebraic notation of the move (e.g., "e4", "Nf6")
    // - from: the starting square (e.g., "e2")
    // - to: the ending square (e.g., "e4")
    // - explanation: a 2-3 sentence explanation of the move's strategic idea, tactical considerations, and positional impact
    // - position: the FEN string of the position after the move
  ],
  "overview": "A comprehensive overview of the game's main themes, strategies, and progression",
  "keyMoments": [
    "3-4 key moments or turning points in the game, each as a separate string"
  ]
}

For each move, explain:
1. The strategic idea behind the move
2. Any tactical considerations
3. How it affects the position

Use clear, instructive language suitable for chess students.`;

  console.log('\nRequesting comprehensive game analysis...');
  
  const completion = await client.chat.completions.create({
    model: "o1", // Use O1 or another advanced model
    messages: [
      {
        role: "system",
        content: "You are a chess coach providing comprehensive game analysis. Your response must be valid JSON."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
  });

  const response = completion.choices[0].message.content || "{}";
  console.log('Analysis received');
  
  try {
    const analysis = JSON.parse(response);
    
    // Validate the analysis has the required fields
    if (!analysis.moves || !Array.isArray(analysis.moves)) {
      throw new Error("Analysis missing moves array");
    }
    
    return analysis;
  } catch (error) {
    console.error('Error parsing analysis:', error);
    throw error;
  }
}

async function processGames() {
  const gamesDir = path.join(process.cwd(), 'src/app/games');
  const outputDir = path.join(process.cwd(), 'src/app/data/analysis');

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Process test.ts instead of modern.ts
  const file = 'test.ts';
  const content = fs.readFileSync(path.join(gamesDir, file), 'utf-8');
  
  // Extract PGN content from the TypeScript file
  const pgnMatch = content.match(/export const \w+Pgn = `([^`]+)`/);
  
  if (!pgnMatch) {
    console.error('Could not find PGN content in test.ts');
    return;
  }

  const pgnContent = pgnMatch[1];
  
  // Extract individual games from the PGN content
  const games = pgnContent.split('\n\n\n').filter(game => game.trim().startsWith('[Event'));
  
  console.log(`Found ${games.length} games to analyze`);
  
  // Process only the first game
  if (games.length > 0) {
    const game = games[0];
    const gameId = 'test_game_1';
    
    console.log(`\nProcessing game: ${gameId}`);
    const analysis = await analyzeGame(game, gameId);
    
    // Save analysis to JSON file
    fs.writeFileSync(
      path.join(outputDir, `${gameId}.json`),
      JSON.stringify(analysis, null, 2)
    );
    
    console.log(`\n✅ Analysis saved for ${gameId}`);
  } else {
    console.error('No games found in test.ts');
  }
}

// Run the script
processGames().catch(console.error); 