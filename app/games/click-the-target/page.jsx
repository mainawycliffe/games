"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const GAME_DURATION = 30;
const TARGET_SIZE = 48;

function useHighScore() {
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("click-the-target-highscore");
    if (saved) {
      setTimeout(() => {
        setHighScore(parseInt(saved, 10));
      }, 0);
    }
  }, []);

  const saveHighScore = useCallback((score) => {
    setHighScore((prev) => {
      if (score > prev) {
        localStorage.setItem("click-the-target-highscore", score.toString());
        return score;
      }
      return prev;
    });
  }, []);

  return [highScore, saveHighScore];
}

export default function ClickTheTargetPage() {
  const [gameState, setGameState] = useState("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [target, setTarget] = useState({ x: 50, y: 50 });
  const [highScore, saveHighScore] = useHighScore();
  const [misses, setMisses] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const playAreaRef = useRef(null);
  const timerRef = useRef(null);
  const scoreRef = useRef(0);

  useEffect(() => {
    setTimeout(() => {
      setIsMounted(true);
    }, 0);
  }, []);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    if (gameState === "ended") {
      saveHighScore(scoreRef.current);
    }
  }, [gameState, saveHighScore]);

  const spawnTarget = useCallback(() => {
    if (!playAreaRef.current) return;
    const rect = playAreaRef.current.getBoundingClientRect();
    const maxX = rect.width - TARGET_SIZE;
    const maxY = rect.height - TARGET_SIZE;
    const x = Math.random() * maxX;
    const y = Math.random() * maxY;
    setTarget({ x, y });
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setMisses(0);
    setTimeLeft(GAME_DURATION);
    setGameState("playing");
    setTimeout(spawnTarget, 50);
  }, [spawnTarget]);

  useEffect(() => {
    if (gameState !== "playing") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setGameState("ended");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameState]);

  const handleTargetClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (gameState !== "playing") return;
      setScore((prev) => prev + 1);
      spawnTarget();
    },
    [gameState, spawnTarget],
  );

  const handleMiss = useCallback(() => {
    if (gameState !== "playing") return;
    setMisses((prev) => prev + 1);
  }, [gameState]);

  useEffect(() => {
    const handleResize = () => {
      if (gameState === "playing") spawnTarget();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [gameState, spawnTarget]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Card className="border-slate-800 bg-slate-950 shadow-2xl shadow-indigo-950/20">
        <CardHeader className="border-b border-slate-900 pb-4">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
              Click the Target
            </CardTitle>
            <Badge className="border-indigo-500/20 bg-indigo-500/10 text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
              easy
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-900 bg-slate-900/40 p-4 text-sm backdrop-blur-md">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Performance
              </span>
              <div className="flex gap-4">
                <span className="font-bold text-slate-200">
                  Score: <span className="text-emerald-400">{score}</span>
                </span>
                <span className="font-semibold text-slate-400">
                  Misses: <span className="text-slate-300">{misses}</span>
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Session
              </span>
              <div className="flex gap-4">
                <span className="font-bold text-slate-200">
                  Time:{" "}
                  <span
                    className={timeLeft <= 5 ? "animate-pulse text-rose-400" : "text-amber-400"}
                  >
                    {timeLeft}s
                  </span>
                </span>
                <span className="font-semibold text-slate-400">
                  Best: <span className="text-indigo-400">{isMounted ? highScore : 0}</span>
                </span>
              </div>
            </div>
          </div>

          <div
            ref={playAreaRef}
            onClick={handleMiss}
            className="relative h-80 w-full cursor-crosshair overflow-hidden rounded-xl border border-slate-900 bg-slate-950 bg-[linear-gradient(to_right,#1e293b50_1px,transparent_1px),linear-gradient(to_bottom,#1e293b50_1px,transparent_1px)] bg-[size:24px_24px] shadow-inner transition-colors duration-300"
          >
            {gameState === "idle" && (
              <div className="flex h-full flex-col items-center justify-center gap-5 p-6 text-center">
                <p className="max-w-xs text-sm leading-relaxed font-medium text-slate-400">
                  Test your reflexes. Click as many targets as you can before the clock runs out!
                </p>
                <Button
                  onClick={startGame}
                  size="lg"
                  className="bg-indigo-600 font-bold tracking-wide text-white shadow-lg shadow-indigo-600/30 transition-all duration-200 hover:bg-indigo-500 hover:shadow-indigo-500/40 active:scale-95"
                >
                  Start Mission
                </Button>
              </div>
            )} http://localhost:3000

            {gameState === "playing" && (
              <button
                onClick={handleTargetClick}
                className="absolute flex items-center justify-center rounded-full border border-rose-400 bg-gradient-to-br from-rose-500 to-red-600 p-1 shadow-lg shadow-rose-500/40 transition-all duration-150 hover:scale-110 active:scale-90"
                style={{
                  left: target.x,
                  top: target.y,
                  width: TARGET_SIZE,
                  height: TARGET_SIZE,
                }}
                aria-label="Target"
              >
                <span className="h-2 w-2 animate-pulse rounded-full bg-white shadow-sm" />
              </button>
            )}

            {gameState === "ended" && (
              <div className="flex h-full flex-col items-center justify-center gap-5 bg-slate-950/80 p-6 backdrop-blur-sm">
                <div className="space-y-1 text-center">
                  <p className="bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-3xl font-black tracking-tight text-transparent uppercase">
                    Time&apos;s Up!
                  </p>
                  <p className="text-sm font-medium text-slate-400">
                    Final Score: <span className="text-lg font-bold text-emerald-400">{score}</span>
                  </p>
                  {score > 0 && score >= highScore && isMounted && (
                    <p className="mt-2 animate-bounce text-sm font-bold text-amber-400">
                      🎉 New Record Secured!
                    </p>
                  )}
                  <p className="pt-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Accuracy Misses: {misses}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={startGame}
                    className="border border-slate-700 bg-slate-800 font-semibold text-slate-100 transition-colors hover:bg-slate-700"
                  >
                    Play Again
                  </Button>
                  <Link
                    href="/games"
                    className="inline-flex h-9 items-center justify-center rounded-md border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-300 shadow-sm transition-colors hover:bg-slate-800 hover:text-slate-100 focus-visible:outline-none"
                  >
                    Back to Arcade
                  </Link>
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-xs font-medium tracking-wide text-slate-500">
            {gameState === "idle"
              ? "Targets spawn randomly. Precision and speed are critical."
              : gameState === "playing"
                ? "Engage targets immediately!"
                : "Operational sequence complete."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
