export function mineLayout() {
  const board = Array(81).fill("");
  const totalMines = 10;
  let minesPlanted = 0;

  while (minesPlanted < totalMines) {
    const randomIndex = Math.floor(Math.random() * 81);
    
    if (board[randomIndex] !== "💣") {
      board[randomIndex] = "💣";
      minesPlanted++;
    }
  }

  for (let index = 0; index < 81; index++) {
    if (board[index] === "💣") continue;

    const row = Math.floor(index / 9);
    const col = index % 9;
    let mineCount = 0;

    for (let rOffset = -1; rOffset <= 1; rOffset++) {
      for (let cOffset = -1; cOffset <= 1; cOffset++) {
        const targetRow = row + rOffset;
        const targetCol = col + cOffset;

        if (targetRow >= 0 && targetRow < 9 && targetCol >= 0 && targetCol < 9) {
          const targetIndex = targetRow * 9 + targetCol;
          if (board[targetIndex] === "💣") {
            mineCount++;
          }
        }
      }
    }

    if (mineCount > 0) {
      board[index] = mineCount.toString();
    }
  }

  return board;
}


export function calculateFloodReveal(index, openedSquares, mines) {
  const updatedBoard = [...openedSquares];
  const queue = [index];

  while (queue.length > 0) {
    const current = queue.shift();
    if (updatedBoard[current]) continue;

    updatedBoard[current] = true;

    if (mines[current] === ""|| mines[current]===0 || mines[current]==="0") {
      const row = Math.floor(current / 9);
      const col = current % 9;

      for (let rOffset = -1; rOffset <= 1; rOffset++) {
        for (let cOffset = -1; cOffset <= 1; cOffset++) {
          const targetRow = row + rOffset;
          const targetCol = col + cOffset;

          if (targetRow >= 0 && targetRow < 9 && targetCol >= 0 && targetCol < 9) {
            const neighborIndex = targetRow * 9 + targetCol;
            if (!updatedBoard[neighborIndex] && mines[neighborIndex] !== "💣") {
              queue.push(neighborIndex);
            }
          }
        }
      }
    }
  }

  return updatedBoard;
}

