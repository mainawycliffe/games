"use client";
import { useState, useEffect } from "react";
import { createBoard, revealCell, checkWinStatus } from "./useMinesweeper";
import "./minesweeper.css";

export default function Minesweeper() {
  const [difficulty, setDifficulty] = useState({ rows: 9, cols: 9, mines: 10 });
  const [board, setBoard] = useState([]);
  const [gameState, setGameState] = useState("idle"); 
  const [mineCount, setMineCount] = useState(10);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    resetGame();
  }, [difficulty]);

  useEffect(() => {
    let interval;
    if (gameState === "playing") {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const resetGame = () => {
    const emptyBoard = Array(difficulty.rows).fill(null).map(() =>
      Array(difficulty.cols).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      }))
    );
    setBoard(emptyBoard);
    setGameState("idle");
    setMineCount(difficulty.mines);
    setTimer(0);
  };

  const handleLeftClick = (r, c) => {
    if (gameState === "won" || gameState === "lost" || board[r][c].isFlagged) return;

    let currentBoard = JSON.parse(JSON.stringify(board));
    let nextState = gameState;

    if (gameState === "idle") {
      currentBoard = createBoard(difficulty.rows, difficulty.cols, difficulty.mines, r, c);
      nextState = "playing";
    }

    if (currentBoard[r][c].isMine) {
      currentBoard.forEach(row => row.forEach(cell => { if (cell.isMine) cell.isRevealed = true; }));
      setGameState("lost");
      setBoard(currentBoard);
      return;
    }

    currentBoard = revealCell(currentBoard, r, c);
    
    if (checkWinStatus(currentBoard, difficulty.mines)) {
      nextState = "won";
    }

    setGameState(nextState);
    setBoard(currentBoard);
  };

  const handleRightClick = (e, r, c) => {
    e.preventDefault();
    if (gameState === "lost" || gameState === "won" || board[r][c].isRevealed) return;

    const currentBoard = [...board];
    const cell = currentBoard[r][c];
    cell.isFlagged = !cell.isFlagged;
    
    setMineCount(prev => prev + (cell.isFlagged ? -1 : 1));
    setBoard(currentBoard);
    if (gameState === "idle") setGameState("playing");
  };

  return (
    <div className="game-container">
      <div className="window-box">
        <h1 className="title">MINESWEEPER</h1>
        
        <div className="controls">
          <button onClick={() => setDifficulty({ rows: 9, cols: 9, mines: 10 })} className={difficulty.mines === 10 ? "active" : ""}>Easy</button>
          <button onClick={() => setDifficulty({ rows: 16, cols: 16, mines: 40 })} className={difficulty.mines === 40 ? "active" : ""}>Medium</button>
          <button onClick={() => setDifficulty({ rows: 16, cols: 30, mines: 99 })} className={difficulty.mines === 99 ? "active" : ""}>Hard</button>
        </div>

        <div className="dashboard">
          <div className="stat">💣 {mineCount}</div>
          <div className="status-face">
            {gameState === "won" ? "😎" : gameState === "lost" ? "💥" : "🙂"}
          </div>
          <div className="stat">⏱️ {String(timer).padStart(3, "0")}</div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: `repeat(${difficulty.cols}, 1fr)` }}>
          {board.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                onClick={() => handleLeftClick(r, c)}
                onContextMenu={(e) => handleRightClick(e, r, c)}
                className={`cell ${cell.isRevealed ? "revealed" : ""} ${cell.isFlagged ? "flagged" : ""}`}
              >
                {cell.isRevealed && cell.isMine && "💣"}
                {cell.isRevealed && !cell.isMine && cell.neighborMines > 0 && cell.neighborMines}
                {!cell.isRevealed && cell.isFlagged && "🚩"}
              </div>
            ))
          )}
        </div>

        <button className="global-restart-btn" onClick={resetGame}>
          Restart Game
        </button>

        {gameState === "won" && <div className="banner win">Victory! You cleared the field!</div>}
        {gameState === "lost" && <div className="banner lose">Game Over! You hit a mine.</div>}
      </div>
    </div>
  );
}



