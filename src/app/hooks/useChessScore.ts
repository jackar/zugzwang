'use client';

import { useState, useEffect } from 'react';

interface GameScore {
  gameId: number;
  correctMoves: number;
  totalAttempts: number;
}

export function useChessScore() {
  const [scores, setScores] = useState<Record<number, GameScore>>({});
  
  // Load scores from localStorage on initial render
  useEffect(() => {
    const savedScores = localStorage.getItem('chess-practice-scores');
    if (savedScores) {
      try {
        setScores(JSON.parse(savedScores));
      } catch (e) {
        console.error('Failed to parse saved scores:', e);
      }
    }
  }, []);
  
  // Save scores to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chess-practice-scores', JSON.stringify(scores));
  }, [scores]);
  
  // Add a point for a correct move
  const addCorrectMove = (gameId: number) => {
    setScores(prevScores => {
      const gameScore = prevScores[gameId] || { gameId, correctMoves: 0, totalAttempts: 0 };
      return {
        ...prevScores,
        [gameId]: {
          ...gameScore,
          correctMoves: gameScore.correctMoves + 1,
        }
      };
    });
  };
  
  // Record an attempt (correct or incorrect)
  const recordAttempt = (gameId: number) => {
    setScores(prevScores => {
      const gameScore = prevScores[gameId] || { gameId, correctMoves: 0, totalAttempts: 0 };
      return {
        ...prevScores,
        [gameId]: {
          ...gameScore,
          totalAttempts: gameScore.totalAttempts + 1,
        }
      };
    });
  };
  
  // Get score for a specific game
  const getGameScore = (gameId: number): GameScore => {
    return scores[gameId] || { gameId, correctMoves: 0, totalAttempts: 0 };
  };
  
  // Get total score across all games
  const getTotalScore = (): { correctMoves: number, totalAttempts: number } => {
    return Object.values(scores).reduce(
      (total, game) => ({
        correctMoves: total.correctMoves + game.correctMoves,
        totalAttempts: total.totalAttempts + game.totalAttempts,
      }),
      { correctMoves: 0, totalAttempts: 0 }
    );
  };
  
  // Reset score for a specific game
  const resetGameScore = (gameId: number) => {
    setScores(prevScores => {
      const newScores = { ...prevScores };
      delete newScores[gameId];
      return newScores;
    });
  };
  
  return {
    scores,
    addCorrectMove,
    recordAttempt,
    getGameScore,
    getTotalScore,
    resetGameScore,
  };
}
