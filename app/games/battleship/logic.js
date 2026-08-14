export const GRID_SIZE = 10;

export const SHIPS = [
  { name: "Carrier", length: 5 },
  { name: "Battleship", length: 4 },
  { name: "Cruiser", length: 3 },
  { name: "Submarine", length: 3 },
  { name: "Destroyer", length: 2 },
];

export function createEmptyGrid() {
  return Array.from({ length: GRID_SIZE * GRID_SIZE }, () => ({ ship: null }));
}

function canPlace(grid, row, col, length, horizontal) {
  for (let i = 0; i < length; i++) {
    const r = horizontal ? row : row + i;
    const c = horizontal ? col + i : col;
    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false;
    if (grid[r * GRID_SIZE + c].ship !== null) return false;
  }
  return true;
}

function placeShip(grid, name, length, row, col, horizontal) {
  for (let i = 0; i < length; i++) {
    const r = horizontal ? row : row + i;
    const c = horizontal ? col + i : col;
    grid[r * GRID_SIZE + c].ship = name;
  }
}

export function placeShipsRandomly(grid) {
  const board = grid.map((cell) => ({ ...cell }));
  for (const ship of SHIPS) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 1000) {
      attempts++;
      const horizontal = Math.random() < 0.5;
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      if (canPlace(board, row, col, ship.length, horizontal)) {
        placeShip(board, ship.name, ship.length, row, col, horizontal);
        placed = true;
      }
    }
  }
  return board;
}

export function getSunkShips(grid, shots) {
  const shotSet = new Set(shots);
  const sunk = [];
  for (const ship of SHIPS) {
    const cells = grid.filter((cell) => cell.ship === ship.name);
    if (cells.length === ship.length && cells.every((cell) => shotSet.has(grid.indexOf(cell)))) {
      sunk.push(ship.name);
    }
  }
  return sunk;
}

export function checkWinCondition(grid, shots) {
  const shotSet = new Set(shots);
  return grid.every((cell) => cell.ship === null || shotSet.has(grid.indexOf(cell)));
}
