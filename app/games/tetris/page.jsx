'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// --- Game Constants ---
const ROWS = 20;
const COLS = 10;

const SHAPES = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]],
};

const COLORS = {
  I: 'bg-cyan-500 border-cyan-400',
  O: 'bg-yellow-500 border-yellow-400',
  T: 'bg-purple-500 border-purple-400',
  S: 'bg-green-500 border-green-400',
  Z: 'bg-red-500 border-red-400',
  J: 'bg-blue-500 border-blue-400',
  L: 'bg-orange-500 border-orange-400',
};

const createEmptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

const getRandomTetromino = () => {
  const keys = Object.keys(SHAPES);
  const type = keys[Math.floor(Math.random() * keys.length)];
  return {
    shape: SHAPES[type],
    color: COLORS[type],
    row: 0,
    col: Math.floor((COLS - SHAPES[type][0].length) / 2),
  };
};

export default function TetrisPage() {
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const gameInterval = useRef(null);

  // --- Collision Detection ---
  const checkCollision = useCallback((piece, boardToCheck, moveRow = 0, moveCol = 0, newShape = null) => {
    const shape = newShape || piece.shape;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const nextRow = piece.row + r + moveRow;
          const nextCol = piece.col + c + moveCol;

          if (nextRow >= ROWS || nextCol < 0 || nextCol >= COLS) {
            return true;
          }
          if (nextRow >= 0 && boardToCheck[nextRow][nextCol]) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  // --- Start Game ---
  const startGame = () => {
    setBoard(createEmptyBoard());
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setCurrentPiece(getRandomTetromino());
  };

  // --- Merge Piece to Board & Clear Lines ---
  const lockPiece = useCallback((piece, currentBoard) => {
    const newBoard = currentBoard.map(row => [...row]);
    
    piece.shape.forEach((row, rIdx) => {
      row.forEach((cell, cIdx) => {
        if (cell) {
          const targetRow = piece.row + rIdx;
          if (targetRow >= 0) {
            newBoard[targetRow][piece.col + cIdx] = piece.color;
          }
        }
      });
    });

    // Clear completed rows
    let linesCleared = 0;
    const filteredBoard = newBoard.filter(row => {
      const isRowFull = row.every(cell => cell !== null);
      if (isRowFull) linesCleared++;
      return !isRowFull;
    });

    while (filteredBoard.length < ROWS) {
      filteredBoard.unshift(Array(COLS).fill(null));
    }

    if (linesCleared > 0) {
      const points =;
      setScore(prev => prev + (points[linesCleared] || 1000));
    }

    setBoard(filteredBoard);

    // Spawn new piece
    const nextPiece = getRandomTetromino();
    if (checkCollision(nextPiece, filteredBoard)) {
      setGameOver(true);
      setCurrentPiece(null);
    } else {
      setCurrentPiece(nextPiece);
    }
  }, [checkCollision]);

  // --- Move Mechanics ---
  const move = useCallback((dir) => {
    if (!currentPiece || gameOver || isPaused) return;
    if (!checkCollision(currentPiece, board, 0, dir)) {
      setCurrentPiece(prev => ({ ...prev, col: prev.col + dir }));
    }
  }, [currentPiece, board, gameOver, isPaused, checkCollision]);

  const drop = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;
    if (!checkCollision(currentPiece, board, 1, 0)) {
      setCurrentPiece(prev => ({ ...prev, row: prev.row + 1 }));
    } else {
      lockPiece(currentPiece, board);
    }
  }, [currentPiece, board, gameOver, isPaused, checkCollision, lockPiece]);

  const rotate = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;
    
    // Transpose matrix and reverse rows to rotate 90 degrees
    const nextShape = currentPiece.shape[0].map((_, val) =>
      currentPiece.shape.map(row => row[val]).reverse()
    );

    if (!checkCollision(currentPiece, board, 0, 0, nextShape)) {
      setCurrentPiece(prev => ({ ...prev, shape: nextShape }));
    }
  }, [currentPiece, board, gameOver, isPaused, checkCollision]);

  // --- Game Loop ---
  useEffect(() => {
    if (currentPiece && !gameOver && !isPaused) {
      gameInterval.current = setInterval(() => {
        drop();
      }, 700);
    }
    return () => clearInterval(gameInterval.current);
  }, [currentPiece, gameOver, isPaused, drop]);

  // --- Keyboard Event Handler ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault(); // Stop webpage scrolling
      }
      if (e.key === 'ArrowLeft') move(-1);
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowDown') drop();
      if (e.key === 'ArrowUp') rotate();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move, drop, rotate]);

  // Initialize game on mount
  useEffect(() => {
    startGame();
  }, []);

  // --- Generate View Grid Matrix ---
  const displayBoard = board.map(row => [...row]);
  if (currentPiece) {
    currentPiece.shape.forEach((row, rIdx) => {
      row.forEach((cell, cIdx) => {
        if (cell) {
          const displayRow = currentPiece.row + rIdx;
          const displayCol = currentPiece.col + cIdx;
          if (displayRow >= 0 && displayRow < ROWS && displayCol >= 0 && displayCol < COLS) {
            displayBoard[displayRow][displayCol] = currentPiece.color;
          }
        }
      });
    });
  }

  return (
    <div className="flex flex-col items-center justify-center py-6 select-none">
      <Card className="w-full max-w-sm bg-slate-900 border-slate-800 text-white shadow-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-black tracking-widest text-cyan-400">TETRIS</CardTitle>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Score</p>
              <p className="text-xl font-bold text-emerald-400">{score}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          
          {/* Main Grid View */}
          <div className="relative bg-slate-950 border-4 border-slate-800 rounded-lg p-1 grid grid-cols-10 gap-[1px]">
            {displayBoard.map((row, rIdx) =>
              row.map((cellStyle, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-[3px] border ${
                    cellStyle ? `${cellStyle} border-t-white/30 border-b-black/30` : 'bg-slate-900/40 border-slate-950'
                  }`}
                />
              ))
            )}

            {/* Screens overlays */}
            {gameOver && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-md gap-3 backdrop-blur-sm animate-fade-in">
                <p className="text-red-500 font-extrabold text-2xl tracking-wide">GAME OVER</p>
                <Button size="sm" onClick={startGame} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold">
                  Play Again
                </Button>
              </div>
            )}

            {isPaused && !gameOver && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-md backdrop-blur-sm">
                <p className="text-white font-bold text-xl tracking-wider">PAUSED</p>
              </div>
            )}
          </div>

         

    
  

