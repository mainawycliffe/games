"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function ReactionTimePage() {
  const [gameState, setGameState] = useState("idle");
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [timerId, setTimerId] = useState(null);

  const isFoul = gameState === "foul";
  const isResult = gameState === "result";
  const isWaiting = gameState === "waiting";
  const isReady = gameState === "ready";
  const isIdle = gameState === "idle";

  let status = "";
  if (isWaiting) {
    status = "Hold steady... Wait for GREEN!";
  } else if (isReady) {
    status = "CLICK NOW!";
  } else if (isFoul) {
    status = "Too early! You clicked before it turned green.";
  } else if (isResult) {
    status = `Your reaction speed: ${score} ms`;
  } else {
    status = "Click the pad below to start the reflex test.";
  }
  function startTheGame() {
    setGameState("waiting");
    const randomTime = Math.floor(Math.random() * 3000) + 2000;

    const newTimer = setTimeout(() => {
      setGameState("ready");
      setStartTime(Date.now());
    }, randomTime);

    setTimerId(newTimer);
  }

  function handleClick() {
    if (isIdle || isResult || isFoul) {
      startTheGame();
    } else if (isWaiting) {
      clearTimeout(timerId);
      setGameState("foul");
    } else if (isReady) {
      const clickTime = Date.now();
      const difference = clickTime - startTime;

      setScore(difference);
      setGameState("result");

      if (bestScore === 0 || difference < bestScore) {
        setBestScore(difference);
      }
    }
  }

  function reset() {
    if (timerId) clearTimeout(timerId);
    setGameState("idle");
    setScore(0);
    setBestScore(0);
    setStartTime(0);
    setTimerId(null);
  }

  return (
    <div className="mx-auto max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>Reaction Time Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p
            aria-live="polite"
            className="min-h-[56px] text-center text-lg font-medium"
            data-testid="status"
          >
            {status}
          </p>

          <div className="mx-auto flex w-full justify-center">
            <button
              type="button"
              onClick={handleClick}
              className={cn(
                "flex h-48 w-full flex-col items-center justify-center rounded-xl border text-2xl font-bold uppercase transition-all duration-100 select-none",
                isIdle &&
                  "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
                isWaiting && "animate-pulse border-rose-600 bg-rose-500 text-white",
                isReady && "scale-[1.02] border-emerald-600 bg-emerald-500 text-white",
                isFoul && "border-amber-600 bg-amber-500 text-white",
                isResult && "border-sky-600 bg-sky-500 text-white",
              )}
            >
              {isReady ? "TAP NOW!" : "CLICK TO PLAY"}
            </button>
          </div>

          <div className="text-muted-foreground flex items-center justify-between border-t pt-4 text-sm font-medium">
            <div>
              Best Score:{" "}
              <span className="text-foreground font-bold">
                {bestScore === 0 ? "-" : `${bestScore} ms`}
              </span>
            </div>
            <Button onClick={reset} variant="outline">
              New Game
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
