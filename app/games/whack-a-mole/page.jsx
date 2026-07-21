"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function WhackAMole() {
  // 1. Game State variables
  const [score, setScore] = useState(0);
  const [activeMole, setActiveMole] = useState(null); // Track which hole has the mole (0 to 8)
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // 30-second game timer

  // Create an array of 9 holes (index 0 to 8)
  const holes = Array.from({ length: 9 });

  // 2. Game Loop Logic
  useEffect(() => {
    let moleInterval;
    let timerInterval;

    if (isPlaying && timeLeft > 0) {
      // Move the mole to a random hole every 1 second
      moleInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * 9);
        setActiveMole(randomIndex);
      }, 2000);

      // Count down the time every 1 second
      timerInterval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 2000);
    } else if (timeLeft === 0) {
      // Game over when time runs out
      setIsPlaying(false);
      setActiveMole(null);
    }

    // Clean up timers when game stops
    return () => {
      clearInterval(moleInterval);
      clearInterval(timerInterval);
    };
  }, [isPlaying, timeLeft]);

  // 3. Start Game Function
  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
  };

  // 4. Whack Mole Function
  const whackMole = (index) => {
    if (index === activeMole) {
      setScore((prevScore) => prevScore + 1);
      setActiveMole(null); // Hide mole immediately after a successful whack
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-100">
      <Card className="w-full max-w-md p-6 bg-white shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-slate-800">Whack-a-Mole! 🔨</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Dashboard Info */}
          <div className="flex justify-between text-xl font-semibold px-2">
            <span className="text-emerald-600">Score: {score}</span>
            <span className="text-rose-600">Time: {timeLeft}s</span>
          </div>

          {/* 3x3 Game Grid */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-amber-100 rounded-xl border-4 border-amber-600">
            {holes.map((_, index) => (
              <button
                key={index}
                onClick={() => whackMole(index)}
                disabled={!isPlaying}
                className="h-24 w-24 rounded-full bg-amber-800 border-4 border-amber-950 flex items-center justify-center relative overflow-hidden transition-transform active:scale-95 disabled:cursor-not-allowed"
              >
                {/* Brown base hole decoration */}
                <div className="absolute bottom-0 w-full h-1/3 bg-amber-950 opacity-40 rounded-b-full"></div>
                
                {/* The Mole Button (only shows if activeMole matches this index) */}
                {index === activeMole && (
                  <span className="text-4xl animate-bounce z-10 select-none">🦫</span>
                )}
              </button>
            ))}
          </div>

          {/* Control Button */}
          <div className="text-center">
            {!isPlaying ? (
              <Button onClick={startGame} className="w-full text-lg py-6 bg-emerald-600 hover:bg-emerald-700">
                {timeLeft === 0 ? "Play Again" : "Start Game"}
              </Button>
            ) : (
              <p className="text-slate-500 font-medium animate-pulse text-center">Whack them quickly!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
