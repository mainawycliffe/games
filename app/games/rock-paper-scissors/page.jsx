'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CHOICES = [
  { name: 'Rock', emoji: '🪨', beats: 'Scissors' },
  { name: 'Paper', emoji: '📄', beats: 'Rock' },
  { name: 'Scissors', emoji: '✂️', beats: 'Paper' }
];

export default function RockPaperScissors() {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState("Choose your weapon!");
  const [score, setScore] = useState({ player: 0, computer: 0 });

  const playGame = (playerSelection) => {
    const computerSelection = CHOICES[Math.floor(Math.random() * CHOICES.length)];
    setPlayerChoice(playerSelection);
    setComputerChoice(computerSelection);

    if (playerSelection.name === computerSelection.name) {
      setResult("It's a tie! 🤝");
    } else if (playerSelection.beats === computerSelection.name) {
      setResult("You win! 🎉");
      setScore(prev => ({ ...prev, player: prev.player + 1 }));
    } else {
      setResult("Computer wins! 🤖");
      setScore(prev => ({ ...prev, computer: prev.computer + 1 }));
    }
  };

  return (
    <div className="mx-auto max-w-sm py-12">
      <Card className="bg-slate-900 border-slate-800 text-white shadow-2xl text-center">
        <CardHeader>
          <CardTitle className="text-xl font-black tracking-wider text-amber-400">ROCK PAPER SCISSORS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-around text-sm font-mono text-slate-400 bg-slate-950 p-2 rounded">
            <div>Player: <span className="text-emerald-400 font-bold">{score.player}</span></div>
            <div>Computer: <span className="text-rose-400 font-bold">{score.computer}</span></div>
          </div>

          <div className="h-16 flex flex-col justify-center border border-slate-800 bg-slate-950/40 rounded p-2">
            <p className="text-sm font-medium text-slate-300">{result}</p>
            {playerChoice && (
              <p className="text-xs text-slate-500 mt-1">
                You picked {playerChoice.emoji} vs Computer's {computerChoice.emoji}
              </p>
            )}
          </div>

          <div className="flex justify-center gap-3">
            {CHOICES.map((choice) => (
              <Button
                key={choice.name}
                onClick={() => playGame(choice)}
                className="h-14 w-14 text-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
              >
                {choice.emoji}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
