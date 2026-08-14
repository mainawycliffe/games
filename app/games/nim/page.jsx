"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  createBoard,
  makeMove,
  isGameOver,
  remainingInRow,
  totalRemaining,
  isValidMove,
  findOptimalMove,
} from "./logic";

const glow = (color, intensity = 0.5) =>
  `0 0 ${intensity * 20}px ${color}, inset 0 0 ${intensity * 10}px ${color}`;

const purpleTheme = (gameOver) => ({
  card: {
    background: "linear-gradient(145deg, #2e1065 0%, #1e1b4b 100%)",
    border: "2px solid #a855f7",
    boxShadow: gameOver ? glow("#a855f7", 1.2) : "0 10px 40px -10px rgba(168, 85, 247, 0.35)",
    transition: "box-shadow 0.6s ease, border-color 0.4s ease",
  },
  rowWrap: {
    background: "linear-gradient(90deg, #4c1d95 0%, #5b21b6 50%, #4c1d95 100%)",
    padding: "0.75rem 1.5rem",
    borderRadius: "9999px",
    border: "1px solid #7e22ce",
    boxShadow: "inset 0 2px 8px rgba(0,0,0,0.3), 0 0 12px rgba(126, 34, 206, 0.3)",
  },
});

function Stone({ removed, onClick, disabled, highlight }) {
  return (
    <button
      type="button"
      aria-label={removed ? "Removed stone" : "Stone"}
      onClick={onClick}
      disabled={disabled || removed}
      className={cn(
        "size-10 rounded-full border-2 transition-all duration-200",
        removed
          ? "border-purple-900/60 bg-transparent opacity-20"
          : "border-purple-200 bg-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.6)] hover:scale-110 hover:bg-purple-300 hover:shadow-[0_0_20px_rgba(216,180,254,0.8)] active:scale-95",
        highlight &&
          !removed &&
          "animate-pulse ring-2 ring-fuchsia-400 ring-offset-2 ring-offset-purple-900",
        disabled && !removed && "cursor-not-allowed opacity-50 grayscale",
      )}
    />
  );
}

function NimRow({ row, rowIndex, selectedCount, onSelect, onConfirm, disabled, gameOver }) {
  const remaining = remainingInRow(row);
  const isSelected = selectedCount > 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-3" style={purpleTheme(gameOver).rowWrap}>
        {row.map((stone, colIndex) => {
          const wouldRemove =
            isSelected && !stone.removed && colIndex >= row.length - selectedCount;

          return (
            <Stone
              key={stone.id}
              removed={stone.removed}
              disabled={disabled || gameOver || stone.removed}
              highlight={wouldRemove}
              onClick={() => onSelect(rowIndex, colIndex)}
            />
          );
        })}
      </div>

      {isSelected && (
        <div className="mt-1 flex items-center gap-2">
          <Badge
            variant="secondary"
            className="border-purple-600 bg-purple-800/80 text-purple-200 hover:bg-purple-700"
          >
            {selectedCount} selected
          </Badge>
          <Button
            size="sm"
            onClick={() => onConfirm(rowIndex, selectedCount)}
            disabled={!isValidMove([row], 0, selectedCount)}
            className="bg-fuchsia-600 text-white shadow-[0_0_10px_rgba(192,38,211,0.5)] hover:bg-fuchsia-500"
          >
            Remove
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onSelect(rowIndex, -1)}
            className="text-purple-300 hover:bg-purple-800/50 hover:text-purple-100"
          >
            Cancel
          </Button>
        </div>
      )}

      {remaining > 0 && !isSelected && (
        <span className="text-xs font-medium tracking-wide text-purple-300/80">
          {remaining} left
        </span>
      )}
    </div>
  );
}

