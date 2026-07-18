
"use client";

import React, { useEffect, useRef, useState } from "react";


export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 450;
export const LEVEL_WIDTH = 1900;
export const PLAYER_SIZE = 28;
export const COIN_SIZE = 16;

const GRAVITY = 0.6;
const MOVE_SPEED = 4;
const JUMP_FORCE = -12;
const MAX_FALL_SPEED = 15;

export const PLATFORMS = [
  { x: 0, y: 420, width: 300, height: 30 },
  { x: 400, y: 420, width: 350, height: 30 },
  { x: 900, y: 420, width: 300, height: 30 },
  { x: 1350, y: 420, width: 550, height: 30 },

  { x: 180, y: 320, width: 120, height: 20 },
  { x: 340, y: 250, width: 120, height: 20 },
  { x: 520, y: 300, width: 120, height: 20 },
  { x: 650, y: 200, width: 130, height: 20 },
  { x: 800, y: 330, width: 100, height: 20 },
  { x: 980, y: 260, width: 120, height: 20 },
  { x: 1150, y: 340, width: 100, height: 20 },
  { x: 1280, y: 220, width: 120, height: 20 },
  { x: 1450, y: 300, width: 120, height: 20 },
  { x: 1620, y: 220, width: 130, height: 20 },
];

export const COINS = [
  { id: "c1", x: 220, y: 290 },
  { id: "c2", x: 380, y: 220 },
  { id: "c3", x: 560, y: 270 },
  { id: "c4", x: 690, y: 170 },
  { id: "c5", x: 840, y: 300 },
  { id: "c6", x: 1020, y: 230 },
  { id: "c7", x: 1190, y: 310 },
  { id: "c8", x: 1320, y: 190 },
  { id: "c9", x: 1490, y: 270 },
];

export const GOAL = { x: 1780, y: 165, width: 28, height: 35 };
export const START_POSITION = { x: 30, y: 370 };


export function createPlayer() {
  return { x: START_POSITION.x, y: START_POSITION.y, vx: 0, vy: 0, isGrounded: false };
}

export function rectsOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function playerRect(player) {
  return { x: player.x, y: player.y, width: PLAYER_SIZE, height: PLAYER_SIZE };
}

export function stepPhysics(player, keys, platforms = PLATFORMS) {
  let { x, y, vx, vy, isGrounded } = player;

  vx = 0;
  if (keys.left) vx -= MOVE_SPEED;
  if (keys.right) vx += MOVE_SPEED;

  if (keys.jump && isGrounded) {
    vy = JUMP_FORCE;
    isGrounded = false;
  }

  vy = Math.min(vy + GRAVITY, MAX_FALL_SPEED);

  let nextX = Math.max(0, Math.min(x + vx, LEVEL_WIDTH - PLAYER_SIZE));
  let rect = { x: nextX, y, width: PLAYER_SIZE, height: PLAYER_SIZE };
  for (const platform of platforms) {
    if (rectsOverlap(rect, platform)) {
      nextX = vx > 0 ? platform.x - PLAYER_SIZE : platform.x + platform.width;
      rect = { x: nextX, y, width: PLAYER_SIZE, height: PLAYER_SIZE };
    }
  }
  x = nextX;

  let nextY = y + vy;
  rect = { x, y: nextY, width: PLAYER_SIZE, height: PLAYER_SIZE };
  isGrounded = false;
  for (const platform of platforms) {
    if (rectsOverlap(rect, platform)) {
      if (vy > 0) {
        nextY = platform.y - PLAYER_SIZE;
        vy = 0;
        isGrounded = true;
      } else if (vy < 0) {
        nextY = platform.y + platform.height;
        vy = 0;
      }
      rect = { x, y: nextY, width: PLAYER_SIZE, height: PLAYER_SIZE };
    }
  }
  y = nextY;

  return { x, y, vx, vy, isGrounded };
}

export function hasReachedGoal(player, goal = GOAL) {
  return rectsOverlap(playerRect(player), goal);
}

export function hasFallen(player) {
  return player.y > CANVAS_HEIGHT;
}

