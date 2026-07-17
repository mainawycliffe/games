"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const ROWS = 6;
const COLS = 7;

export default function ConnectFour() {
  const [board, setBoard] = useState(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
  const [isRedTurn, setIsRedTurn] = useState(true);
  const [winner, setWinner] = useState(null); 
  const [winningCells, setWinningCells] = useState([]); 
  const [isVsAI, setIsVsAI] = useState(false);

  
  const checkWin = (currentBoard, r, c) => {
    const player = currentBoard[r][c];
    const directions = [
      [[0, 1], [0, -1]],  
      [[1, 0], [-1, 0]],   
      [[1, 1], [-1, -1]], 
      [[1, -1], [-1, 1]]  
    ];

    for (const dir of directions) {
      let cells = [[r, c]];
      for (const [dr, dc] of dir) {
        let row = r + dr;
        let col = c + dc;
        while (row >= 0 && row < ROWS && col >= 0 && col < COLS && currentBoard[row][col] === player) {
          cells.push([row, col]);
          row += dr;
          col += dc;
        }
      }
      if (cells.length >= 4) {
        return cells;
      }
    }
    return null;
  };


  const checkDraw = (currentBoard) => {
    return currentBoard.every((row) => row.every((cell) => cell !== null));
  };

  
  const dropDisc = useCallback((colIndex) => {
    if (winner) return;

    
    let rowIndex = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!board[r][colIndex]) {
        rowIndex = r;
        break;
      }
    }

   
    if (rowIndex === -1) return;

    const newBoard = board.map((row) => [...row]);
    const currentPlayer = isRedTurn ? "Red" : "Yellow";
    newBoard[rowIndex][colIndex] = currentPlayer;
    setBoard(newBoard);

    const winLine = checkWin(newBoard, rowIndex, colIndex);
    if (winLine) {
      setWinner(currentPlayer);
      setWinningCells(winLine);
      return;
    }

    if (checkDraw(newBoard)) {
      setWinner("Draw");
      return;
    }

    setIsRedTurn(!isRedTurn);
  }, [board, isRedTurn, winner]);

  
  useEffect(() => {
    if (!isVsAI || isRedTurn || winner) return;

 
    const aiTimeout = setTimeout(() => {
      
      const validCols = [];
      for (let c = 0; c < COLS; c++) {
        if (!board[0][c]) validCols.push(c);
      }

      if (validCols.length === 0) return;

      
      let chosenCol = validCols[Math.floor(Math.random() * validCols.length)];

     
      const getSimulatedRow = (b, c) => {
        for (let r = ROWS - 1; r >= 0; r--) {
          if (!b[r][c]) return r;
        }
        return -1;
      };

      
      for (const c of validCols) {
        const nextBoard = board.map((row) => [...row]);
        const r = getSimulatedRow(nextBoard, c);
        nextBoard[r][c] = "Yellow";
        if (checkWin(nextBoard, r, c)) {
          chosenCol = c;
          break;
        }
      }

      
      if (board[getSimulatedRow(board, chosenCol)]?.[chosenCol] !== "Yellow") {
        for (const c of validCols) {
          const nextBoard = board.map((row) => [...row]);
          const r = getSimulatedRow(nextBoard, c);
          nextBoard[r][c] = "Red";
          if (checkWin(nextBoard, r, c)) {
            chosenCol = c;
            break;
          }
        }
      }

      dropDisc(chosenCol);
    }, 500);

    return () => clearTimeout(aiTimeout);
  }, [isRedTurn, isVsAI, winner, board, dropDisc]);

 
  const resetGame = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    setIsRedTurn(true);
    setWinner(null);
    setWinningCells([]);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white font-sans p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
        
       
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-yellow-400">
            CONNECT 4
          </h1>
          <Link 
            href="/games" 
            className="text-xs text-slate-400 hover:text-white border border-slate-600 hover:border-white px-3 py-1.5 rounded-md transition-all"
          >
            ← Back to Arcade
          </Link>
        </div>

       
        <div className="flex flex-col gap-3 mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-400">Game Mode:</span>
            <button
              onClick={() => { setIsVsAI(!isVsAI); resetGame(); }}
              className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${
                isVsAI ? "bg-purple-600 text-white" : "bg-blue-600 text-white"
              }`}
            >
              {isVsAI ? " Vs Computer" : " Local 2 Players"}
            </button>
          </div>

          <div className="text-center font-bold text-lg h-7 flex items-center justify-center">
            {winner === "Draw" && <span className="text-slate-400">It&apos;s a Draw!</span>}
            {winner && winner !== "Draw" && (
              <span className={winner === "Red" ? "text-red-500" : "text-yellow-400"}>
                 Player {winner} Wins!
              </span>
            )}
            {!winner && (
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full animate-pulse ${isRedTurn ? "bg-red-500" : "bg-yellow-400"}`} />
                <span className="text-sm font-medium text-slate-300">
                  {isRedTurn ? "Red's Turn" : isVsAI ? "Computer is thinking..." : "Yellow's Turn"}
                </span>
              </div>
            )}
          </div>
        </div>

        
        <div className="bg-blue-800 p-4 rounded-xl shadow-inner border-4 border-blue-900 grid grid-cols-7 gap-2 max-w-sm mx-auto">
          {board.map((row, rIdx) =>
            row.map((cell, cIdx) => {
              const isWinning = winningCells.some(([r, c]) => r === rIdx && c === cIdx);
              return (
                <button
                  key={`${rIdx}-${cIdx}`}
                  onClick={() => dropDisc(cIdx)}
                  disabled={!!winner || (!isRedTurn && isVsAI)}
                  className="aspect-square w-full rounded-full relative bg-slate-950 focus:outline-none transition-all group overflow-hidden"
                >
               
                  {!cell && !winner && (
                    <div className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity ${
                      isRedTurn ? "bg-red-500" : "bg-yellow-400"
                    }`} />
                  )}
                  
                  
                  {cell && (
                    <div className={`absolute inset-0 rounded-full transition-all duration-300 transform scale-90 shadow-md ${
                      cell === "Red" 
                        ? "bg-gradient-to-br from-red-400 to-red-600 border border-red-700" 
                        : "bg-gradient-to-br from-yellow-300 to-yellow-500 border border-yellow-600"
                    } ${isWinning ? "animate-bounce ring-4 ring-white z-10 scale-100" : ""}`} />
                  )}
                </button>
              );
            })
          )}
        </div>

        
        <button
          onClick={resetGame}
          className="mt-6 w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-98 text-white font-bold rounded-xl shadow-lg shadow-teal-900/30 transition-all text-sm tracking-wide uppercase"
        >
          Restart Match
        </button>

      </div>
    </div>
  );
}
