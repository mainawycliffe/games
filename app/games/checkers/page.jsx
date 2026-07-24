"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const initialBoard = () => {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) {
        if (r < 3) board[r][c] = "b"; 
        if (r > 4) board[r][c] = "r"; 
      }
    }
  }
  return board;
};

export default function CheckersPage() {
  const [board, setBoard] = useState(initialBoard);
  const [turn, setTurn] = useState("r"); 
  const [selected, setSelected] = useState(null);

  const isKing = (piece) => piece === "R" || piece === "B";

  const isValidMove = (fromR, fromC, toR, toC, piece) => {
    if (board[toR][toC] !== null || (toR + toC) % 2 === 0) return null;   

    const rowDiff = toR - fromR;
    const colDiff = Math.abs(toC - fromC);
    const movingPieceIsKing = isKing(piece);

    const allowedDirections = movingPieceIsKing 
      ? [-1, 1] 
      : (piece.toLowerCase() === "r" ? [-1] : [1]);

    if (allowedDirections.includes(rowDiff) && colDiff === 1) {
      return { type: "move" };
    }

    if (allowedDirections.includes(rowDiff / 2) && colDiff === 2) {
      const midR = fromR + rowDiff / 2;
      const midC = fromC + (toC - fromC) / 2;
      const targetPiece = board[midR][midC];
      
      if (targetPiece && targetPiece.toLowerCase() !== piece.toLowerCase()) {
        return { type: "jump", midR, midC };
      }
    }

    return null;
  };

  const handleSquareClick = (r, c) => {
    const targetPiece = board[r][c];

    if (targetPiece && targetPiece.toLowerCase() === turn) {
      setSelected({ r, c });
      return;
    }

    if (selected) {
      const movingPiece = board[selected.r][selected.c];
      const move = isValidMove(selected.r, selected.c, r, c, movingPiece);

      if (move) {
        const newBoard = board.map((row) => [...row]);
        let finalPiece = movingPiece;

        if (turn === "r" && r === 0) finalPiece = "R";
        if (turn === "b" && r === 7) finalPiece = "B";
        
        newBoard[r][c] = finalPiece;
        newBoard[selected.r][selected.c] = null;

        if (move.type === "jump") {
          newBoard[move.midR][move.midC] = null;
        }

        setBoard(newBoard);
        setSelected(null);
        setTurn(turn === "r" ? "b" : "r"); 
      } else {
        setSelected(null); 
      }
    }
  };

  return (
    <div className="mx-auto max-w-2xl py-12">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-2xl font-bold">Checkers</CardTitle>
            <Badge variant={turn === "r" ? "default" : "secondary"}>
              {turn === "r" ? "White's Turn" : "Brown's Turn"}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center gap-6">
          <div className="grid grid-cols-8 border-4 border-neutral-800 bg-neutral-900 p-1 shadow-xl rounded-lg">
            {board.map((row, r) =>
              row.map((piece, c) => {
                const isDarkSquare = (r + c) % 2 === 1;
                const isSelected = selected?.r === r && selected?.c === c;

                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => isDarkSquare && handleSquareClick(r, c)}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center transition-all ${
                      isDarkSquare 
                        ? "bg-[#A77D57] cursor-pointer hover:bg-[#B88E68]" 
                        : "bg-[#FFF4D0]"
                    } ${isSelected ? "ring-4 ring-green-400 z-10" : ""}`}
                  >
                    {piece && (
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-md border-2 flex items-center justify-center font-bold text-base ${
                          piece.toLowerCase() === "r"
                            ? "bg-[#EFECE6] border-[#D9D3C7]"
                            : "bg-[#000000] border-[#1A1A1A]"
                        }`}
                      >
                        
                        {isKing(piece) && (
                          <span className="text-yellow-500 drop-shadow">👑</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="flex w-full justify-between items-center mt-4">
            <Button variant="outline" size="sm" onClick={() => { setBoard(initialBoard()); setTurn("r"); setSelected(null); }}>
              Reset Game
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
