"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createGameState, updateGame } from "./logic";

export default function SpaceInvadersPage() {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState("START");
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (gameState !== "PLAYING") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = 480;
    canvas.height = 500;

    const state = createGameState(canvas.width, canvas.height);
    const keys = {};

    const handleKeyDown = (e) => {
      keys[e.code] = true;
      if (e.code === "Space") e.preventDefault();
    };
    const handleKeyUp = (e) => {
      keys[e.code] = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    let animationFrameId;

    const runFrame = (timestamp) => {
      updateGame(
        state,
        keys,
        timestamp,
        canvas.width,
        canvas.height,
        () => setGameState("WIN"),
        () => setGameState("GAME_OVER"),
        (points) => setScore((prev) => prev + points),
      );

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(state.player.x, state.player.y, state.player.w, state.player.h);

      ctx.fillStyle = "#38bdf8";
      state.playerLasers.forEach((laser) => ctx.fillRect(laser.x, laser.y, laser.w, laser.h));

      ctx.fillStyle = "#ef4444";
      state.alienLasers.forEach((laser) => ctx.fillRect(laser.x, laser.y, laser.w, laser.h));

      ctx.fillStyle = "#3ddb37";
      state.invaders.forEach((inv) => {
        if (inv.alive) ctx.fillRect(inv.x, inv.y, inv.w, inv.h);
      });

      if (gameState === "PLAYING") {
        animationFrameId = requestAnimationFrame(runFrame);
      }
    };

    animationFrameId = requestAnimationFrame(runFrame);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState]);

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Card className="border-slate-800 bg-[#01082D] text-white shadow-2xl">
        <CardHeader className="border-b border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="font-mono text-xl tracking-wider text-sky-400">
              👾 SPACE INVADERS
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="border-amber-500 font-mono text-amber-400">
                SCORE: {score}
              </Badge>
              <Badge
                variant="secondary"
                className="border border-rose-500/30 bg-rose-500/20 text-rose-400"
              >
                HARD
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          {gameState === "START" && (
            <div className="space-y-6 py-8 text-center">
              <p className="font-mono text-sm text-slate-400">
                Defend the base from the alien swarm! Use the Left/Right Arrow keys to move and
                Spacebar to shoot.
              </p>
              <Button
                onClick={() => {
                  setGameState("PLAYING");
                  setScore(0);
                }}
                className="rounded-xl bg-sky-500 px-8 py-6 font-mono text-white hover:bg-sky-600"
              >
                START DEFENSE MISSION
              </Button>
            </div>
          )}

          {gameState === "PLAYING" && (
            <canvas
              ref={canvasRef}
              className="max-w-full rounded-lg border border-slate-800 bg-[#02040a]"
            />
          )}

          {(gameState === "GAME_OVER" || gameState === "WIN") && (
            <div className="space-y-6 py-8 text-center font-mono">
              <h2
                className={`text-2xl font-bold tracking-widest ${gameState === "WIN" ? "text-emerald-400" : "text-rose-500"}`}
              >
                {gameState === "WIN" ? "🏆 VICTORY ACHIEVED" : "💥 SHIELD BREAKDOWN"}
              </h2>
              <p className="text-slate-400">
                Final Clean Score: <span className="font-bold text-white">{score}</span>
              </p>
              <Button
                onClick={() => {
                  setGameState("PLAYING");
                  setScore(0);
                }}
                className="bg-slate-800 px-6 py-4 text-white hover:bg-slate-700"
              >
                PLAY AGAIN
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
