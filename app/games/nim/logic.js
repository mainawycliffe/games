export function createBoard(rowSizes = [1, 3, 5, 7]) {
  return rowSizes.map((size, rowIndex) =>
    Array.from({ length: size }, () => ({
      id: `${rowIndex}-${Math.random().toString(36).slice(2)}`,
      removed: false,
    })),
  );
}

export function makeMove(board, rowIndex, count) {
  const row = board[rowIndex];
  const available = row.filter((obj) => !obj.removed);

  if (count <= 0 || count > available.length) return board;

  let stonesToKill = count;

  return board.map((r, i) => {
    if (i !== rowIndex) return r;

    const newRow = [...r];
    for (let j = newRow.length - 1; j >= 0; j--) {
      if (!newRow[j].removed && stonesToKill > 0) {
        newRow[j] = { ...newRow[j], removed: true };
        stonesToKill--;
      }
    }
    return newRow;
  });
}

export function isGameOver(board) {
  return board.every((row) => row.every((obj) => obj.removed));
}

export function remainingInRow(row) {
  return row.filter((obj) => !obj.removed).length;
}

export function totalRemaining(board) {
  return board.reduce((sum, row) => sum + remainingInRow(row), 0);
}

export function isValidMove(board, rowIndex, count) {
  if (rowIndex < 0 || rowIndex >= board.length) return false;
  const available = remainingInRow(board[rowIndex]);
  return count >= 1 && count <= available;
}

export function findOptimalMove(board) {
  for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
    if (remainingInRow(board[rowIndex]) > 0) {
      return { rowIndex, count: 1 };
    }
  }
  return null;
}
