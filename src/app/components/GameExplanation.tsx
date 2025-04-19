'use client';

import React from 'react';
import { ChessGame } from '../utils/pgnParser';
import analysisData from '../data/test_game_1.json';

interface GameExplanationProps {
  game: ChessGame | null;
  currentMoveIndex: number;
}

export default function GameExplanation({ game, currentMoveIndex }: GameExplanationProps) {
  if (!game) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold text-black mb-2">Game Explanation</h3>
        <p className="text-sm text-gray-500">Select a game to view its explanation.</p>
      </div>
    );
  }

  // Get the current move explanation from analysis data
  const currentMoveExplanation = currentMoveIndex >= 0 && currentMoveIndex < analysisData.moves.length
    ? analysisData.moves[currentMoveIndex]
    : null;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-black mb-2">Game Explanation</h3>
      
      {currentMoveIndex < 0 ? (
        <div>
          <h4 className="text-md font-semibold text-black mb-2">Game Overview</h4>
          <p className="text-black mb-4">{analysisData.overview}</p>
          
          <h4 className="text-md font-semibold text-black mb-2 mt-6">Key Moments</h4>
          <ul className="list-disc pl-5 mb-4">
            {analysisData.keyMoments.map((moment, index) => (
              <li key={index} className="text-black mb-2">
                {moment}
              </li>
            ))}
          </ul>
          
          <p className="text-black">Use the arrow keys or Next Move button to start the game.</p>
        </div>
      ) : currentMoveExplanation ? (
        <div>
          <h4 className="text-md font-semibold text-black mb-2">
            Move {currentMoveExplanation.moveNumber}: {currentMoveExplanation.move}
          </h4>
          <p className="text-black">{currentMoveExplanation.explanation}</p>
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          No detailed analysis available for this move.
        </p>
      )}
    </div>
  );
} 