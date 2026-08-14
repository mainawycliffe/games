"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function FlappyBirdPage() {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState("START");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const birdY = useRef(250);
  const velocity = useRef(0);
  const pipes = useRef([]);
  const frameCount = useRef(0);

  const cloudOffset = useRef(0);
  const cityOffset = useRef(0);

  const GRAVITY = 0.25;
  const JUMP_STRENGTH = -5.5;
  const PIPE_SPEED = 2;
  const PIPE_SPAWN_RATE = 100; 
  const GAP_HEIGHT = 140;
  const PIPE_WIDTH = 60;
  const BIRD_RADIUS = 12;

  useEffect(() => {
    const saved = localStorage.getItem("flappy_high_score");
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const handleFlap = () => {
    if (gameState === "START") {
      setGameState("PLAYING");
      velocity.current = JUMP_STRENGTH;
    } else if (gameState === "PLAYING") {
      velocity.current = JUMP_STRENGTH;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleFlap();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState]);

  const resetGame = () => {
    birdY.current = 250;
    velocity.current = 0;
    pipes.current = [];
    frameCount.current = 0;
    setScore(0);
    setGameState("PLAYING");
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;

    const runLoop = () => {
      ctx.fillStyle = "#70c5ce";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (gameState === "PLAYING") {
        cloudOffset.current = (cloudOffset.current + 0.3) % 400;
        cityOffset.current = (cityOffset.current + 0.6) % 400;
      }

      ctx.fillStyle = "rgba(224, 247, 250, 0.6)";
      for (let i = -1; i < 3; i++) {
        let cx = i * 200 - (cloudOffset.current * 0.5);
        ctx.beginPath();
        ctx.arc(cx + 40, 320, 45, 0, Math.PI * 2);
        ctx.arc(cx + 90, 300, 60, 0, Math.PI * 2);
        ctx.arc(cx + 150, 320, 45, 0, Math.PI * 2);
        ctx.fillRect(cx, 310, 200, 60);
        ctx.fill();
      }

      ctx.fillStyle = "#cedcb7";
      for (let i = -1; i < 4; i++) {
        let kx = i * 140 - cityOffset.current;
        ctx.fillRect(kx + 10, 360, 30, 100);
        ctx.fillRect(kx + 25, 340, 20, 120);
        ctx.fillRect(kx + 55, 375, 25, 85);
        ctx.fillRect(kx + 90, 350, 35, 110);
      }

      ctx.fillStyle = "#e6f2cd";
      for (let i = -1; i < 5; i++) {
        let bx = i * 100 - cityOffset.current;
        ctx.beginPath();
        ctx.arc(bx + 20, 440, 25, 0, Math.PI * 2);
        ctx.arc(bx + 50, 430, 30, 0, Math.PI * 2);
        ctx.arc(bx + 80, 440, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(bx, 435, 100, 30);
      }

      ctx.fillStyle = "#73bf2e";
      ctx.fillRect(0, canvas.height - 40, canvas.width, 8);
      ctx.fillStyle = "#ded895";
      ctx.fillRect(0, canvas.height - 32, canvas.width, 32);

      ctx.fillStyle = "#55961e";
      for (let x = 0; x < canvas.width; x += 15) {
        ctx.fillRect(x, canvas.height - 40, 6, 8);
      }

      if (gameState === "PLAYING") {
        frameCount.current += 1;

        velocity.current += GRAVITY;
        birdY.current += velocity.current;

        if (frameCount.current % PIPE_SPAWN_RATE === 0) {
          const minHeight = 50;
          const maxHeight = canvas.height - GAP_HEIGHT - 90;
          const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
          const bottomY = topHeight + GAP_HEIGHT;

          pipes.current.push({
            x: canvas.width,
            topHeight,
            bottomY,
            passed: false,
          });
        }

        pipes.current = pipes.current.map((pipe) => {
          const updatedX = pipe.x - PIPE_SPEED;
          let passed = pipe.passed;

          if (!passed && updatedX + PIPE_WIDTH < 100) {
            passed = true;
            setScore((prev) => {
              const next = prev + 1;
              if (next > highScore) {
                setHighScore(next);
                localStorage.setItem("flappy_high_score", next.toString());
              }
              return next;
            });
          }
          return { ...pipe, x: updatedX, passed };
        });

        pipes.current = pipes.current.filter((pipe) => pipe.x + PIPE_WIDTH > 0);

        const hitGround = birdY.current + BIRD_RADIUS >= canvas.height - 40;
        const hitCeiling = birdY.current - BIRD_RADIUS <= 0;
        let hitPipe = false;

        for (const pipe of pipes.current) {
          const withinX = 100 + BIRD_RADIUS > pipe.x && 100 - BIRD_RADIUS < pipe.x + PIPE_WIDTH;
          const hitTop = birdY.current - BIRD_RADIUS < pipe.topHeight;
          const hitBottom = birdY.current + BIRD_RADIUS > pipe.bottomY;

          if (withinX && (hitTop || hitBottom)) {
            hitPipe = true;
            break;
          }
        }

        if (hitGround || hitCeiling || hitPipe) {
          setGameState("GAMEOVER");
        }
      }

      pipes.current.forEach((pipe) => {
        ctx.fillStyle = "#73bf2e";
        ctx.strokeStyle = "#538222";
        ctx.lineWidth = 3;

        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);

        const bottomHeight = canvas.height - pipe.bottomY - 40;
        ctx.fillRect(pipe.x, pipe.bottomY, PIPE_WIDTH, bottomHeight);
        ctx.strokeRect(pipe.x, pipe.bottomY, PIPE_WIDTH, bottomHeight);
      });

      ctx.save();
      ctx.translate(100, birdY.current);
      
      const angle = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, velocity.current * 0.08));
      ctx.rotate(angle);

      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.ellipse(0, 0, BIRD_RADIUS, BIRD_RADIUS * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(5, -4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.beginPath();
      ctx.arc(5, -4, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#FF8C00";
      ctx.beginPath();
      ctx.moveTo(8, 1);
      ctx.lineTo(14, 4);
      ctx.lineTo(8, 7);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.stroke();

      ctx.restore();

      animationFrameId = requestAnimationFrame(runLoop);
    };

    runLoop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, highScore]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white font-sans p-4">
      <div className="w-full max-w-md flex justify-between items-center mb-4">
        <Link
          href="/games"
          className="text-sm bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded transition text-slate-300"
        >
          ← Back to arcade
        </Link>
        <div className="text-right">
          <span className="text-xs tracking-wider text-slate-400 block uppercase">High Score</span>
          <span className="text-xl font-bold text-yellow-400">{highScore}</span>
        </div>
      </div>

      <div className="relative border-4 border-slate-700 rounded-lg overflow-hidden shadow-2xl bg-black">
        <canvas
          ref={canvasRef}
          width={400}
          height={500}
          onClick={handleFlap}
          className="cursor-pointer block"
        />

        {gameState === "PLAYING" && (
          <div className="absolute top-6 left-0 right-0 text-center pointer-events-none select-none">
            <h1 className="text-5xl font-black drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)] text-white">
              {score}
            </h1>
          </div>
        )}

        {gameState === "START" && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-6 backdrop-blur-sm">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 uppercase text-yellow-400">
              Flappy Bird
            </h1>
            <p className="text-sm text-slate-200 mb-6 max-w-xs">
              Press <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-600 text-xs">Space</kbd> or click to flap.
            </p>
            <button
              onClick={handleFlap}
              className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold px-6 py-3 rounded-full text-lg shadow-lg"
            >
              Start Game
            </button>
          </div>
        )}

        {gameState === "GAMEOVER" && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center p-6 backdrop-blur-sm">
            <h2 className="text-3xl font-black tracking-wider text-red-500 mb-1 uppercase">
              Game Over
            </h2>
            <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 my-4 min-w-[200px]">
              <div className="mb-2">
                <span className="text-xs uppercase tracking-widest text-slate-400 block">Score</span>
                <span className="text-3xl font-bold text-white">{score}</span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-slate-400 block">Best</span>
                <span className="text-2xl font-bold text-yellow-400">{highScore}</span>
              </div>
            </div>
            <button
              onClick={resetGame}
                            className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-6 py-2.5 rounded-full text-md shadow-lg"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}























// import Link from "next/link";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { issueUrl } from "@/app/games/_lib/loader";

// // 🚧 PLACEHOLDER — this game hasn't been built yet.
// // If you claimed "Flappy Bird", replace everything in this file with your game.
// // See app/games/tic-tac-toe/ for a complete worked example, and CONTRIBUTING.md.
// export default function FlappyBirdPage() {
//   return (
//     <div className="mx-auto max-w-md py-12">
//       <Card>
//         <CardHeader>
//           <div className="flex items-center justify-between gap-2">
//             <CardTitle>Flappy Bird</CardTitle>
//             <Badge variant="secondary">hard</Badge>
//           </div>
//         </CardHeader>
//         <CardContent className="text-muted-foreground space-y-4 text-sm">
//           <p className="text-foreground text-base">
//             {"Tap to fly through the gaps without crashing."}
//           </p>
//           <p>🚧 This game hasn&apos;t been built yet.</p>
//           <p>
//             The full spec — objective, rules, required features and definition of done — lives in
//             issue #40. Claim it, then replace this file with your game.
//           </p>
//           <Button asChild variant="outline" size="sm">
//             <Link href={issueUrl(40)}>Read the full spec (issue #40)</Link>
//           </Button>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
