// utils/pgnParser.ts
import { Chess } from 'chess.js';

declare global {
  interface Window {
    fs: {
      readdir: (path: string) => Promise<string[]>;
      readFile: (path: string, options: { encoding: string }) => Promise<string>;
    }
  }
}

export interface ChessGame {
  id: number;
  title: string;
  players: {
    white: string;
    black: string;
  };
  year?: number;
  event?: string;
  moves: Array<{
    from: string;
    to: string;
  }>;
  pgn: string;
  category: string;
  result: string;
}

export const parsePgnFile = (content: string, filename: string): ChessGame[] => {
  // Extract category from filename
  const category = filename.replace('.pgn', '')
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  // Split multiple games if they exist in the same file
  const games = content.split(/\n\n(?=\[)/);
  console.log('Number of games found:', games.length);
  
  return games.map((gameStr, index) => {
    const game = new Chess();
    try {
      // Clean up the PGN string
      const lines = gameStr.trim().split('\n');
      const headerLines = [];
      const moveLines = [];
      let inMoves = false;

      for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.trim().startsWith('[')) {
          headerLines.push(line.trim());
          inMoves = false;
        } else {
          inMoves = true;
          moveLines.push(line.trim());
        }
      }

      // Join moves with proper spacing
      const movesText = moveLines
        .join(' ')
        .replace(/\s+/g, ' ')
        .split(/\s+/)
        .map(token => {
          // Add space after move numbers
          if (token.match(/^\d+\./)) {
            return token + ' ';
          }
          return token;
        })
        .join(' ')
        .trim();

      const cleanPgn = [
        ...headerLines,
        '',  // Empty line between headers and moves
        movesText
      ].join('\n');

      console.log('Moves text:', movesText);
      console.log('Clean PGN to load:', cleanPgn);
      
      // Try loading moves one at a time for debugging
      const moveTokens = movesText.split(/\s+/);
      let currentPosition = new Chess();
      let moveString = '';
      let currentMoveNumber = '';

      for (let i = 0; i < moveTokens.length; i++) {
        const token = moveTokens[i];
        
        // Skip empty tokens and result
        if (!token || token === '1-0' || token === '0-1' || token === '1/2-1/2') continue;
        
        // If it's a move number (e.g., "1.")
        if (token.match(/^\d+\./)) {
          currentMoveNumber = token;
          moveString += token + ' ';
        } else {
          // Add the move with proper spacing
          moveString += token + '\n';
          
          try {
            console.log(`Current move string: ${moveString}`);
            // Try to load the entire move string so far
            const testPosition = new Chess();
            const pgnToTest = [
              ...headerLines,
              '',
              moveString
            ].join('\n');
            testPosition.loadPgn(pgnToTest);
          } catch (e) {
            console.error(`Failed loading moves: ${moveString}`);
            throw e;
          }
        }
      }

      // If we got here, the moves are valid, so load the full PGN
      const finalPgn = [
        ...headerLines,
        '',
        moveString.trim()
      ].join('\n');

      game.loadPgn(finalPgn);
      
      // Extract metadata
      const header = game.header();
      console.log('Game header:', header);
      
      const event = header['Event'] || 'Unknown Event';
      const white = header['White'] || 'Unknown White';
      const black = header['Black'] || 'Unknown Black';
      const year = header['Date']?.split('.')?.[0] || 'Unknown Year';
      
      // Get moves in the format we need
      const gameMoves = game.history({ verbose: true });
      console.log('Number of moves:', gameMoves.length);
      
      const parsedMoves = gameMoves.map(move => ({
        from: move.from,
        to: move.to
      }));

      const parsedGame: ChessGame = {
        id: index + 1,
        title: `${white} vs ${black}`,
        players: {
          white,
          black
        },
        year: parseInt(year) || undefined,
        event,
        moves: parsedMoves,
        pgn: cleanPgn,
        category,
        result: header['Result'] || '*'
      };

      console.log('Successfully parsed game:', parsedGame.title);
      return parsedGame;
    } catch (error) {
      console.error('Error parsing game:', error);
      console.error('Problematic PGN:', gameStr);
      return null;
    }
  }).filter((game): game is ChessGame => game !== null);
};

export const loadPgnFile = async (filename: string): Promise<ChessGame[]> => {
  try {
    console.log('Loading PGN file:', filename);
    const content = await window.fs.readFile(`/app/games/${filename}`, { encoding: 'utf8' });
    console.log('File content loaded, length:', content.length);
    return parsePgnFile(content, filename);
  } catch (error) {
    console.error(`Error loading PGN file ${filename}:`, error);
    return [];
  }
};

export const loadPgnGames = async (): Promise<ChessGame[]> => {
  try {
    // Get list of PGN files
    const files = await window.fs.readdir('/pgn');
    const pgnFiles = files.filter(file => file.endsWith('.pgn'));

    // Load and parse each file
    const gamesPromises = pgnFiles.map(async file => {
      const content = await window.fs.readFile(`/pgn/${file}`, { encoding: 'utf8' });
      return parsePgnFile(content, file);
    });

    // Combine all games and flatten the array
    const allGames = (await Promise.all(gamesPromises)).flat();

    // Add unique IDs
    return allGames.map((game, index) => ({
      ...game,
      id: index + 1
    }));
  } catch (error) {
    console.error('Error loading PGN games:', error);
    return [];
  }
};