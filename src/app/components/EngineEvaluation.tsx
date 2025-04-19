'use client';

import React, { useEffect, useState, useRef } from 'react';

interface EngineEvaluationProps {
  fen: string;
  isAnalyzing: boolean;
  onToggleAnalysis: () => void;
}

interface StockfishEngine {
  postMessage: (msg: string) => void;
  onmessage: (event: { data: string }) => void;
  terminate: () => void;
}

export default function EngineEvaluation({ fen, isAnalyzing, onToggleAnalysis }: EngineEvaluationProps) {
  const [evaluation, setEvaluation] = useState<string | null>(null);
  const [depth, setDepth] = useState<number>(0);
  const [bestMove, setBestMove] = useState<string | null>(null);
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const engineRef = useRef<StockfishEngine | null>(null);

  // Initialize Stockfish engine
  useEffect(() => {
    let isMounted = true;

    const initEngine = async () => {
      try {
        if (typeof window === 'undefined') return;

        // Load Stockfish from CDN
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/stockfish@15.0.0/stockfish.js';
        script.async = true;
        
        script.onload = () => {
          if (!isMounted) return;
          
          // @ts-expect-error - Stockfish is loaded globally
          const engine = window.Stockfish();
          engineRef.current = engine;
          
          // Set up message handler
          engine.onmessage = (event: { data: string }) => {
            if (!isMounted) return;
            
            const message = event.data.toString();
            
            // Engine is ready
            if (message === 'uciok') {
              setIsEngineReady(true);
              engine.postMessage('setoption name MultiPV value 1');
              engine.postMessage('setoption name Skill Level value 20');
            }
            
            // Parse evaluation data
            if (message.includes('score')) {
              const scoreMatch = message.match(/score (cp|mate) (-?\d+)/);
              const depthMatch = message.match(/depth (\d+)/);
              const pvMatch = message.match(/pv (.+?)(?=\s+\w+|$)/);
              
              if (scoreMatch && depthMatch) {
                const scoreType = scoreMatch[1];
                const scoreValue = parseInt(scoreMatch[2]);
                const currentDepth = parseInt(depthMatch[1]);
                
                // Convert score to a human-readable format
                let evalText = '';
                if (scoreType === 'cp') {
                  // Centipawns (1/100 of a pawn)
                  const evalInPawns = scoreValue / 100;
                  evalText = evalInPawns > 0 ? `+${evalInPawns.toFixed(2)}` : evalInPawns.toFixed(2);
                } else {
                  // Mate in X
                  evalText = scoreValue > 0 ? `Mate in ${scoreValue}` : `Mated in ${-scoreValue}`;
                }
                
                setEvaluation(evalText);
                setDepth(currentDepth);
                
                // Extract best move from PV
                if (pvMatch && pvMatch[1]) {
                  const moves = pvMatch[1].split(' ');
                  if (moves.length > 0) {
                    setBestMove(moves[0]);
                  }
                }
              }
            }
          };
          
          // Initialize UCI
          engine.postMessage('uci');
          engine.postMessage('isready');
        };
        
        script.onerror = () => {
          if (isMounted) {
            setError('Failed to load chess engine. Please check your internet connection and try again.');
          }
        };
        
        document.body.appendChild(script);
      } catch (err) {
        console.error('Failed to initialize Stockfish:', err);
        if (isMounted) {
          setError('Failed to initialize chess engine. Please try refreshing the page.');
        }
      }
    };

    initEngine();
    
    return () => {
      isMounted = false;
      if (engineRef.current) {
        engineRef.current.terminate();
      }
      // Clean up the script tag
      const script = document.querySelector('script[src*="stockfish.js"]');
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);
  
  // Start/stop analysis when isAnalyzing changes
  useEffect(() => {
    if (!isEngineReady || !engineRef.current) return;
    
    try {
      if (isAnalyzing) {
        // Start analysis
        engineRef.current.postMessage('position fen ' + fen);
        engineRef.current.postMessage('go depth 20');
      } else {
        // Stop analysis
        engineRef.current.postMessage('stop');
      }
    } catch (err) {
      console.error('Error during analysis:', err);
      setError('An error occurred during analysis. Please try again.');
    }
  }, [isAnalyzing, fen, isEngineReady]);
  
  // Format evaluation for display
  const formatEvaluation = () => {
    if (!evaluation) return 'No evaluation available';
    
    // For mate scores, just return the text
    if (evaluation.includes('Mate')) return evaluation;
    
    // For regular evaluations, show as a bar
    const evalValue = parseFloat(evaluation);
    const isPositive = evalValue >= 0;
    const absValue = Math.abs(evalValue);
    
    // Cap the display at 5 pawns for visual clarity
    const cappedValue = Math.min(absValue, 5);
    const percentage = (cappedValue / 5) * 100;
    
    return (
      <div className="flex items-center">
        <div className="w-24 text-right mr-2">{evaluation}</div>
        <div className="w-32 h-4 bg-gray-200 rounded overflow-hidden">
          <div 
            className={`h-full ${isPositive ? 'bg-blue-500' : 'bg-red-500'}`}
            style={{ 
              width: `${percentage}%`,
              marginLeft: isPositive ? '0' : 'auto'
            }}
          />
        </div>
      </div>
    );
  };
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="text-red-500 mb-2">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1 rounded text-sm bg-blue-500 hover:bg-blue-600 text-white"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-black">Engine Analysis</h3>
        <button
          onClick={onToggleAnalysis}
          disabled={!isEngineReady}
          className={`px-3 py-1 rounded text-sm ${
            !isEngineReady
              ? 'bg-gray-300 cursor-not-allowed'
              : isAnalyzing 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {!isEngineReady ? 'Loading...' : isAnalyzing ? 'Stop Analysis' : 'Start Analysis'}
        </button>
      </div>
      
      <div className="mt-2">
        {isAnalyzing ? (
          <>
            <div className="mb-2">
              <span className="text-sm font-medium">Depth: </span>
              <span className="text-sm">{depth}</span>
            </div>
            
            <div className="mb-2">
              <span className="text-sm font-medium">Evaluation: </span>
              {formatEvaluation()}
            </div>
            
            {bestMove && (
              <div>
                <span className="text-sm font-medium">Best Move: </span>
                <span className="text-sm">{bestMove}</span>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-500">
            {isEngineReady 
              ? 'Click "Start Analysis" to evaluate the current position.'
              : 'Initializing chess engine...'}
          </p>
        )}
      </div>
    </div>
  );
} 