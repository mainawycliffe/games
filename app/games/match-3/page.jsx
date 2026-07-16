"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const BOARD_SIZE = 6;
const GEM_COLORS = [
  "🍬",
  "🍭 ",
  "🍫",
  "🍩",
  "🍪",
  "🧁"
];

export default function Match3Page() {
  const [board, setBoard] = useState([]);
  const [score, setScore] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);

  const createBoard = useCallback(() => {
    let freshBoard = [];
    let attempts = 0;

    const causesMatch = (boardArray, index, color) => {
      const row = Math.floor(index / BOARD_SIZE);
      const col = index % BOARD_SIZE;

      if (col >= 2) {
        if (boardArray[index - 1] === color && boardArray[index - 2] === color) return true;
      }

      if (row >= 2) {
        if (
          boardArray[index - BOARD_SIZE] === color &&
          boardArray[index - BOARD_SIZE * 2] === color
        )
          return true;
      }
      return false;
    };

    while (attempts < 50) {
      freshBoard = [];
      let valid = true;

      for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        const allowedColors = GEM_COLORS.filter((color) => !causesMatch(freshBoard, i, color));

        if (allowedColors.length === 0) {
          valid = false;
          break;
        }

        const pickedColor = allowedColors[Math.floor(Math.random() * allowedColors.length)];
        freshBoard.push(pickedColor);
      }

      if (valid) break;
      attempts++;
    }

    setBoard(freshBoard);
    setScore(0);
  }, []);

  const checkForMatches = useCallback(() => {
    let hasMatches = false;
    let newBoard = [...board];
    let matchedIndices = new Set();

    if (newBoard.length === 0) return false;

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE - 2; c++) {
        const idx1 = r * BOARD_SIZE + c;
        const idx2 = idx1 + 1;
        const idx3 = idx1 + 2;
        const color = newBoard[idx1];

        if (color && newBoard[idx2] === color && newBoard[idx3] === color) {
          matchedIndices.add(idx1);
          matchedIndices.add(idx2);
          matchedIndices.add(idx3);
          hasMatches = true;
        }
      }
    }

    for (let c = 0; c < BOARD_SIZE; c++) {
      for (let r = 0; r < BOARD_SIZE - 2; r++) {
        const idx1 = r * BOARD_SIZE + c;
        const idx2 = idx1 + BOARD_SIZE;
        const idx3 = idx1 + BOARD_SIZE * 2;
        const color = newBoard[idx1];

        if (color && newBoard[idx2] === color && newBoard[idx3] === color) {
          matchedIndices.add(idx1);
          matchedIndices.add(idx2);
          matchedIndices.add(idx3);
          hasMatches = true;
        }
      }
    }

    if (hasMatches) {
      matchedIndices.forEach((idx) => {
        newBoard[idx] = null;
      });
      setScore((prev) => prev + matchedIndices.size * 10);
      setBoard(newBoard);
    }
    return hasMatches;
  }, [board]);

  const dropGems = useCallback(() => {
    let newBoard = [...board];
    let shifted = false;

    if (newBoard.length === 0) return;

    for (let r = BOARD_SIZE - 2; r >= 0; r--) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const currentIdx = r * BOARD_SIZE + c;
        const belowIdx = currentIdx + BOARD_SIZE;

        if (newBoard[currentIdx] !== null && newBoard[belowIdx] === null) {
          newBoard[belowIdx] = newBoard[currentIdx];
          newBoard[currentIdx] = null;
          shifted = true;
        }
      }
    }

    for (let c = 0; c < BOARD_SIZE; c++) {
      if (newBoard[c] === null) {
        newBoard[c] = GEM_COLORS[Math.floor(Math.random() * GEM_COLORS.length)];
        shifted = true;
      }
    }

    if (shifted) {
      setBoard(newBoard);
    }
  }, [board]);

  useEffect(() => {
    if (board.length === 0) return;

    const timer = setTimeout(() => {
      const matched = checkForMatches();
      if (!matched) {
        if (board.includes(null)) {
          dropGems();
        }
      } else {
        dropGems();
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [board, checkForMatches, dropGems]);

  const handleTileClick = (index) => {
    if (selectedIdx === null) {
      setSelectedIdx(index);
    } else if (selectedIdx === index) {
      setSelectedIdx(null);
    } else {
      const row1 = Math.floor(selectedIdx / BOARD_SIZE);
      const col1 = selectedIdx % BOARD_SIZE;
      const row2 = Math.floor(index / BOARD_SIZE);
      const col2 = index % BOARD_SIZE;
      const isAdjacent = Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;

      if (isAdjacent) {
        const newBoard = [...board];
        const temp = newBoard[selectedIdx];
        newBoard[selectedIdx] = newBoard[index];
        newBoard[index] = temp;

        setBoard(newBoard);
        setSelectedIdx(null);
      } else {
        setSelectedIdx(index);
      }
    }
  };

  return (
    <div className="container mx-auto flex max-w-xl flex-col items-center gap-6 px-4 py-8">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-2xl font-bold">Match 3 Engine</CardTitle>

            <p className="text-muted-foreground mt-1 text-sm">
              Swap adjacent snacks to align 3 or more!<br></br>
              <strong>
                Tap on one snack,then tap on another snack and they will automatically swap
              </strong>
            </p>
          </div>

          <Badge variant="secondary" className="px-3 py-1 text-sm font-semibold">
            Score: {score}
          </Badge>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-6">
          <div
            className="grid gap-2 rounded-xl border bg-zinc-900 p-4 shadow-inner"
            style={{
              gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
            }}
          >
            {board.map((gem, idx) => (
              <button
                key={idx}
                onClick={() => handleTileClick(idx)}
                className={`flex h-14 w-14 items-center justify-center rounded-lg text-3xl transition-all duration-100 active:scale-95 sm:h-16 sm:w-16 ${
                  selectedIdx === idx
                    ? "ring-primary z-10 scale-105 bg-zinc-700 ring-4"
                    : "bg-zinc-800 hover:bg-zinc-700"
                }`}
              >
                {gem}
              </button>
            ))}
          </div>

          <div className="flex w-full gap-4">
            <Button onClick={createBoard} className="flex-1" variant="outline">
              Reset Game
            </Button>

           
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
