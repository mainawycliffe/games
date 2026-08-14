"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AirHockeyPage() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [scores, setScores] = useState({ p: 0, c: 0 });
  const [gameState, setGameState] = useState("idle");
  const [target, setTarget] = useState(15);

  
  const g = useRef({
    pY: 200, cY: 200, pX: 300, pY_puck: 200, spX: 5, spY: 5,
    trail: [], pScore: 0, cScore: 0, start: 0, active: false
  });

  useEffect(() => {
    if (gameState !== "playing") {
      g.current.active = false;
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = 600;
    canvas.height = 400;

    
    const s = g.current;
    Object.assign(s, {
      pY: 200, cY: 200, pX: 300, pY_puck: 200, spX: 5, spY: 5,
      trail: [], pScore: 0, cScore: 0, start: Date.now(), active: true
    });

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      s.pY = e.clientY - rect.top;
    };
    window.addEventListener("mousemove", onMove);

    const scoreGoal = (isPlayerGoal) => {
      if (isPlayerGoal) s.pScore++; else s.cScore++;
      setScores({ p: s.pScore, c: s.cScore });

      const lead = isPlayerGoal ? s.pScore : s.cScore;
      const behind = isPlayerGoal ? s.cScore : s.pScore;

      if (lead >= target) {
        if (lead === behind) {
          setTarget(lead + 3);
        } else {
          s.active = false;
          setGameState("gameover");
          return true;
        }
      }

      s.pX = 300;
      s.pY_puck = 200;
      s.trail = [];
      const m = 1 + Math.floor((Date.now() - s.start) / 30000) * 0.25;
      s.spX = (isPlayerGoal ? -5 : 5) * m;
      return false;
    };

    let id;
    const renderLoop = () => {
      if (!s.active) return;

      const m = 1 + Math.floor((Date.now() - s.start) / 30000) * 0.25;
      s.spX = (s.spX > 0 ? 5 : -5) * m;
      s.spY = (s.spY > 0 ? 5 : -5) * m;

      s.pX += s.spX;
      s.pY_puck += s.spY;
      s.trail.push({ x: s.pX, y: s.pY_puck });
      if (s.trail.length > 8) s.trail.shift();

      s.cY += s.cY < s.pY_puck ? 3.6 : -3.6;

      if (s.pY_puck < 15 || s.pY_puck > 385) s.spY = -s.spY;
      if (s.pX < 45 && s.pY_puck > s.pY - 25 && s.pY_puck < s.pY + 25) { s.spX = Math.abs(s.spX); s.pX = 45; }
      if (s.pX > 555 && s.pY_puck > s.cY - 25 && s.pY_puck < s.cY + 25) { s.spX = -Math.abs(s.spX); s.pX = 555; }

      if (s.pX < 0 && scoreGoal(false)) return;
      if (s.pX > 600 && scoreGoal(true)) return;

      ctx.fillStyle = "#76b2ed";
      ctx.fillRect(0, 0, 600, 400);

      ctx.strokeStyle = "rgba(73, 68, 68, 0.15)";
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(300, 0); ctx.lineTo(300, 400); ctx.stroke();

      s.trail.forEach((p, i) => {
        ctx.fillStyle = `rgba(56, 189, 248, ${(i + 1) / s.trail.length * 0.35})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 12 * ((i + 1) / s.trail.length), 0, Math.PI * 2); ctx.fill();
      });

      ctx.fillStyle = "#ef1cb0"; ctx.fillRect(20, s.pY - 25, 12, 50);
      ctx.fillStyle = "#eef138"; ctx.fillRect(568, s.cY - 25, 12, 50);
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(s.pX, s.pY_puck, 11, 0, Math.PI * 2); ctx.fill();

      id = requestAnimationFrame(renderLoop);
    };

    id = requestAnimationFrame(renderLoop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(id);
    };
  }, [gameState, target]);

  const handleStart = () => {
    setScores({ p: 0, c: 0 });
    setTarget(15);
    setGameState("playing");
  };

  return (
    <div className="mx-auto max-w-2xl py-12 flex justify-center">
      <Card className="w-[660px] overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Air Hockey</CardTitle>
            <Badge variant={target > 15 ? "destructive" : "secondary"}>
              {target > 15 ? `Tiebreaker (${target})` : "First to 15"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4 text-center flex flex-col items-center">
          <p className="text-text muted text-base">Slam the puck past the mallet! Speed increases every 30s.</p>
          
          <div className="flex justify-between w-full max-w-[600px] text-lg font-semibold px-2">
            <span className="text-blue-500">Player: {scores.p}</span>
            <span className="text-red-500">Computer: {scores.c}</span>
          </div>

          <div ref={containerRef} className="relative w-[600px] h-[400px] bg-slate-800 rounded-lg overflow-hidden border border-border shadow-inner">
            {gameState !== "playing" && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-4 z-20">
                <h2 className="text-2xl font-bold text-white">
                  {gameState === "idle" ? "Ready to Play?" : scores.p > scores.c ? "🏆 YOU WIN!" : "💥 YOU LOSE!"}
                </h2>
                <Button onClick={handleStart} size="lg" className={gameState === "idle" ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"}>
                  {gameState === "idle" ? "Start Game" : "Play Again"}
                </Button>
              </div>
            )}
            <canvas ref={canvasRef} className="absolute top-0 left-0 block w-[600px] h-[400px]" />
          </div>

          <Button asChild variant="outline" size="sm" className="mt-2">
            <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
              Read the full spec (issue #46)
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
