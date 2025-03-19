'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useChessGames } from './hooks/useChessGames';
import { GameSelector } from './selector';
import { ChessGame } from './utils/pgnParser';

type BoardOrientation = 'white' | 'black';
type Square = string;

export default function ChessTrainerPage() {
  const { 
    categories, 
    games, 
    loading, 
    error, 
    selectedCategory, 
    setSelectedCategory
  } = useChessGames();
  const [game, setGame] = useState<Chess | null>(null);
  const [selectedGame, setSelectedGame] = useState<ChessGame | null>(null);
  const [moveIndex, setMoveIndex] = useState(-1);
  const [mode, setMode] = useState<'watch' | 'practice'>('watch');
  const [message, setMessage] = useState('Welcome! Select a game to begin watching.');
  const [boardOrientation, setBoardOrientation] = useState<BoardOrientation>('white');

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (mode !== 'watch' || !selectedGame) return;

    switch (event.key) {
      case 'ArrowLeft':
        setMoveIndex(current => {
          if (current <= -1) return -1;
          const newGame = new Chess();
          selectedGame.moves.slice(0, current).forEach(move => {
            newGame.move({ from: move.from, to: move.to });
          });
          setGame(newGame);
          return current - 1;
        });
        break;

      case 'ArrowRight':
        setMoveIndex(current => {
          if (current >= selectedGame.moves.length - 1) return current;
          const newGame = new Chess();
          selectedGame.moves.slice(0, current + 2).forEach(move => {
            newGame.move({ from: move.from, to: move.to });
          });
          setGame(newGame);
          return current + 1;
        });
        break;
    }
  }, [mode, selectedGame, setGame]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleGameSelect = (selected: ChessGame) => {
    setSelectedGame(selected);
    const newGame = new Chess();
    setGame(newGame);
    setMoveIndex(-1);
    setBoardOrientation(selected.result === 'black' ? 'black' : 'white');
    setMessage(`Selected: ${selected.title}. Use arrow keys or Next Move button to watch the game.`);
  };

  const showNextMove = () => {
    if (!selectedGame || !game) return;
    
    if (moveIndex < selectedGame.moves.length - 1) {
      const nextMove = selectedGame.moves[moveIndex + 1];
      if (game.move({ from: nextMove.from, to: nextMove.to })) {
        setGame(new Chess(game.fen()));
        setMoveIndex(prev => prev + 1);
        setMessage(`Move ${moveIndex + 2}: ${nextMove.from} to ${nextMove.to}`);
      }
    } else {
      setMessage('Game completed! Reset to watch again.');
    }
  };

  const onDrop = (sourceSquare: Square, targetSquare: Square): boolean => {
    if (!selectedGame || mode === 'watch') {
      setMessage('Please select a game and use Practice mode to make moves');
      return false;
    }

    // Get the next expected move
    const nextMoveIndex = moveIndex + 1;
    if (nextMoveIndex >= selectedGame.moves.length) {
      setMessage('Game completed! Reset to try again.');
      return false;
    }

    const expectedMove = selectedGame.moves[nextMoveIndex];
    
    if (sourceSquare === expectedMove.from && targetSquare === expectedMove.to) {
      if (game?.move({ from: sourceSquare, to: targetSquare })) {
        setGame(new Chess(game.fen()));
        setMoveIndex(nextMoveIndex);
        setMessage('Correct move! Well done!');
        return true;
      }
    }
    
    setMessage(`Incorrect move. Expected ${expectedMove.from} to ${expectedMove.to}`);
    return false;
  };

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setMoveIndex(-1);
    setMessage(selectedGame ? `Reset: ${selectedGame.title}` : 'Welcome! Select a game to begin.');
  };

  if (loading) {
    return <div>Loading chess games...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex min-h-screen">
      <GameSelector
        categories={categories}
        games={games}
        selectedGameId={selectedGame?.id ?? null}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onSelectGame={handleGameSelect}
      />
      
      <main className="flex-1 flex flex-col items-center p-8">
        <h1 className="text-3xl font-bold mb-8">Zugzwang</h1>
        
        <div className="mb-6 space-x-4">
          <button 
            onClick={() => {
              setMode(m => m === 'watch' ? 'practice' : 'watch');
              resetGame();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Switch to {mode === 'watch' ? 'Practice' : 'Watch'} Mode
          </button>

          {mode === 'watch' && (
            <button 
              onClick={showNextMove}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Next Move
            </button>
          )}
          
          <button 
            onClick={resetGame}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
          
          <button 
            onClick={() => setBoardOrientation(current => current === 'white' ? 'black' : 'white')}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            View from {boardOrientation === 'white' ? 'Black\'s' : 'White\'s'} side
          </button>
        </div>

        <div className="w-[480px] h-[480px] md:w-[600px] md:h-[600px]">
          {game && (
            <Chessboard 
              position={game.fen()}
              onPieceDrop={onDrop}
              boardOrientation={boardOrientation}
              boardWidth={600}
              customDarkSquareStyle={{ backgroundColor: '#769656' }}
              customLightSquareStyle={{ backgroundColor: '#eeeed2' }}
            />
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-lg font-medium">{message}</p>
          <p className="text-sm mt-2">
            Mode: <span className="font-semibold">{mode}</span> | 
            Moves: <span className="font-semibold">
              {moveIndex + 1}/{selectedGame?.moves.length ?? 0}
            </span>
          </p>
        </div>
      </main>
    </div>
  );
}