export default function NimPage() {
  const [board, setBoard] = useState(() => createBoard());
  const [turn, setTurn] = useState("player");
  const [selected, setSelected] = useState({ rowIndex: -1, count: 0 });
  const [message, setMessage] = useState("Your turn! Click stones to select, then confirm.");
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [computerThinking, setComputerThinking] = useState(false);

  const reset = useCallback(() => {
    setBoard(createBoard());
    setTurn("player");
    setSelected({ rowIndex: -1, count: 0 });
    setMessage("Your turn! Click stones to select, then confirm.");
    setGameOver(false);
    setWinner(null);
    setComputerThinking(false);
  }, []);

  const checkGameOver = useCallback((newBoard, whoJustMoved) => {
    if (isGameOver(newBoard)) {
      setGameOver(true);
      const winnerName = whoJustMoved === "player" ? "Computer" : "You";
      setWinner(winnerName);
      setMessage(
        `${whoJustMoved === "player" ? "You" : "Computer"} took the last stone:  ${winnerName} win!`,
      );
      return true;
    }
    return false;
  }, []);

  const handleSelect = useCallback(
    (rowIndex, colIndex) => {
      if (gameOver || turn !== "player" || computerThinking) return;

      setSelected((prev) => {
        if (colIndex === -1) return { rowIndex: -1, count: 0 };

        if (prev.rowIndex !== -1 && prev.rowIndex !== rowIndex) {
          const row = board[rowIndex];
          const remaining = remainingInRow(row);
          return { rowIndex, count: remaining };
        }

        const row = board[rowIndex];
        const remaining = remainingInRow(row);
        const nextCount = prev.rowIndex === rowIndex ? (prev.count % remaining) + 1 : 1;
        return { rowIndex, count: nextCount };
      });
    },
    [board, gameOver, turn, computerThinking],
  );

  const handleConfirm = useCallback(
    (rowIndex, count) => {
      if (gameOver || turn !== "player" || computerThinking) return;
      if (!isValidMove(board, rowIndex, count)) return;

      const nextBoard = makeMove(board, rowIndex, count);
      setBoard(nextBoard);
      setSelected({ rowIndex: -1, count: 0 });

      if (checkGameOver(nextBoard, "player")) return;

      setTurn("computer");
      setMessage("Computer is thinking...");
      setComputerThinking(true);

      setTimeout(() => {
        setComputerThinking(false);
        const aiMove = findOptimalMove(nextBoard);
        if (aiMove) {
          const afterAi = makeMove(nextBoard, aiMove.rowIndex, aiMove.count);
          setBoard(afterAi);

          if (checkGameOver(afterAi, "computer")) return;

          setTurn("player");
          setMessage(
            `Computer removed ${aiMove.count} from row ${aiMove.rowIndex + 1}. Your turn!`,
          );
        }
      }, 800);
    },
    [board, gameOver, turn, computerThinking, checkGameOver],
  );

  const totalLeft = totalRemaining(board);
  const isPlayer = turn === "player";

  return (
    <div className="mx-auto my-8 max-w-lg p-4">
      <Card className="border-0" style={purpleTheme(gameOver).card}>
        <CardHeader className="border-b border-purple-800/50 pb-4">
          <CardTitle className="flex items-center justify-between">
            <span className="text-2xl font-extrabold tracking-wider text-purple-100 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]">
              NIM
            </span>
            <Badge
              className={cn(
                "rounded-md border-none px-3 py-1 text-sm font-bold transition-all duration-300",
                gameOver &&
                  "animate-pulse bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(192,38,211,0.7)]",
                !gameOver &&
                  isPlayer &&
                  "bg-purple-400 text-purple-950 shadow-[0_0_12px_rgba(192,132,252,0.6)]",
                !gameOver && !isPlayer && "bg-purple-800 text-purple-200",
              )}
            >
              {gameOver ? "Game Over" : isPlayer ? "Your Turn" : "Computer's Turn"}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center justify-between text-sm font-semibold tracking-wide">
            <span className="text-purple-300/90">You lose when you take the last stone</span>
            <span className="font-mono text-purple-200">{totalLeft} stones</span>
          </div>

          <p
            aria-live="polite"
            className={cn(
              "text-center text-lg font-bold tracking-wide transition-all duration-500",
              winner === "You" &&
                "text-2xl text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]",
              winner === "Computer" &&
                "text-2xl text-rose-400 drop-shadow-[0_0_12px_rgba(251,113,133,0.6)]",
              computerThinking && "animate-pulse text-purple-300",
              !winner && !computerThinking && "text-purple-200",
            )}
            data-testid="status"
          >
            {message}
          </p>

          <div className="space-y-5">
            {board.map((row, rowIndex) => (
              <NimRow
                key={rowIndex}
                row={row}
                rowIndex={rowIndex}
                selectedCount={selected.rowIndex === rowIndex ? selected.count : 0}
                onSelect={handleSelect}
                onConfirm={handleConfirm}
                disabled={!isPlayer || computerThinking}
                gameOver={gameOver}
              />
            ))}
          </div>

          <div className="flex justify-center pt-2">
            <Button
              onClick={reset}
              variant="outline"
              className="rounded-full border-2 border-purple-400 bg-transparent px-8 py-2 font-bold text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all hover:bg-purple-400 hover:text-purple-950 hover:shadow-[0_0_25px_rgba(192,132,252,0.5)]"
            >
              New Game
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
