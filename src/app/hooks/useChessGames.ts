import { useState, useEffect } from 'react';
import { ChessGame, parsePgnFile } from '../utils/pgnParser';
import { games, GameCategory } from '../games';

export function useChessGames() {
  const [loadedGames, setLoadedGames] = useState<ChessGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('Modern');
  const categories = Object.keys(games) as GameCategory[];

  useEffect(() => {
    const loadGamesForCategory = async (category: GameCategory) => {
      try {
        setLoading(true);
        const pgnContent = games[category];
        const parsedGames = parsePgnFile(pgnContent, `${category}.pgn`);
        setLoadedGames(parsedGames);
        setLoading(false);
      } catch (err) {
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