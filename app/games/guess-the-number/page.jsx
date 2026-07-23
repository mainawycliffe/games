"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";


function getRandom(max) {
  return Math.floor(Math.random() * max) + 1;
}

export default function GuessTheNumberPage() {
  
  const [guess, setGuess] = useState("");
  const [rnd, setRnd] = useState(getRandom(100));
  const [msg, setMsg] = useState("Higher or lower until you find the secret number.");
  const [count, setCount] = useState(0);
  const [isWon, setIsWon] = useState(false);


  const handleCheckGuess = () => {
    if (!guess) return;
    
    const num = Number(guess);
    const newCount = count + 1;
    setCount(newCount);

    if (num < rnd) {
      setMsg("Too low! Try a higher number.");
    } else if (num > rnd) {
      setMsg("Too high! Try a lower number.");
    } else if (num === rnd) {
      setMsg(`Great! You found it in ${newCount} guesses!`);
      setIsWon(true);
    }
    setGuess("");
  };

  
  const handleReset = () => {
    setRnd(getRandom(100));
    setCount(0);
    setMsg("Game reset. Start guessing!");
    setIsWon(false);
    setGuess("");
  };

  return (
    <div className="mx-auto max-w-md py-12 px-4">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-2xl font-bold">Guess the Number</CardTitle>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">easy</Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          
          <div className={`p-4 rounded-lg text-center text-sm font-medium transition-colors ${
            isWon ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"
          }`}>
            {msg}
          </div>

          <div className="flex flex-col gap-4">
            <input
              type="number"
              placeholder="1-100"
              value={guess}
              disabled={isWon}
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCheckGuess()}
              className="w-full h-14 text-center text-3xl font-bold rounded-md border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-all"
            />

            {!isWon ? (
              <Button 
                onClick={handleCheckGuess} 
                className="w-full py-6 text-lg font-semibold"
              >
                Submit Guess
              </Button>
            ) : (
              <Button 
                onClick={handleReset} 
                variant="outline" 
                className="w-full py-6 text-lg font-semibold border-green-600 text-green-600 hover:bg-green-50"
              >
                Start Again!
              </Button>
            )}
          </div>

          {/* Stats and Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100 text-xs text-muted-foreground">
            <p>Guesses: <span className="font-bold text-foreground">{count}</span></p>
            <Button asChild variant="link" size="sm" className="h-auto p-0">
              <Link href="https://github.com/your-repo/issues/6" target="_blank">
                Full Spec (Issue #6)
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}