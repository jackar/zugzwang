'use client';

import React from 'react';

interface ScoreDisplayProps {
  gameScore: {
    correctMoves: number;
    totalAttempts: number;
  };
  totalScore: {
    correctMoves: number;
    totalAttempts: number;
  };
}

export default function ScoreDisplay({ gameScore, totalScore }: ScoreDisplayProps) {
  const gameSuccessRate = gameScore.totalAttempts > 0 
    ? Math.round((gameScore.correctMoves / gameScore.totalAttempts) * 100) 
    : 0;
    
  const totalSuccessRate = totalScore.totalAttempts > 0 
    ? Math.round((totalScore.correctMoves / totalScore.totalAttempts) * 100) 
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full">
      <h3 className="text-lg font-semibold text-black mb-2">Your Score</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-3 rounded-md">
          <h4 className="text-sm font-medium text-blue-800">Current Game</h4>
          <div className="flex justify-between items-center mt-1">
            <span className="text-2xl font-bold text-blue-600">{gameScore.correctMoves}</span>
            <span className="text-sm text-blue-600">
              {gameScore.totalAttempts > 0 ? `${gameSuccessRate}%` : '-'}
            </span>
          </div>
          <p className="text-xs text-blue-500 mt-1">
            {gameScore.totalAttempts} total attempts
          </p>
        </div>
        
        <div className="bg-green-50 p-3 rounded-md">
          <h4 className="text-sm font-medium text-green-800">All Games</h4>
          <div className="flex justify-between items-center mt-1">
            <span className="text-2xl font-bold text-green-600">{totalScore.correctMoves}</span>
            <span className="text-sm text-green-600">
              {totalScore.totalAttempts > 0 ? `${totalSuccessRate}%` : '-'}
            </span>
          </div>
          <p className="text-xs text-green-500 mt-1">
            {totalScore.totalAttempts} total attempts
          </p>
        </div>
      </div>
    </div>
  );
}
