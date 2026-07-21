"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import { simulateToggle, getInitialSolvableBoard, formatTime } from "./logic";

export default function LightsOutPage() {
  const [board, setBoard] = useState(Array(25).fill(false));
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [ended, setEnded] = useState(false);

  useEffect(() => { handleRestart(); }, []);

  useEffect(() => {
    if (ended || timeLeft <= 0) { setEnded(true); return; }
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, ended]);

  const handleRestart = () => {
    setBoard(getInitialSolvableBoard());
    setMoves(0);
    setScore(0);
    setTimeLeft(120);
    setEnded(false);
  };

  const handleCellClick = (index) => {
    if (ended) return;

    const lightsBefore = board.filter(x => x).length;
    const nextBoard = simulateToggle(board, index);
    const lightsAfter = nextBoard.filter(x => x).length;

    if (lightsAfter < lightsBefore) {
      setScore(s => s + 10);
    }

    setBoard(nextBoard);
    setMoves(m => m + 1);

    if (nextBoard.every(x => !x)) {
      setEnded(true);
    }
  };

  return (
    <div className="mx-auto max-w-md py-12 px-4">
      <Card className="bg-slate-950 border-slate-800 text-slate-100">
        <CardHeader>
          <CardTitle className="text-2xl font-black text-pink-500 text-center">Lights Out</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4 text-center bg-slate-900 p-2 rounded-xl border border-slate-800">
            <div><p className="text-xs text-slate-500 font-bold uppercase">Moves</p><p className="text-xl font-bold text-cyan-400">{moves}</p></div>
            <div><p className="text-xs text-slate-500 font-bold uppercase">Score</p><p className="text-xl font-bold text-purple-400">{score}</p></div>
          </div>

          {timeLeft <= 0 && <div className="text-center p-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 font-bold">⏰ Out of Time!</div>}
          {board.every(x => !x) && <div className="text-center p-2 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 font-bold">🎉 You Win!</div>}

          <div className="text-center text-xs font-bold text-slate-400 tracking-widest uppercase">⏱️ {formatTime(timeLeft)} ⏱️</div>

          <div className="mx-auto grid w-fit grid-cols-5 gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800">
            {board.map((isOn, idx) => (
              <button
                key={idx}
                onClick={() => handleCellClick(idx)}
                disabled={ended}
                className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${isOn ? "bg-amber-400/20 border-2 border-amber-400 text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]" : "bg-slate-950 border border-slate-800 text-slate-600"}`}
              >
                <Lightbulb className={`w-6 h-6 ${isOn ? "fill-amber-400" : "fill-transparent"}`} />
              </button>
            ))}
          </div>

          <Button onClick={handleRestart} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold shadow-lg shadow-pink-600/20">RESTART</Button>
        </CardContent>
      </Card>
    </div>
  );
}