export function collectCoins(player, coins, collectedIds) {
  const pRect = playerRect(player);
  const collected = new Set(collectedIds);
  for (const coin of coins) {
    if (collected.has(coin.id)) continue;
    const coinRect = {
      x: coin.x - COIN_SIZE / 2,
      y: coin.y - COIN_SIZE / 2,
      width: COIN_SIZE,
      height: COIN_SIZE,
    };
    if (rectsOverlap(pRect, coinRect)) collected.add(coin.id);
  }
  return [...collected];
}

export function getCameraX(playerX) {
  return Math.max(0, Math.min(playerX - CANVAS_WIDTH / 2, LEVEL_WIDTH - CANVAS_WIDTH));
}


export default function PlatformerPage() {
  const canvasRef = useRef(null);

  
  const gameStateRef = useRef({
    player: createPlayer(),
    collectedCoins: [],
    gameStatus: "playing", 
  });

  const keysRef = useRef({ left: false, right: false, jump: false });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft" || e.key === "a") keysRef.current.left = true;
      if (e.key === "ArrowRight" || e.key === "d") keysRef.current.right = true;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === " ") keysRef.current.jump = true;
    };

    const handleKeyUp = (e) => {
      if (e.key === "ArrowLeft" || e.key === "a") keysRef.current.left = false;
      if (e.key === "ArrowRight" || e.key === "d") keysRef.current.right = false;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === " ") keysRef.current.jump = false;
    };

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
    let animationFrameId;

    const gameLoop = () => {
      const state = gameStateRef.current;

      if (state.gameStatus === "playing") {
       
        state.player = stepPhysics(state.player, keysRef.current);

        
        state.collectedCoins = collectCoins(state.player, COINS, state.collectedCoins);

        
        if (hasReachedGoal(state.player)) {
          state.gameStatus = "won";
        } else if (hasFallen(state.player)) {
          state.gameStatus = "lost";
        }
      }

      
      const cameraX = getCameraX(state.player.x);

      
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.save();
      ctx.translate(-cameraX, 0); 

      ctx.fillStyle = "#1e1e24";
      ctx.fillRect(0, 0, LEVEL_WIDTH, CANVAS_HEIGHT);

      
      ctx.fillStyle = "#4a6fa5";
      for (const platform of PLATFORMS) {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      }

    
      for (const coin of COINS) {
        if (!state.collectedCoins.includes(coin.id)) {
          ctx.fillStyle = "#ffd166";
          ctx.beginPath();
          ctx.arc(coin.x, coin.y, COIN_SIZE / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

    
      ctx.fillStyle = "#06d6a0";
      ctx.fillRect(GOAL.x, GOAL.y, GOAL.width, GOAL.height);

      
      ctx.fillStyle = "#ef476f";
      ctx.fillRect(state.player.x, state.player.y, PLAYER_SIZE, PLAYER_SIZE);

      ctx.restore();

      // UI Overlay System
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText(`Coins Collected: ${state.collectedCoins.length} / ${COINS.length}`, 20, 35);

      if (state.gameStatus === "won") {
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = "#06d6a0";
        ctx.font = "bold 40px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("VICTORY ACHIEVED!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.font = "18px sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("Press ENTER to run it back", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
      } else if (state.gameStatus === "lost") {
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = "#ef476f";
        ctx.font = "bold 40px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.font = "18px sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("Press ENTER to try again", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

   
    const handleResetPress = (e) => {
      if (e.key === "Enter" && gameStateRef.current.gameStatus !== "playing") {
        gameStateRef.current = {
          player: createPlayer(),
          collectedCoins: [],
          gameStatus: "playing",
        };
      }
    };
    window.addEventListener("keydown", handleResetPress);

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", handleResetPress);
    };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#0f0f11", color: "#fff", fontFamily: "sans-serif" }}>
      <h1 style={{ marginBottom: "10px" }}>2D Custom Canvas Platformer</h1>
      <p style={{ color: "#aaa", marginBottom: "20px" }}>Controls: [A/D] or [Left/Right] to Move | [Space/W/Up] to Jump</p>
      <div style={{ border: "4px solid #333", borderRadius: "8px", overflow: "hidden", boxShadow: "0px 10px 30px rgba(0,0,0,0.5)" }}>
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
      </div>
    </div>
  );
}

