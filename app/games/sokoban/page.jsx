"use client";

import React, { useState, useEffect } from "react";
import { ArrowUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2 md:flex-row">
      <Button variant="outline">Button</Button>
      <Button variant="outline" size="icon" aria-label="Submit">
        <ArrowUpIcon />
      </Button>
    </div>
  );
}

const LEVELS = [
  [
    ["W", "W", "W", "W", "W", "W"],
    ["W", "P", "C", "T", "_", "W"],
    ["W", "_", "_", "_", "_", "W"],
    ["W", "_", "C", "T", "_", "W"],
    ["W", "W", "W", "W", "W", "W"],
  ],
  [
    ["W", "W", "W", "W", "W", "W", "W"],
    ["W", "_", "_", "W", "_", "_", "W"],
    ["W", "P", "C", "T", "C", "_", "W"],
    ["W", "_", "_", "T", "_", "_", "W"],
    ["W", "W", "W", "W", "W", "W", "W"],
  ],

  [
    ["W", "W", "W", "W", "W", "W", "W", "W"],
    ["W", "P", "_", "_", "_", "_", "_", "W"],
    ["W", "_", "C", "_", "W", "_", "C", "W"],
    ["W", "_", "T", "_", "_", "_", "T", "W"],
    ["W", "W", "W", "W", "W", "W", "W", "W"],
  ],
];

export default function Sokoban() {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [grid, setGrid] = useState([]);
  const [history, setHistory] = useState([]);
  const [moves, setMoves] = useState(0);
  const [pushes, setPushes] = useState(0);

  const initLevel = (idx) => {
    const clonedGrid = LEVELS[idx].map((row) => [...row]);
    setGrid(clonedGrid);
    setHistory([]);
    setMoves(0);
    setPushes(0);
  };

  useEffect(() => {
    initLevel(currentLevelIdx);
  }, [currentLevelIdx]);

  const getPlayerPosition = (currentGrid) => {
    for (let r = 0; r < currentGrid.length; r++) {
      for (let c = 0; c < currentGrid[r].length; c++) {
        if (currentGrid[r][c] === "P" || currentGrid[r][c] === "O") {
          return { r, c };
        }
      }
    }
    return { r: 0, c: 0 };
  };

  const isSolved = () => {
    if (grid.length === 0) return false;
    return !grid.some((row) => row.includes("C") || row.includes("T"));
  };

  const handleMove = (dr, dc) => {
    if (isSolved()) return;

    const { r, c } = getPlayerPosition(grid);
    const nr = r + dr;
    const nc = c + dc;

    if (nr < 0 || nr >= grid.length || nc < 0 || nc >= grid[0].length) return;

    const targetCell = grid[nr][nc];

    if (targetCell === "_" || targetCell === "T") {
      saveHistory();
      const newGrid = grid.map((row) => [...row]);

      newGrid[r][c] = grid[r][c] === "O" ? "T" : "_";
      newGrid[nr][nc] = targetCell === "T" ? "O" : "P";

      setGrid(newGrid);
      setMoves((m) => m + 1);
    } else if (targetCell === "C" || targetCell === "B") {
      const nnr = nr + dr;
      const nnc = nc + dc;

      if (nnr < 0 || nnr >= grid.length || nnc < 0 || nnc >= grid[0].length) return;
      const nextTargetCell = grid[nnr][nnc];

      if (nextTargetCell === "_" || nextTargetCell === "T") {
        saveHistory();
        const newGrid = grid.map((row) => [...row]);

        newGrid[r][c] = grid[r][c] === "O" ? "T" : "_";
        newGrid[nr][nc] = targetCell === "B" ? "O" : "P";
        newGrid[nnr][nnc] = nextTargetCell === "T" ? "B" : "C";

        setGrid(newGrid);
        setMoves((m) => m + 1);
        setPushes((p) => p + 1);
      }
    }
  };

  const saveHistory = () => {
    setHistory([...history, { grid: grid.map((row) => [...row]), moves, pushes }]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setGrid(previous.grid);
    setMoves(previous.moves);
    setPushes(previous.pushes);
    setHistory(history.slice(0, -1));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
      switch (e.key) {
        case "ArrowUp":
          handleMove(-1, 0);
          break;
        case "ArrowDown":
          handleMove(1, 0);
          break;
        case "ArrowLeft":
          handleMove(0, -1);
          break;
        case "ArrowRight":
          handleMove(0, 1);
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [grid, history]);

  const renderCell = (cell) => {
    switch (cell) {
      case "W":
        return (
          <div className="flex h-20 w-20 items-center justify-center border border-gray-700 bg-gray-800 font-bold text-white">
            🧱
          </div>
        );
      case "P":
      case "O":
        return (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-500 text-5xl shadow-lg">
            👷
          </div>
        );
      case "C":
        return (
          <div className="flex h-20 w-20 items-center justify-center rounded border-2 border-amber-800 bg-amber-600 text-3xl">
            📦
          </div>
        );
      case "B":
        return (
          <div className="flex h-20 w-20 items-center justify-center rounded border-2 border-green-800 bg-green-600 text-3xl">
            ✅
          </div>
        );
      case "T":
        return (
          <div className="flex h-20 w-20 items-center justify-center border border-dashed border-gray-400 bg-gray-200 text-3xl font-bold text-red-500">
            🎯
          </div>
        );
      default:
        return <div className="h-20 w-20 border border-gray-200 bg-gray-100"></div>;
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 font-sans">
      <header className="mb-4 text-center">
        <a
          href="/"
          className="mb-2 inline-block text-sm font-semibold text-blue-600 hover:underline"
        >
          &larr; Back to Arcade
        </a>
        <h1 className="text-4xl font-black tracking-wide text-gray-800 uppercase">Sokoban</h1>
      </header>

      <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex space-x-6 text-sm font-medium text-gray-600">
          <div>
            Level:{" "}
            <span className="font-bold text-gray-900">
              {currentLevelIdx + 1} / {LEVELS.length}
            </span>
          </div>
          <div>
            Moves: <span className="font-bold text-gray-900">{moves}</span>
          </div>
          <div>
            Pushes: <span className="font-bold text-gray-900">{pushes}</span>
          </div>
        </div>

        <div className="flex flex-col rounded-lg border border-gray-300 bg-gray-200 p-2">
          {grid.map((row, rIdx) => (
            <div key={rIdx} className="flex">
              {row.map((cell, cIdx) => (
                <div key={cIdx}>{renderCell(cell)}</div>
              ))}
            </div>
          ))}
        </div>

        {isSolved() && (
          <div className="mt-4 w-full rounded-lg border border-green-400 bg-green-100 p-4 text-center font-bold text-green-800">
            🎉 Level Cleared! 🎉
            {currentLevelIdx < LEVELS.length - 1 ? (
              <Button
                onClick={() => setCurrentLevelIdx(currentLevelIdx + 1)}
                className="mt-2 block w-full rounded bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700"
              >
                Next Level
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentLevelIdx(0)}
                className="mt-2 block w-full rounded bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
              >
                Play Again (Level 1)
              </Button>
            )}
          </div>
        )}

        <div className="mt-6 flex w-full space-x-2">
          <Button
            onClick={() => initLevel(currentLevelIdx)}
            className="flex-1 rounded bg-red-500 px-5 py-6 font-bold text-white transition hover:bg-red-600"
          >
            Reset Level
          </Button>
          <Button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="flex-1 rounded bg-gray-500 px-5 py-6 font-bold text-white transition hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Undo
          </Button>
        </div>
      </div>
    </div>
  );
}
