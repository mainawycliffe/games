"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { initializeGame, makeMove, checkWin, getMinimumMoves } from "./logic";

export default function TowerOfHanoiPage() {
  // How many disks are currently active
  const [diskCount, setDiskCount] = useState(3);
  const [rods, setRods] = useState(() => initializeGame(3));
  const [moves, setMoves] = useState(0);

  // Reset handler
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
    <div className="mx-auto max-w-2xl px-4 py-12 select-none">
      <Card className="overflow-hidden border-slate-800 bg-slate-950 text-white shadow-2xl">
        <CardHeader className="border-b border-slate-800 pb-4 text-center">
          <CardTitle className="text-xl font-bold tracking-tight">Tower of Hanoi</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-6 pt-6">
          <div className="relative flex h-64 w-full items-end justify-around rounded-xl border border-slate-900 bg-slate-900/40 px-4 py-6">
            {rods.map((peg, pegIndex) => {
              return (
                <div
                  key={pegIndex}
                  data-testid={`rod-${pegIndex}`}
                  className="group relative flex h-full w-32 flex-col items-center justify-end"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, pegIndex)}
                >
                  <div className="absolute bottom-2 h-48 w-2.5 rounded-t-full bg-red-600 transition-colors group-hover:bg-red-500" />

                  <div className="z-10 mb-2 flex w-full flex-col-reverse items-center gap-1">
                    {peg.map((diskWidth, index) => {
                      const widthPercent = (diskWidth / diskCount) * 100;
                      const colors = [
                        "bg-emerald-400",
                        "bg-cyan-400",
                        "bg-purple-400",
                        "bg-amber-400",
                        "bg-pink-400",
                        "bg-indigo-400",
                        "bg-orange-400",
                      ];
                      const colorClass = colors[diskWidth % colors.length];
                      const isTopDisk = index === peg.length - 1;

                      return (
                        <div
                          key={index}
                          draggable={isTopDisk}
                          onDragStart={(e) => handleDragStart(e, pegIndex)}
                          data-testid={isTopDisk ? `top-disk-rod-${pegIndex}` : undefined}
                          className={`h-5 rounded-full border border-black/20 shadow-sm transition-transform ${colorClass} ${
                            isTopDisk
                              ? "cursor-grab hover:brightness-110 active:cursor-grabbing"
                              : ""
                          }`}
                          style={{ width: `${Math.max(widthPercent, 35)}%` }}
                        />
                      );
                    })}
                  </div>

                  <div className="h-2.5 w-full rounded-full bg-red-600" />
                </div>
              );
            })}
          </div>

          <div className="grid w-full grid-cols-3 items-center gap-4 rounded-xl border border-slate-900 bg-slate-900/30 p-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-400">Disks:</span>
              <div className="flex items-center gap-1 rounded-md border border-slate-800 bg-slate-950 px-2 py-1">
                <span className="w-5 text-center text-sm font-bold text-cyan-400">{diskCount}</span>
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

            <div
              className="text-center text-sm font-medium text-slate-400"
              data-testid="move-counter"
            >
              Moves: <span className="font-bold text-blue-400">{moves}</span>
            </div>

            <div className="text-right">
              <Button
                variant="secondary"
                size="sm"
                className="border border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
                onClick={() => handleReset(diskCount)}
              >
                Restart
              </Button>
            </div>
          </div>

          <div className="flex w-full items-center justify-between border-t border-slate-900 pt-4 font-mono text-xs text-slate-500">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Info className="h-3.5 w-3.5 shrink-0 text-blue-400" />
              <span>
                Drag the top disk to another rod. Larger disks cannot sit on smaller ones.
              </span>
            </div>
            <div className="ml-4 whitespace-nowrap">
              Minimum Moves: {getMinimumMoves(diskCount)}
            </div>
          </div>

          {isWon && (
            <div className="w-full animate-pulse rounded-lg border border-emerald-900/50 bg-emerald-950/30 py-3 text-center text-sm font-bold tracking-wide text-emerald-400">
              🎉 Puzzle Solved Successfully in {moves} moves!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
