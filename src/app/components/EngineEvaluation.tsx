'use client';

import React from 'react';

interface EngineEvaluationProps {
  fen: string;
  isAnalyzing: boolean;
  onToggleAnalysis: () => void;
}

export default function EngineEvaluation({ onToggleAnalysis }: EngineEvaluationProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-black">Engine Analysis</h3>
        <button
          onClick={onToggleAnalysis}
          className="px-3 py-1 rounded text-sm bg-gray-300 cursor-not-allowed"
          disabled
        >
          Engine Disabled for Testing
        </button>
      </div>
      
      <div className="mt-2">
        <p className="text-sm text-gray-500">
          Engine analysis is temporarily disabled for deployment testing.
        </p>
      </div>
    </div>
  );
} 