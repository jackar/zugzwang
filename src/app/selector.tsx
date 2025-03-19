'use client';

import { ChessGame } from './utils/pgnParser';
import { GameCategory } from './games';

// We can get famous games from chess databases
// This is just a sample - you can expand this with real games
export const FAMOUS_GAMES = [
  {
    id: 1,
    title: "French Defense - Basic Line",
    players: { white: "Example White", black: "Example Black" },
    year: 2024,
    moves: [
      { from: 'e2', to: 'e4' },
      { from: 'e7', to: 'e6' },
      { from: 'd2', to: 'd4' },
      { from: 'd7', to: 'd5' }
    ]
  },
  {
    id: 2,
    title: "Immortal Game",
    players: { white: "Adolf Anderssen", black: "Lionel Kieseritzky" },
    year: 1851,
    moves: [
      { from: 'e2', to: 'e4' },
      { from: 'e7', to: 'e5' },
      { from: 'f2', to: 'f4' },
      { from: 'e5', to: 'f4' }
    ]
  },
  // Add more games here
];

interface GameSelectorProps {
  categories: GameCategory[];
  games: ChessGame[];
  selectedGameId: number | null;
  selectedCategory: GameCategory;
  onSelectCategory: (category: GameCategory) => void;
  onSelectGame: (game: ChessGame) => void;
}

export function GameSelector({ 
  categories, 
  games, 
  selectedGameId, 
  selectedCategory,
  onSelectGame, 
  onSelectCategory
}: GameSelectorProps) {
  const getResultEmoji = (result: string) => {
    switch (result) {
      case '1-0': return '⚪'; // White wins
      case '0-1': return '⚫'; // Black wins
      case '1/2-1/2': return '½'; // Draw
      default: return '?';
    }
  };

  return (
    <div className="w-64 h-full border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Chess Openings</h2>
        <div className="space-y-4">
          {categories.map((category) => {
            const isSelected = selectedCategory === category;
            
            return (
              <div key={category} className="space-y-2">
                <button
                  onClick={() => onSelectCategory(category)}
                  className={`w-full text-left px-2 py-1.5 rounded text-sm font-medium 
                    ${isSelected ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                >
                  {category}
                </button>

                {isSelected && (
                  <div className="pl-4 space-y-1">
                    {games.map((game) => (
                      <button
                        key={game.id}
                        onClick={() => onSelectGame(game)}
                        className={`w-full text-left p-2 rounded text-sm hover:bg-gray-100 transition-colors
                          ${selectedGameId === game.id ? 'bg-blue-50 border border-blue-200' : ''}`}
                      >
                        <div className="font-medium truncate">{game.title}</div>
                        <div className="text-xs text-gray-500 flex items-center justify-between">
                          <span>{game.year && `${game.year} • `}{game.moves.length} moves</span>
                          <span className="font-medium">{getResultEmoji(game.result)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
