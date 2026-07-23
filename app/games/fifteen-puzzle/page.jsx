'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function FifteenPuzzlePage() {
  const [board, setBoard] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const initializeGame = () => {
    let shuffled = [];
    let isSolvable = false;

    while (!isSolvable) {
      const tiles = [...Array(15).keys()].map(i => i + 1);
      tiles.push(0);
      shuffled = tiles.sort(() => Math.random() - 0.5);
      
      let inversions = 0;
      for (let i = 0; i < shuffled.length; i++) {
        for (let j = i + 1; j < shuffled.length; j++) {
          if (shuffled[i] > shuffled[j] && shuffled[i] !== 0 && shuffled[j] !== 0) {
            inversions++;
          }
        }
      }
      
      const blankRowFromBottom = 4 - Math.floor(shuffled.indexOf(0) / 4);
      if ((blankRowFromBottom % 2 === 0 && inversions % 2 !== 0) || (blankRowFromBottom % 2 !== 0 && inversions % 2 === 0)) {
        isSolvable = true;
      }
    }

    setBoard(shuffled);
    setMoves(0);
    setIsWon(false);
    setSeconds(0);
    setIsActive(true);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    let interval = null;
    if (isActive && !isWon) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, isWon]);

  const handleTileClick = (index) => {
    if (isWon) return;

    const blankIndex = board.indexOf(0);
    const tileRow = Math.floor(index / 4);
    const tileCol = index % 4;
    const blankRow = Math.floor(blankIndex / 4);
    const blankCol = blankIndex % 4;

    const isAdjacent = (Math.abs(tileRow - blankRow) + Math.abs(tileCol - blankCol)) === 1;

    if (isAdjacent) {
      const newBoard = [...board];
      newBoard[blankIndex] = board[index];
      newBoard[index] = 0;
      
      setBoard(newBoard);
      setMoves((prev) => prev + 1);

      const won = newBoard.every((tile, idx) => idx === 15 ? tile === 0 : tile === idx + 1);
      if (won) {
        setIsWon(true);
        setIsActive(false);
      }
    }
  };

  return (
    <div className="mx-auto max-w-md py-6 px-4">
      <Card className="border-zinc-900 bg-zinc-200 text-white shadow-xl">
        <CardHeader className="border-b border-zinc-900 pb-4">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-2xl font-bold text-black">🧩 Puzzle</CardTitle>
            <Badge className="bg-white text-amber-600 hover:bg-amber-700">medium</Badge>
          </div>
          <p className="text-xs text-black mt-1">
            Slide tiles into order from 1–15.<br />
            Click tiles next to the blank space to move any numbers.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6 " >
          <div className="flex justify-around text-center bg-white py-2 rounded-lg">
            <div>
              <p className="text-black text-xs uppercase font-bold tracking-wider">Moves</p>
              <p className="text-lg font-bold text-amber-400">{moves}</p>
            </div>
            <div>
              <p className="text-black text-xs uppercase font-bold tracking-wider">Time</p>
              <p className="text-lg font-bold text-amber-400">{seconds}s</p>
            </div>
          </div>

          {isWon && (
            <div className="bg-emerald-800/20 border border-emerald-100 text-emerald-900 p-3 rounded-lg text-center font-bold text-sm animate-pulse">
              🎉 Cleared! You won in {moves} moves and {seconds} seconds!
            </div>
          )}

          <div className="grid grid-cols-4 gap-2 bg-zinc-100 border-zinc-800 aspect-square shadow-inner">
            {board.map((tile, index) => {
              const isBlank = tile === 0;
              return (
                <button
                  key={index}
                  onClick={() => handleTileClick(index)}
                  disabled={isBlank || isWon}
                  className={`flex items-center justify-center font-bold text-lg rounded-lg transition-all duration-100 shadow-md h-full w-full ${
                    isBlank
                      ? 'bg-transparent border border-dashed border-zinc-900 cursor-default'
                      : 'bg-amber-500 text-zinc-950 hover:bg-amber-400 active:scale-95 cursor-pointer'
                  }`}
                >
                  {isBlank ? '' : tile}
                </button>
              );
            })}
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={initializeGame}
              className="w-full border bg-white text-amber-900 hover:text-zinc-950 font-bold py-2 rounded"
            >
              New Game
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
