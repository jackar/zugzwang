import { useState, useEffect } from 'react';
import { ChessGame, parsePgnFile } from '../utils/pgnParser';
import { games, GameCategory } from '../games';

export function useChessGames() {
  const [loadedGames, setLoadedGames] = useState<ChessGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('modern');
  const categories = Object.keys(games) as GameCategory[];

  useEffect(() => {
    const loadGamesForCategory = async (category: GameCategory) => {
      try {
        setLoading(true);
        // Check if the category exists in the games object
        if (!games[category]) {
          setError(`Category "${category}" not found`);
          setLoading(false);
          return;
        }
        
        const categoryGames = games[category].games;
        const parsedGames = categoryGames.map((pgn) => {
          try {
            const parsed = parsePgnFile(pgn, `${category}.pgn`);
            return parsed[0]; // We expect one game per PGN string
          } catch (err) {
            console.error(`Error parsing game in category ${category}:`, err);
            return null;
          }
        }).filter((game): game is ChessGame => game !== null);
        
        setLoadedGames(parsedGames);
        setLoading(false);
      } catch (err) {
        console.error('Error in loadGamesForCategory:', err);
        setError(err instanceof Error ? err.message : 'Error loading games');
        setLoading(false);
      }
    };

    loadGamesForCategory(selectedCategory);
  }, [selectedCategory]);

  return {
    categories,
    games: loadedGames,
    loading,
    error,
    selectedCategory,
    setSelectedCategory,
  };
} 