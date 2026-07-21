import { describe, test, expect, vi } from "vitest";
import { createGameState, updateGame } from "./logic";

describe("Space Invaders Core Mechanics Unit Tests", () => {
  const CANVAS_WIDTH = 480;
  const CANVAS_HEIGHT = 500;

  test("Initial game factory states are configured correctly", () => {
    const state = createGameState(CANVAS_WIDTH, CANVAS_HEIGHT);

    expect(state.player.w).toBe(30);
    expect(state.player.h).toBe(20);
    expect(state.playerLasers.length).toBe(0);
    expect(state.alienLasers.length).toBe(0);

    expect(state.invaders.length).toBe(32);
    expect(state.invaders[0].alive).toBe(true);
  });

  test("Player moves left cleanly when ArrowLeft key vector is engaged", () => {
    const state = createGameState(CANVAS_WIDTH, CANVAS_HEIGHT);
    const initialX = state.player.x;
    const keys = { ArrowLeft: true };

    updateGame(state, keys, 1000, CANVAS_WIDTH, CANVAS_HEIGHT, vi.fn(), vi.fn(), vi.fn());

    expect(state.player.x).toBeLessThan(initialX);
  });

  test("Player moves right cleanly when ArrowRight key vector is engaged", () => {
    const state = createGameState(CANVAS_WIDTH, CANVAS_HEIGHT);
    const initialX = state.player.x;
    const keys = { ArrowRight: true };

    updateGame(state, keys, 1000, CANVAS_WIDTH, CANVAS_HEIGHT, vi.fn(), vi.fn(), vi.fn());

    expect(state.player.x).toBeGreaterThan(initialX);
  });

  test("Spacebar triggers a defensive laser beam spawn", () => {
    const state = createGameState(CANVAS_WIDTH, CANVAS_HEIGHT);
    const keys = { Space: true };

    updateGame(state, keys, 1000, CANVAS_WIDTH, CANVAS_HEIGHT, vi.fn(), vi.fn(), vi.fn());

    expect(state.playerLasers.length).toBe(1);
    expect(state.playerLasers[0].speed).toBe(6);
  });

  test("Win state condition triggers when zero active aliens remain", () => {
    const state = createGameState(CANVAS_WIDTH, CANVAS_HEIGHT);
    const keys = {};
    const onWinSpy = vi.fn();

    state.invaders = [];

    updateGame(state, keys, 1000, CANVAS_WIDTH, CANVAS_HEIGHT, onWinSpy, vi.fn(), vi.fn());

    expect(onWinSpy).toHaveBeenCalled();
  });

  test("Lose state condition triggers if aliens land past player height", () => {
    const state = createGameState(CANVAS_WIDTH, CANVAS_HEIGHT);
    const keys = {};
    const onLoseSpy = vi.fn();

    state.invaders = [{ x: 100, y: state.player.y + 10, w: 25, h: 18, alive: true }];

    updateGame(state, keys, 1000, CANVAS_WIDTH, CANVAS_HEIGHT, vi.fn(), onLoseSpy, vi.fn());

    expect(onLoseSpy).toHaveBeenCalled();
  });
});
