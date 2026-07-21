"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function WhackAMole() {
  
  const [score, setScore] = useState(0);
  const [activeMole, setActiveMole] = useState(null); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); 
  const [gameEnded, setGameEnded] = useState(false); 

  const holes = Array.from({ length: 9 });

  
  useEffect(() => {
    let moleInterval;
    let timerInterval;

    if (isPlaying && timeLeft > 0) {
      moleInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * 9);
        setActiveMole(randomIndex);
      }, 1000);

      timerInterval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
      setActiveMole(null);
      setGameEnded(true); 
    }

    return () => {
      clearInterval(moleInterval);
      clearInterval(timerInterval);
    };
  }, [isPlaying, timeLeft]);

  
  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameEnded(false); 
    setIsPlaying(true);
  };

  
  const whackMole = (index) => {
    if (index === activeMole) {
      setScore((prevScore) => prevScore + 1);
      setActiveMole(null); 
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-100">
      <Card className="w-full max-w-md p-6 bg-white shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-slate-800">Whack-a-Mole! 🔨</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          
          <div className="flex justify-between text-xl font-semibold px-2">
            <span className="text-emerald-600">Score: {score}</span>
            <span className="text-rose-600">Time: {timeLeft}s</span>
          </div>

          
          {gameEnded && (
            <div className="text-center p-4 rounded-lg border-2 bg-slate-50">
              {score >= 10 ? (
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-emerald-600">You Win! 🎉</h3>
                  <p className="text-slate-600 font-medium">Amazing job whacking those moles!</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-rose-600">Game Over! 😢</h3>
                  <p className="text-slate-600 font-medium">You need 10 points to win. Try again!</p>
                </div>
              )}
            </div>
          )}

          
          <div className="grid grid-cols-3 gap-4 p-4 bg-amber-100 rounded-xl border-4 border-amber-600">
            {holes.map((_, index) => (
              <button
                key={index}
                onClick={() => whackMole(index)}
                disabled={!isPlaying}
                className="h-24 w-24 rounded-full bg-amber-800 border-4 border-amber-950 flex items-center justify-center relative overflow-hidden transition-transform active:scale-95 disabled:cursor-not-allowed"
              >
                <div className="absolute bottom-0 w-full h-1/3 bg-amber-950 opacity-40 rounded-b-full"></div>
                {index === activeMole && (
                  <span className="text-4xl animate-bounce z-10 select-none">🦫</span>
                )}
              </button>
            ))}
          </div>

          {/*    */}
          <div className="text-center">
            {!isPlaying ? (
              <Button onClick={startGame} className="w-full text-lg py-6 bg-emerald-600 hover:bg-emerald-700">
                {gameEnded ? "Play Again" : "Start Game"}
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
