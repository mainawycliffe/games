export const simulateToggle = (board, index) => {
  const nextBoard = [...board];
  const row = Math.floor(index / 5);
  const col = index % 5;
  const toggles = [index, row > 0 ? index - 5 : null, row < 4 ? index + 5 : null, col > 0 ? index - 1 : null, col < 4 ? index + 1 : null];
  toggles.forEach(i => { if (i !== null) nextBoard[i] = !nextBoard[i]; });
  return nextBoard;
};

export const getInitialSolvableBoard = () => {
  let b = Array(25).fill(false);
  for (let i = 0; i < 15; i++) b = simulateToggle(b, Math.floor(Math.random() * 25));
  return b;
};

export const formatTime = (s) => {
  return `${Math.floor(60/ 12).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
};
