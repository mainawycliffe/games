'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TetrisPage() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');

    // Reset scaling factor on initialization
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(20, 20);

    // --- Core Logic Ported Directly From Your Code ---
    const arena = Array.from({ length: 20 }, () => Array(12).fill(0));

    const pieces = {
      'T': [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
      'O': [[2, 2], [2, 2]],
      'L': [[0, 0, 3], [3, 3, 3], [0, 0, 0]],
      'I': [[0, 4, 0, 0], [0, 4, 0, 0], [0, 4, 0, 0], [0, 4, 0, 0]],
    };

    const colors = [null, '#fff000', '#a020f0', '#ff7f00', '#ff3333'];

    const player = {
      pos: { x: 0, y: 0 },
      matrix: null,
      score: 0
    };

    function collide(arena, player) {
      const [m, o] = [player.matrix, player.pos];
      for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
          if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
            return true;
          }
        }
      }
      return false;
    }

    function merge(arena, player) {
      player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            arena[y + player.pos.y][x + player.pos.x] = value;
          }
        });
      });
    }

    function arenaSweep() {
      outer: for (let y = arena.length - 1; y >= 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
          if (arena[y][x] === 0) continue outer;
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        player.score += 10;
        setScore(player.score); // Sync canvas score with React UI state
      }
    }

    function drawMatrix(matrix, offset) {
      matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            context.fillStyle = colors[value];
            context.fillRect(x + offset.x, y + offset.y, 1, 1);
          }
        });
      });
    }

    function draw() {
      context.fillStyle = '#000';
      context.fillRect(0, 0, canvas.width, canvas.height);
      drawMatrix(arena, { x: 0, y: 0 });
      drawMatrix(player.matrix, player.pos);
    }

    function playerReset() {
      const types = 'TOLI';
      const randomType = types[Math.floor(Math.random() * types.length)];
      player.matrix = pieces[randomType];
      player.pos.y = 0;
      player.pos.x = Math.floor(arena[0].length / 2) - Math.floor(player.matrix[0].length / 2);

      if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        setScore(0);
      }
    }

    function playerMove(dir) {
      player.pos.x += dir;
      if (collide(arena, player)) player.pos.x -= dir;
    }

    function playerDrop() {
      player.pos.y++;
      if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
      }
      dropCounter = 0;
    }

    function rotate(matrix) {
      for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
          [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
      }
      matrix.forEach(row => row.reverse());
    }

    function playerRotate() {
      const pos = player.pos.x;
      let offset = 1;
      rotate(player.matrix);
      while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
          rotate(player.matrix);
          player.pos.x = pos;
          return;
        }
      }
    }

    // --- Game Animation Loop Loop ---
    let dropCounter = 0;
    let dropInterval = 1000;
    let lastTime = 0;
    let animationFrameId;

    function update(time = 0) {
      const deltaTime = time - lastTime;
      lastTime = time;
      dropCounter += deltaTime;
      if (dropCounter > dropInterval) playerDrop();
      draw();
      animationFrameId = requestAnimationFrame(update);
    }

    // --- Event Listeners ---
    const handleKeyDown = (event) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault(); // Stop standard browser arrow scrolling
      }
      if (event.key === 'ArrowLeft') playerMove(-1);
      if (event.key === 'ArrowRight') playerMove(1);
      if (event.key === 'ArrowDown') playerDrop();
      if (event.key === 'ArrowUp') playerRotate();
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Kickstart the game setup
    playerReset();
    update();

    // Clean up event listeners and intervals when moving away from the component
    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="mx-auto max-w-md py-12">
      <Card className="bg-slate-900 text-white border-slate-800 shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-2xl font-black tracking-widest text-cyan-400">TETRIS</CardTitle>
            <Badge variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700">hard</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="text-xl font-bold tracking-wide">
            Score: <span className="text-emerald-400">{score}</span>
          </div>

          {/* HTML5 Canvas Render Window */}
          <canvas
            ref={canvasRef}
            width="240"
            height="400"
            className="border-4 border-slate-800 bg-black rounded shadow-inner"
          />

          <div className="w-full text-center text-xs text-slate-500 space-y-1">
            <p>⬆️ <span className="text-slate-400 font-medium">Rotate Piece</span></p>
            <p>⬅️ ➡️ <span className="text-slate-400 font-medium">Move Left / Right</span></p>
            <p>⬇️ <span className="text-slate-400 font-medium">Soft Drop</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
