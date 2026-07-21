"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { initializeGame, makeMove, checkWin, getMinimumMoves } from "./logic";

export default function TowerOfHanoiPage() {
  const [diskCount, setDiskCount] = useState(3);
  const [rods, setRods] = useState(() => initializeGame(3));
  const [moves, setMoves] = useState(0);

  const handleReset = (count = diskCount) => {
    setDiskCount(count);
    setRods(initializeGame(count));
    setMoves(0);
  };

  const handleDragStart = (e, fromPegIndex) => {
    e.dataTransfer.setData("text/plain", fromPegIndex.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, toPegIndex) => {
    e.preventDefault();
    const fromPegIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    
    if (isNaN(fromPegIndex)) return;

    const nextRods = makeMove(rods, fromPegIndex, toPegIndex);
    if (nextRods !== rods) {
      setRods(nextRods);
      setMoves((prev) => prev + 1);
    }
  };

  const isWon = checkWin(rods, diskCount);

  return (
    <div className="mx-auto max-w-2xl py-12 px-4 select-none">
      <Card className="bg-slate-950 text-white border-slate-800 shadow-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-800 pb-4 text-center">
          <CardTitle className="text-xl font-bold tracking-tight">
            Tower of Hanoi
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6 flex flex-col gap-6">
          <div className="flex justify-around items-end w-full h-64 relative px-4 bg-slate-900/40 rounded-xl py-6 border border-slate-900">
            {rods.map((peg, pegIndex) => {
              return (
                <div 
                  key={pegIndex} 
                  data-testid={`rod-${pegIndex}`}
                  className="flex flex-col items-center justify-end w-32 h-full relative group"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, pegIndex)}
                >
                  <div className="w-2.5 h-48 rounded-t-full transition-colors absolute bottom-2 bg-red-600 group-hover:bg-red-500" />

                  <div className="w-full flex flex-col-reverse items-center z-10 mb-2 gap-1">
                    {peg.map((diskWidth, index) => {
                      const widthPercent = (diskWidth / diskCount) * 100;
                      const colors = ["bg-emerald-400", "bg-cyan-400", "bg-purple-400", "bg-amber-400", "bg-pink-400", "bg-indigo-400", "bg-orange-400"];
                      const colorClass = colors[diskWidth % colors.length];
                      const isTopDisk = index === peg.length - 1;

                      return (
                        <div
                          key={index}
                          draggable={isTopDisk}
                          onDragStart={(e) => handleDragStart(e, pegIndex)}
                          data-testid={isTopDisk ? `top-disk-rod-${pegIndex}` : undefined}
                          className={`h-5 rounded-full border border-black/20 shadow-sm transition-transform ${colorClass} ${
                            isTopDisk ? "cursor-grab active:cursor-grabbing hover:brightness-110" : ""
                          }`}
                          style={{ width: `${Math.max(widthPercent, 35)}%` }}
                        />
                      );
                    })}
                  </div>

                  <div className="w-full h-2.5 bg-red-600 rounded-full" />
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 items-center w-full gap-4 bg-slate-900/30 p-4 rounded-xl border border-slate-900">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-400">Disks:</span>
              <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                <span className="w-5 text-center font-bold text-sm text-cyan-400">{diskCount}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-slate-400 hover:text-white"
                  disabled={diskCount <= 3}
                  onClick={() => handleReset(diskCount - 1)}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-slate-400 hover:text-white"
                  disabled={diskCount >= 7}
                  onClick={() => handleReset(diskCount + 1)}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="text-sm font-medium text-slate-400 text-center" data-testid="move-counter">
              Moves: <span className="text-blue-400 font-bold">{moves}</span>
            </div>

            <div className="text-right">
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                onClick={() => handleReset(diskCount)}
              >
                Restart
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center w-full text-xs text-slate-500 font-mono border-t border-slate-900 pt-4">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Info className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span>Drag the top disk to another rod. Larger disks cannot sit on smaller ones.</span>
            </div>
            <div className="whitespace-nowrap ml-4">
              Minimum Moves: {getMinimumMoves(diskCount)}
            </div>
          </div>

          {isWon && (
            <div className="w-full text-center font-bold text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 py-3 rounded-lg animate-pulse tracking-wide text-sm">
              🎉 Puzzle Solved Successfully in {moves} moves!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
