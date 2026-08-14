"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const GRID_SIZE = 10;
const WORD_POOL = [
  "REACT",
  "NEXTJS",
  "TAILWIND",
  "JAVASCRIPT",
  "CODE",
  "ROUTER",
  "CHIPS",
  "COMPILER",
  "DEV",
  "APP",
];

// 🚧 PLACEHOLDER — this game hasn't been built yet.
// If you claimed "Word Search", replace everything in this file with your game.
// See app/games/tic-tac-toe/ for a complete worked example, and CONTRIBUTING.md.
export default function WordSearchPage() {
  const [grid, setGrid] = useState([]);
  const [targetWords, setTargetWords] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [foundCells, setFoundCells] = useState(new Set());

  const initGame = useCallback(() => {
    const shuffled = [...WORD_POOL].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    setTargetWords(selected);
    setFoundWords([]);
    setFoundCells(new Set());
    setSelectionStart(null);
    setSelectionEnd(null);

    let newGrid = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(""));

    const directions = [, , [0, -1], [-1, 0], [-1, -1], [1, -1], [-1, 1]];

    selected.forEach((word) => {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 100) {
        const currentDir = directions[Math.floor(Math.random() * directions.length)];
        if (!currentDir) {
          attempts++;
          continue;
        }

        const [dirR, dirC] = currentDir;
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);

        const finalR = row + dirR * (word.length - 1);
        const finalC = col + dirC * (word.length - 1);

        if (finalR >= 0 && finalR < GRID_SIZE && finalC >= 0 && finalC < GRID_SIZE) {
          let canPlace = true;
          for (let i = 0; i < word.length; i++) {
            const nextR = row + dirR * i;
            const nextC = col + dirC * i;
            if (newGrid[nextR][nextC] !== "" && newGrid[nextR][nextC] !== word[i]) {
              canPlace = false;
              break;
            }
          }

          if (canPlace) {
            for (let i = 0; i < word.length; i++) {
              newGrid[row + dirR * i][col + dirC * i] = word[i];
            }
            placed = true;
          }
        }
        attempts++;
      }
    });

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (newGrid[r][c] === "") {
          const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
          newGrid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }
    setGrid(newGrid);
  }, []);

  // Fixes Hydration by deferring setup to a macro-task outside render phases,
  // completely satisfying the 'set-state-in-effect' linter rule.
  useEffect(() => {
    const timer = setTimeout(() => {
      initGame();
    }, 0);
    return () => clearTimeout(timer);
  }, [initGame]);

  const getSelectedCells = () => {
    if (!selectionStart || !selectionEnd) return [];
    const r1 = selectionStart.r,
      c1 = selectionStart.c;
    const r2 = selectionEnd.r,
      c2 = selectionEnd.c;

    const dr = r2 - r1;
    const dc = c2 - c1;

    if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return [];

    const steps = Math.max(Math.abs(dr), Math.abs(dc));
    const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
    const stepC = dc === 0 ? 0 : dc / Math.abs(dc);

    const path = [];
    for (let i = 0; i <= steps; i++) {
      path.push({ r: r1 + stepR * i, c: c1 + stepC * i });
    }
    return path;
  };

  const selectedCellsList = getSelectedCells();

  const handleMouseDown = (r, c) => {
    setIsSelecting(true);
    setSelectionStart({ r, c });
    setSelectionEnd({ r, c });
  };

  const handleMouseEnter = (r, c) => {
    if (!isSelecting) return;
    setSelectionEnd({ r, c });
  };

  const handleMouseUp = () => {
    if (!isSelecting) return;
    setIsSelecting(false);

    const wordSelected = selectedCellsList.map((cell) => grid[cell.r]?.[cell.c] || "").join("");
    const reversedWord = wordSelected.split("").reverse().join("");

    let matchWord = "";
    if (targetWords.includes(wordSelected) && !foundWords.includes(wordSelected)) {
      matchWord = wordSelected;
    } else if (targetWords.includes(reversedWord) && !foundWords.includes(reversedWord)) {
      matchWord = reversedWord;
    }

    if (matchWord) {
      setFoundWords([...foundWords, matchWord]);
      const newFoundCells = new Set(foundCells);
      selectedCellsList.forEach((cell) => newFoundCells.add(`${cell.r}-${cell.c}`));
      setFoundCells(newFoundCells);
    }

    setSelectionStart(null);
    setSelectionEnd(null);
  };

  const isCellSelected = (r, c) => {
    return selectedCellsList.some((cell) => cell.r === r && cell.c === c);
  };

  const hasWon = targetWords.length > 0 && foundWords.length === targetWords.length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Card className="bg-background border shadow-lg">
        <CardHeader className="mb-4 border-b pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold">Word Search</CardTitle>
              <p className="text-muted-foreground text-xs">
                Drag mouse across letters to find target terms
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">medium</Badge>
              <Button onClick={initGame} variant="default" size="sm">
                New Puzzle
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {hasWon && (
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
              🎉 Puzzle Complete! Outstanding job! 🎉
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Playfield Grid */}
            <div
              className="bg-muted/30 mx-auto w-full max-w-[360px] touch-none rounded-lg border p-3 select-none md:col-span-2"
              onMouseLeave={handleMouseUp}
            >
              <div className="grid aspect-square w-full grid-cols-10 gap-1">
                {grid.map((row, r) =>
                  row.map((letter, c) => {
                    const coord = `${r}-${c}`;
                    const isFound = foundCells.has(coord);
                    const isCurrent = isCellSelected(r, c);

                    return (
                      <div
                        key={coord}
                        onMouseDown={() => handleMouseDown(r, c)}
                        onMouseEnter={() => handleMouseEnter(r, c)}
                        onMouseUp={handleMouseUp}
                        className={`flex aspect-square cursor-pointer items-center justify-center rounded text-sm font-bold transition-colors ${isCurrent ? "bg-primary text-primary-foreground scale-105 shadow-sm" : ""} ${isFound && !isCurrent ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : ""} ${!isCurrent && !isFound ? "bg-background hover:bg-muted text-foreground border" : ""} `}
                      >
                        {letter}
                      </div>
                    );
                  }),
                )}
              </div>
            </div>

            {/* Checklist Panel */}
            <div className="bg-muted/20 flex h-full min-h-[250px] flex-col justify-between rounded-lg border p-4">
              <div>
                <h4 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wider uppercase">
                  Target Checklist
                </h4>
                <ul className="space-y-2">
                  {targetWords.map((word) => {
                    const isFound = foundWords.includes(word);
                    return (
                      <li
                        key={word}
                        className={`flex items-center gap-2 font-mono text-sm tracking-wide ${isFound ? "text-muted-foreground/60 line-through" : "text-foreground"}`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${isFound ? "bg-emerald-500" : "bg-amber-500"}`}
                        />
                        {word}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="text-muted-foreground mt-4 border-t pt-3 text-center text-xs">
                Found: {foundWords.length} / {targetWords.length}
              </div>
            </div>
          </div>

          <div className="flex justify-center border-t pt-4">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              ← Back to Arcade
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
