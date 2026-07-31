import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NimPage from "./page";
import {
  createBoard,
  makeMove,
  isGameOver,
  remainingInRow,
  totalRemaining,
  isValidMove,
  findOptimalMove,
} from "./logic";

describe("nim logic", () => {
  it("creates a default board with 4 rows", () => {
    const board = createBoard();
    expect(board.length).toBe(4);
    expect(remainingInRow(board[0])).toBe(1);
    expect(remainingInRow(board[1])).toBe(3);
    expect(remainingInRow(board[2])).toBe(5);
    expect(remainingInRow(board[3])).toBe(7);
  });

  it("creates a custom board", () => {
    const board = createBoard([2, 4]);
    expect(board.length).toBe(2);
    expect(remainingInRow(board[0])).toBe(2);
    expect(remainingInRow(board[1])).toBe(4);
  });

  it("removes stones from a row", () => {
    const board = createBoard([3]);
    const next = makeMove(board, 0, 2);
    expect(remainingInRow(next[0])).toBe(1);
  });

  it("ignores illegal moves (too many)", () => {
    const board = createBoard([3]);
    const next = makeMove(board, 0, 5);
    expect(next).toBe(board); 
  });

  it("ignores illegal moves (zero or negative)", () => {
    const board = createBoard([3]);
    expect(makeMove(board, 0, 0)).toBe(board);
    expect(makeMove(board, 0, -1)).toBe(board);
  });

  it("detects game over when all stones removed", () => {
    let board = createBoard([2]);
    board = makeMove(board, 0, 2);
    expect(isGameOver(board)).toBe(true);
  });

  it("calculates total remaining stones", () => {
    const board = createBoard([1, 3, 5]);
    expect(totalRemaining(board)).toBe(9);
  });

  it("validates moves correctly", () => {
    const board = createBoard([3]);
    expect(isValidMove(board, 0, 1)).toBe(true);
    expect(isValidMove(board, 0, 3)).toBe(true);
    expect(isValidMove(board, 0, 4)).toBe(false);
    expect(isValidMove(board, 0, 0)).toBe(false);
  });

  it("finds an optimal move", () => {
    const board = createBoard([1, 3, 5, 7]);
    const move = findOptimalMove(board);
    expect(move).not.toBeNull();
    expect(move.rowIndex).toBeGreaterThanOrEqual(0);
    expect(move.count).toBeGreaterThanOrEqual(1);
  });

  it("finds optimal move in simple position", () => {
    // Only one row with 3 stones — AI should take 2 (leave 1 for player to lose)
    const board = createBoard([3]);
    const move = findOptimalMove(board);
    expect(move.count).toBe(2);
  });
});

describe("<NimPage />", () => {
  it("renders the game board", () => {
    render(<NimPage />);
    expect(screen.getByText("Nim")).toBeInTheDocument();
    expect(screen.getByText(/Your Turn/i)).toBeInTheDocument();
  });

  it("has a new game button", () => {
    render(<NimPage />);
    expect(screen.getByRole("button", { name: /new game/i })).toBeInTheDocument();
  });
});

