"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_SIZE,
  COIN_SIZE,
  PLATFORMS,
  COINS,
  GOAL,
  createPlayer,
  stepPhysics,
  hasReachedGoal,
  hasFallen,
  collectCoins,
  getCameraX,
} from "./logic";

const COIN_VALUE = 10;

export default function PlatformerPage() {
  const canvasRef = useRef(null);
  const playerRef = useRef(createPlayer());
  const keysRef = useRef({ left: false, right: false, jump: false });
  const collectedRef = useRef([]);
  const [status, setStatus] = useState("playing");
  const [score, setScore] = useState(0);

  const resetGame = useCallback(() => {
    playerRef.current = createPlayer();
    collectedRef.current = [];
    setScore(0);
    setStatus("playing");
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if (["ArrowLeft", "KeyA"].includes(e.code)) keysRef.current.left = true;
      if (["ArrowRight", "KeyD"].includes(e.code)) keysRef.current.right = true;
      if (["Space", "KeyW", "ArrowUp"].includes(e.code)) {
        e.preventDefault();
        keysRef.current.jump = true;
      }
    }
    function handleKeyUp(e) {
      if (["ArrowLeft", "KeyA"].includes(e.code)) keysRef.current.left = false;
      if (["ArrowRight", "KeyD"].includes(e.code)) keysRef.current.right = false;
      if (["Space", "KeyW", "ArrowUp"].includes(e.code)) keysRef.current.jump = false;
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frameId;

    function draw(cameraX) {
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.save();
      ctx.translate(-cameraX, 0);

      ctx.strokeStyle = "rgba(56, 189, 248, 0.15)";
      ctx.lineWidth = 1;
      const startGrid = Math.floor(cameraX / 40) * 40;
      for (let gx = startGrid; gx <= cameraX + CANVAS_WIDTH; gx += 40) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let gy = 0; gy <= CANVAS_HEIGHT; gy += 40) {
        ctx.beginPath();
        ctx.moveTo(cameraX, gy);
        ctx.lineTo(cameraX + CANVAS_WIDTH, gy);
        ctx.stroke();
      }

      ctx.fillStyle = "rgba(56, 189, 248, 0.15)";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      for (const p of PLATFORMS) {
        ctx.fillRect(p.x, p.y, p.width, p.height);
        ctx.strokeRect(p.x, p.y, p.width, p.height);
      }

      for (const coin of COINS) {
        if (collectedRef.current.includes(coin.id)) continue;
        ctx.beginPath();
        ctx.fillStyle = "#facc15";
        ctx.strokeStyle = "#fde047";
        ctx.arc(coin.x, coin.y, COIN_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.strokeStyle = "#38bdf8";
      ctx.beginPath();
      ctx.moveTo(GOAL.x, GOAL.y + GOAL.height);
      ctx.lineTo(GOAL.x, GOAL.y);
      ctx.stroke();
      ctx.fillStyle = "#f87171";
      ctx.beginPath();
      ctx.moveTo(GOAL.x, GOAL.y);
      ctx.lineTo(GOAL.x + 18, GOAL.y + 7);
      ctx.lineTo(GOAL.x, GOAL.y + 14);
      ctx.closePath();
      ctx.fill();

      const player = playerRef.current;
      ctx.fillStyle = "#a78bfa";
      ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);

      ctx.restore();
    }

    function tick() {
      setStatus((current) => {
        if (current === "playing") {
          const next = stepPhysics(playerRef.current, keysRef.current, PLATFORMS);
          playerRef.current = next;

          const collected = collectCoins(next, COINS, collectedRef.current);
          if (collected.length !== collectedRef.current.length) {
            collectedRef.current = collected;
            setScore(collected.length * COIN_VALUE);
          }

          if (hasReachedGoal(next)) return "won";
          if (hasFallen(next)) return "fell";
        }
        return current;
      });
      draw(getCameraX(playerRef.current.x));
      frameId = requestAnimationFrame(tick);
    }

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Platformer</CardTitle>
            <span className="text-muted-foreground text-sm font-medium">Score: {score}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative mx-auto w-full max-w-[800px]">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="block w-full rounded-md border"
            />

            {status !== "playing" && (
              <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/70">
                <div className="space-y-3 text-center">
                  <p className="text-2xl font-bold text-white">
                    {status === "won" ? ":tada: You reached the goal!" : ":boom: You fell! Try again."}
                  </p>
                  <p className="text-white/80">Score: {score}</p>
                  <Button onClick={resetGame} variant="outline">
                    {status === "won" ? "Play again" : "Restart"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-4 text-sm">
            <span>A / D or ← → to move</span>
            <span>Space or W to jump</span>
          </div>

          <div className="flex justify-center">
            <Button onClick={resetGame} variant="outline">
              Restart
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}