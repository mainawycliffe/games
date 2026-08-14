"use client";

import { useState, useEffect } from "react";
import { generateSudoku } from "./sudokuUtils";
import "./sudoku.css";

export default function SudokuBoard() {
  const [puzzle, setPuzzle] = useState(null);
  const [solution, setSolution] = useState(null);
  const [board, setBoard] = useState(null);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");

  function startNewGame() {
    const { puzzle, solution } = generateSudoku();
    setPuzzle(puzzle);
    setSolution(solution);
    setBoard(puzzle.map((row) => [...row]));
    setSelected(null);
    setMessage("");
  }

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (!selected) return;

      const num = parseInt(event.key, 10);
      if (num >= 1 && num <= 9) {
        handleNumberInput(num);
      } else if (event.key === "Backspace" || event.key === "Delete" || event.key === "0") {
        handleErase();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected, board]);

  function handleCellClick(row, col) {
    if (puzzle[row][col] !== 0) return;
    setSelected({ row, col });
  }

  function handleNumberInput(num) {
    if (!selected) return;
    const { row, col } = selected;
    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = num;
    setBoard(newBoard);
    setMessage("");
  }

  function handleErase() {
    if (!selected) return;
    const { row, col } = selected;
    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = 0;
    setBoard(newBoard);
  }

  function isCellConflicting(r, c, val) {
    if (!val) return false;
    for (let i = 0; i < 9; i++) {
      if (i !== c && board[r][i] === val) return true;
      if (i !== r && board[i][c] === val) return true;
      const boxRow = 3 * Math.floor(r / 3) + Math.floor(i / 3);
      const boxCol = 3 * Math.floor(c / 3) + (i % 3);
      if ((boxRow !== r || boxCol !== c) && board[boxRow][boxCol] === val) return true;
    }
    return false;
  }

  function checkSolution() {
    const isComplete = board.every((row) => row.every((cell) => cell !== 0));
    if (!isComplete) {
      setMessage("Board isn't full yet.");
      return;
    }

    const isCorrect = board.every((row, r) => row.every((cell, c) => cell === solution[r][c]));

    setMessage(isCorrect ? "Solved correctly!" : " Something's wrong.");
  }

  if (!board) return <div>Loading...</div>;

  return (
    <div className="sudoku-container">
      <h1 className="sudoku-title">Sudoku</h1>

      <div className="sudoku-grid">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isFixed = puzzle[rowIndex][colIndex] !== 0;
            const isSelected = selected && selected.row === rowIndex && selected.col === colIndex;
            const hasConflict = isCellConflicting(rowIndex, colIndex, cell);

            const classNames = [
              "sudoku-cell",
              colIndex % 3 === 0 ? "border-left-thick" : "",
              rowIndex % 3 === 0 ? "border-top-thick" : "",
              colIndex === 8 ? "border-right-thick" : "",
              rowIndex === 8 ? "border-bottom-thick" : "",
              isFixed ? "cell-fixed" : "cell-editable",
              isSelected ? "cell-selected" : "",
              hasConflict ? "cell-conflict" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className={classNames}
              >
                {cell !== 0 ? cell : ""}
              </button>
            );
          }),
        )}
      </div>

      <div className="number-pad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button key={num} onClick={() => handleNumberInput(num)} className="number-button">
            {num}
          </button>
        ))}
        <button onClick={handleErase} className="erase-button">
          Erase
        </button>
      </div>

      <div className="action-buttons">
        <button onClick={checkSolution} className="btn btn-check">
          Check
        </button>
        <button onClick={startNewGame} className="btn btn-easy">
          New Game
        </button>
      </div>

      {message && <p className="message">{message}</p>}
    </div>
  );
}
