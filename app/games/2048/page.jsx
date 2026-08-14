"use client";

import './globals.css';
import { useState, useEffect, useCallback } from "react";

export default function GamePage() {
  const createEmptyBoard = () => Array(4).fill(null).map(() => Array(4).fill(0));

  const [board, setBoard] = useState(createEmptyBoard());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);


  const getEmptyCells = (currentBoard) => {
    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentBoard[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    return emptyCells;
  };

  const addRandomTile = useCallback((currentBoard) => {
    const emptyCells = getEmptyCells(currentBoard);
    if (emptyCells.length === 0) return currentBoard;

    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = currentBoard.map(row => [...row]);
    newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
  }, []);

  const initGame = useCallback(() => {
    let newBoard = createEmptyBoard();
    newBoard = addRandomTile(newBoard);
    newBoard = addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
  }, [addRandomTile]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const slideAndMergeLine = (line, updatedScore) => {
    let filtered = line.filter(val => val !== 0);
    
    for (let i = 0; i < filtered.length - 1; i++) {
      if (filtered[i] === filtered[i + 1]) {
        filtered[i] *= 2;
        updatedScore.value += filtered[i];
        filtered[i + 1] = 0;
      }
    }
    
    filtered = filtered.filter(val => val !== 0);
    while (filtered.length < 4) {
      filtered.push(0);
    }
    
    return filtered;
  };

  const checkGameOver = (currentBoard) => {
    if (getEmptyCells(currentBoard).length > 0) return false;

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (c < 3 && currentBoard[r][c] === currentBoard[r][c + 1]) return false;
        if (r < 3 && currentBoard[r][c] === currentBoard[r + 1][c]) return false;
      }
    }
    return true;
  };

  const move = useCallback((direction) => {
    if (gameOver) return;

    let nextBoard = board.map(row => [...row]);
    let scoreGain = { value: 0 };
    let changed = false;

    const transpose = (matrix) => matrix[0].map((_, i) => matrix.map(row => row[i]));

    if (direction === "LEFT" || direction === "RIGHT") {
      nextBoard = nextBoard.map(row => {
        const targetRow = direction === "RIGHT" ? [...row].reverse() : row;
        let processed = slideAndMergeLine(targetRow, scoreGain);
        return direction === "RIGHT" ? processed.reverse() : processed;
      });
    } else if (direction === "UP" || direction === "DOWN") {
      let transposed = transpose(nextBoard);
      transposed = transposed.map(col => {
        const targetCol = direction === "DOWN" ? [...col].reverse() : col;
        let processed = slideAndMergeLine(targetCol, scoreGain);
        return direction === "DOWN" ? processed.reverse() : processed;
      });
      nextBoard = transpose(transposed);
    }

    changed = JSON.stringify(board) !== JSON.stringify(nextBoard);

    if (changed) {
      const boardWithNewTile = addRandomTile(nextBoard);
      setBoard(boardWithNewTile);
      setScore(prev => prev + scoreGain.value);
      
      if (checkGameOver(boardWithNewTile)) {
        setGameOver(true);
      }
    }
  }, [board, gameOver, addRandomTile]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowLeft": move("LEFT"); break;
        case "ArrowRight": move("RIGHT"); break;
        case "ArrowUp": move("UP"); break;
        case "ArrowDown": move("DOWN"); break;
        default: break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [move]);

  return (
    <div className="main-container" style={{ flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '460px', alignItems: 'center' }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'saddlebrown' }}>Score: {score}</div>
        <button 
          onClick={initGame}
          style={{ padding: '10px 20px', borderRadius: '5px', backgroundColor: 'saddlebrown', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Reset Game
        </button>
      </div>

      <div className="grid" style={{ position: 'relative' }}>
        {board.flatMap((row, rIdx) => 
          row.map((value, cIdx) => (
            <div key={`${rIdx}-${cIdx}`} className={`tile-${value}`}>
              {value !== 0 ? value : ""}
            </div>
          ))
        )}

        {gameOver && (
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: '15px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white'
          }}>
            <h2 style={{ fontSize: '36px', marginBottom: '10px' }}>Game Over!</h2>
            <button onClick={initGame} style={{ padding: '10px 20px', fontSize: '18px', cursor: 'pointer' }}>Try Again</button>
          </div>
        )}
      </div>
    </div>
  );
}

