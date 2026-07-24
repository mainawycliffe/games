"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw, CheckCircle2 } from "lucide-react";

const SOLUTION_GRID = [
  ["S", "T", "A", "T", "S"], 
  ["T", "I", "D", "A", "L"], 
  ["R", "A", "D", "I", "O"], 
  ["A", "R", "E", "N", "T"], 
  ["P", "A", "R", "T", "S"]  
];

const ACROSS_CLUES = [
  { num: 1, text: "Short for numerical data or statistics" },
  { num: 6, text: "Relating to the rise and fall of sea levels" },
  { num: 7, text: "Device used to listen to broadcasts or music" },
  { num: 8, text: "Common contraction for 'are not'" },
  { num: 9, text: "Pieces or components that make up a whole" }
];

const DOWN_CLUES = [
  { num: 1, text: "A strip of flexible material used to fasten items" },
  { num: 2, text: "A jeweled crown or headband worn by royalty" },
  { num: 3, text: "A type of small venomous snake" },
  { num: 4, text: "To contaminate, spoil, or pollute something" },
  { num: 5, text: "Narrow openings for coins, or positions in a schedule" }
];

export default function CrosswordPuzzle() {
  const [userGrid, setUserGrid] = useState(() =>
    Array(5).fill(null).map(() => Array(5).fill(""))
  );
  const [statusMessage, setStatusMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 25);
  }, []);

  const getCellNumber = (row, col) => {
    if (row === 0) return col + 1; 
    if (col === 0) {
      if (row === 1) return 6;
      if (row === 2) return 7;
      if (row === 3) return 8;
      if (row === 4) return 9;
    }
    return null;
  };

  const handleInput = (row, col, value) => {
    const char = value.toUpperCase().trim();
    
    const newGrid = userGrid.map((rArr, rIdx) => 
      rArr.map((cell, cIdx) => (rIdx === row && cIdx === col ? char : cell))
    );
    setUserGrid(newGrid);
    setIsError(false);

    if (char) {
      if (col < 4) {
        inputRefs.current[row * 5 + (col + 1)]?.focus();
      } else if (col === 4 && row < 4) {
        inputRefs.current[(row + 1) * 5]?.focus();
      }
    }
  };

  const handleKeyDown = (row, col, e) => {
    const currentIndex = row * 5 + col;

    switch (e.key) {
      case 'Backspace':
        if (!userGrid[row][col]) {
          if (col > 0) {
            inputRefs.current[currentIndex - 1]?.focus();
          } else if (row > 0) {
            inputRefs.current[(row - 1) * 5 + 4]?.focus();
          }
        }
        break;
      case 'ArrowRight':
        if (col < 4) inputRefs.current[currentIndex + 1]?.focus();
        break;
      case 'ArrowLeft':
        if (col > 0) inputRefs.current[currentIndex - 1]?.focus();
        break;
      case 'ArrowDown':
        if (row < 4) inputRefs.current[currentIndex + 5]?.focus();
        break;
      case 'ArrowUp':
        if (row > 0) inputRefs.current[currentIndex - 5]?.focus();
        break;
      default:
        break;
    }
  };

  const checkSolution = () => {
    let allCorrect = true;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (userGrid[r][c] !== SOLUTION_GRID[r][c]) {
          allCorrect = false;
          break;
        }
      }
      if (!allCorrect) break;
    }
    
    setIsSuccess(allCorrect);
    setIsError(!allCorrect);
    if (allCorrect) {
      setStatusMessage("Congratulations! Your solution is fully correct!");
    } else {
      setStatusMessage("Some entries are incorrect. Double-check your clues!");
    }
  };

  const resetPuzzle = () => {
    setUserGrid(Array(5).fill(null).map(() => Array(5).fill("")));
    setStatusMessage("");
    setIsSuccess(false);
    setIsError(false);
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 0);
  };

  return (
    <div className="mx-auto max-w-xl py-8 px-4 selection:bg-transparent">
      <Card className="shadow-lg border border-muted">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-xl font-bold tracking-tight">Mini Crossword 5x5</CardTitle>
            <Badge variant={isSuccess ? "default" : "secondary"} className={isSuccess ? "bg-emerald-600 text-white" : ""}>
              {isSuccess ? "Completed" : "In Progress"}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-5 gap-1.5 w-full max-w-[270px] mx-auto bg-slate-100 dark:bg-slate-900 p-1.5 rounded-lg border border-slate-300 dark:border-slate-700">
            {userGrid.map((row, rIdx) =>
              row.map((cell, cIdx) => {
                const linearIndex = rIdx * 5 + cIdx;
                const labelNumber = getCellNumber(rIdx, cIdx);
                return (
                  <div 
                    key={linearIndex} 
                    className="relative aspect-square w-full h-full bg-background border border-slate-300 dark:border-slate-700 rounded focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 flex items-center justify-center shadow-xs"
                  >
                    {labelNumber && (
                      <span className="absolute top-0.5 left-1 text-[9px] font-bold text-slate-500 select-none leading-none z-10">
                        {labelNumber}
                      </span>
                    )}
                    <input
                      type="text"
                      ref={(el) => { inputRefs.current[linearIndex] = el; }}
                      value={cell}
                      onChange={(e) => handleInput(rIdx, cIdx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(rIdx, cIdx, e)}
                      disabled={isSuccess}
                      className="w-full h-full text-center font-black text-xl uppercase bg-transparent outline-none border-none p-0 disabled:opacity-90 disabled:text-emerald-600"
                      maxLength={1}
                      autoComplete="off"
                      spellCheck="false"
                    />
                  </div>
                );
              })
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-[270px] mx-auto">
            <Button 
              onClick={checkSolution} 
              disabled={isSuccess}
              className="w-full font-semibold flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Check Grid
            </Button>
            <Button 
              onClick={resetPuzzle} 
              variant="outline"
              className="w-full font-semibold flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Board
            </Button>
          </div>

          {statusMessage && (
            <p className={`text-sm text-center font-bold px-2 py-1 rounded ${isSuccess ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" : "text-destructive bg-destructive/10"}`}>
              {statusMessage}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border text-sm">
            <div className="space-y-2">
              <h3 className="font-bold text-emerald-600 border-b border-emerald-100 dark:border-emerald-950/50 pb-1 uppercase tracking-wider text-xs">
                Across (Horizontal)
              </h3>
              <ul className="space-y-2 text-muted-foreground text-xs leading-relaxed">
                {ACROSS_CLUES.map((clue) => (
                  <li key={clue.num} className="flex gap-1.5 items-start">
                    <strong className="text-foreground shrink-0 w-4">{clue.num}.</strong> 
                    <span>{clue.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-bold text-blue-600 border-b border-blue-100 dark:border-blue-950/50 pb-1 uppercase tracking-wider text-xs">
                Down (Vertical)
              </h3>
              <ul className="space-y-2 text-muted-foreground text-xs leading-relaxed">
                {DOWN_CLUES.map((clue) => (
                  <li key={clue.num} className="flex gap-1.5 items-start">
                    <strong className="text-foreground shrink-0 w-4">{clue.num}.</strong> 
                    <span>{clue.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
