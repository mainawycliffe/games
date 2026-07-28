import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TowerOfHanoiPage from "./page";
import { initializeGame, makeMove, checkWin, getMinimumMoves } from "./logic";

describe("tower of hanoi logic", () => {
  it("initializes a game with given disks correctly sorted", () => {
    const rods = initializeGame(3);
    expect(rods).toEqual([[3, 2, 1], [], []]);
  });

  it("calculates minimum moves accurately", () => {
    expect(getMinimumMoves(3)).toBe(7);
    expect(getMinimumMoves(5)).toBe(31);
  });

  it("allows moving a smaller disk onto an empty peg", () => {
    const startState = [[3, 2, 1], [], []];
    const nextState = makeMove(startState, 0, 1);
    expect(nextState).toEqual([[3, 2], [1], []]);
  });

  it("prevents moving a larger disk onto a smaller disk", () => {
    const startState = [[3, 2], [1], []];
    const nextState = makeMove(startState, 0, 1);
    expect(nextState).toBe(startState);
  });

  it("detects a win when all disks reach the destination peg", () => {
    expect(checkWin([[], [], [3, 2, 1]], 3)).toBe(true);
    expect(checkWin([[3, 2, 1], [], []], 3)).toBe(false);
  });
});

describe("<TowerOfHanoiPage />", () => {
  it("completes a perfect game using drag and drop mechanics", async () => {
    render(<TowerOfHanoiPage />);

    const simulateMove = (fromIndex, toIndex) => {
      const targetRod = screen.getByTestId(`rod-${toIndex}`);
      const topDisk = screen.getByTestId(`top-disk-rod-${fromIndex}`);

      const dragStartEvent = {
        dataTransfer: {
          setData: vi.fn(),
          getData: vi.fn(() => fromIndex.toString()),
        },
      };

      fireEvent.dragStart(topDisk, dragStartEvent);
      fireEvent.dragOver(targetRod);
      fireEvent.drop(targetRod, {
        preventDefault: vi.fn(),
        dataTransfer: dragStartEvent.dataTransfer,
      });
    };

    simulateMove(0, 2);
    simulateMove(0, 1);
    simulateMove(2, 1);
    simulateMove(0, 2);
    simulateMove(1, 0);
    simulateMove(1, 2);
    simulateMove(0, 2);

    expect(screen.getByText(/Puzzle Solved Successfully/i)).toBeInTheDocument();
    expect(screen.getByTestId("move-counter")).toHaveTextContent("7");
  });
});
