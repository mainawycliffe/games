"use client";

import { useState } from "react";

import confetti from "canvas-confetti";

const ROWS = 8;
const COLS = 8;

const JEWELS = [
  "/ruby.png",
  "/saphire.png",
  "/emarald.png",
  "/topaz.png",
  "/aamethyst.png",
  "/amber.png",
];

function createBoard() {
  return Array.from({ length: ROWS }, () =>
    Array.from(
      { length: COLS },
      () => JEWELS[Math.floor(Math.random() * JEWELS.length)]
    )
  );
}

export default function BejeweledPage() {
  const [board, setBoard] = useState(createBoard());
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(20);
  const [selectedTile, setSelectedTile] = useState(null);

  function newGame() {
    setBoard(createBoard());
    setScore(0);
    setMoves(20);
    setSelectedTile(null);
  }

  
  function triggerMatchGlitter() {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#ff0055", "#0099ff", "#00ff66", "#ffcc00", "#cc33ff"],
    });
  }

 
  function triggerWinGlitter() {
    let duration = 3 * 1000;
    let end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#ffd700", "#ff00a0", "#00e5ff"],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#ffd700", "#ff00a0", "#00e5ff"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }

  function findMatches(currentBoard) {
    let matchedGrid = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => false));
    let hasMatch = false;

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (c + 2 < COLS && currentBoard[r][c] && currentBoard[r][c] === currentBoard[r][c + 1] && currentBoard[r][c] === currentBoard[r][c + 2]) {
          matchedGrid[r][c] = true;
          matchedGrid[r][c + 1] = true;
          matchedGrid[r][c + 2] = true;
          hasMatch = true;
        }
        if (r + 2 < ROWS && currentBoard[r][c] && currentBoard[r][c] === currentBoard[r + 1][c] && currentBoard[r][c] === currentBoard[r + 2][c]) {
          matchedGrid[r][c] = true;
          matchedGrid[r + 1][c] = true;
          matchedGrid[r + 2][c] = true;
          hasMatch = true;
        }
      }
    }
    return { hasMatch, matchedGrid };
  }

  function applyGravity(currentBoard, matchedGrid) {
    let nextBoard = JSON.parse(JSON.stringify(currentBoard));
    let pointsGained = 0;

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (matchedGrid[r][c]) {
          nextBoard[r][c] = null;
          pointsGained += 10;
        }
      }
    }

    for (let c = 0; c < COLS; c++) {
      let remainingJewels = [];
      for (let r = ROWS - 1; r >= 0; r--) {
        if (nextBoard[r][c] !== null) remainingJewels.push(nextBoard[r][c]);
      }
      while (remainingJewels.length < ROWS) {
        remainingJewels.push(JEWELS[Math.floor(Math.random() * JEWELS.length)]);
      }
      remainingJewels.reverse();
      for (let r = 0; r < ROWS; r++) {
        nextBoard[r][c] = remainingJewels[r];
      }
    }

    setScore((prev) => prev + pointsGained);
    return nextBoard;
  }

  function handleTileClick(r, c) {
    if (moves <= 0) return;

    if (!selectedTile) {
      setSelectedTile({ r, c });
      return;
    }

    const rowDiff = Math.abs(selectedTile.r - r);
    const colDiff = Math.abs(selectedTile.c - c);
    const isAdjacent = (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);

    if (!isAdjacent) {
      setSelectedTile({ r, c });
      return;
    }

    let workingBoard = JSON.parse(JSON.stringify(board));
    const temp = workingBoard[selectedTile.r][selectedTile.c];
    workingBoard[selectedTile.r][selectedTile.c] = workingBoard[r][c];
    workingBoard[r][c] = temp;

    const { hasMatch, matchedGrid } = findMatches(workingBoard);

    if (hasMatch) {
      // 1. Trigger beautiful match glitter immediately
      triggerMatchGlitter();

      const nextMovesValue = moves - 1;
      setMoves(nextMovesValue);

      let updatedBoard = applyGravity(workingBoard, matchedGrid);

      let cascadeCheck = findMatches(updatedBoard);
      while (cascadeCheck.hasMatch) {
       
        triggerMatchGlitter();
        updatedBoard = applyGravity(updatedBoard, cascadeCheck.matchedGrid);
        cascadeCheck = findMatches(updatedBoard);
      }

      setBoard(updatedBoard);

    
      if (nextMovesValue <= 0) {
        triggerWinGlitter();
      }
    }

    setSelectedTile(null);
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-900 p-6 select-none">
      <div className="bg-slate-800 rounded-xl shadow-2xl p-8">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">💎 Bejeweled</h1>
          <button
            onClick={newGame}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            New Game
          </button>
        </div>

        <div className="flex justify-between mb-6 text-white text-lg">
          <span>Score: {score}</span>
          <span>Moves: {moves}</span>
        </div>

        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${COLS}, 52px)` }}
        >
          {board.map((row, r) =>
            row.map((imageSrc, c) => {
              const isSelected = selectedTile && selectedTile.r === r && selectedTile.c === c;

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleTileClick(r, c)}
                  className={`w-13 h-13 flex items-center justify-center cursor-pointer rounded-lg border border-transparent transition-colors hover:bg-slate-700/40
                    ${isSelected ? "bg-slate-700/80 border-slate-500 shadow-lg scale-105" : ""}
                  `}
                >
                  <img
                    src={imageSrc}
                    alt="Jewel"
                    className={`w-11 h-11 object-contain pointer-events-none transition-transform duration-300
                      ${isSelected ? "rotate-180" : "rotate-0"}
                    `}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <span className="hidden text-xs text-slate-400 capitalize font-mono">
                    {imageSrc.split("/").pop().replace(".png", "")}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {moves <= 0 && (
          <div className="mt-6 text-center bg-gradient-to-r from-yellow-600/30 to-amber-600/30 border border-yellow-500/50 p-4 rounded-xl text-yellow-400 font-extrabold animate-bounce">
            ✨ Final Score: {score} ✨
          </div>
        )}

      </div>
    </div>
  );
}
