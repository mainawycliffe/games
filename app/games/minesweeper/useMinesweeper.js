export const createBoard = (rows, cols, mines, firstRow, firstCol) => {
  let board = Array(rows).fill(null).map(() =>
    Array(cols).fill(null).map(() => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborMines: 0,
    }))
  );

  let minesPlaced = 0;
  while (minesPlaced < mines) {
    let r = Math.floor(Math.random() * rows);
    let c = Math.floor(Math.random() * cols);
    if (!board[r][c].isMine && !(Math.abs(r - firstRow) <= 1 && Math.abs(c - firstCol) <= 1)) {
      board[r][c].isMine = true;
      minesPlaced++;
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].isMine) continue;
      let count = 0;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (board[r + i]?.[c + j]?.isMine) count++;
        }
      }
      board[r][c].neighborMines = count;
    }
  }
  return board;
};

export const revealCell = (board, r, c) => {
  if (board[r][c].isRevealed || board[r][c].isFlagged) return board;
  board[r][c].isRevealed = true;

  if (board[r][c].neighborMines === 0 && !board[r][c].isMine) {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (board[r + i]?.[c + j]) {
          revealCell(board, r + i, c + j);
        }
      }
    }
  }
  return board;
};

export const checkWinStatus = (board, mines) => {
  let unrevealedSafeCells = 0;
  board.forEach(row => {
    row.forEach(cell => {
      if (!cell.isMine && !cell.isRevealed) unrevealedSafeCells++;
    });
  });
  return unrevealedSafeCells === 0;
};

