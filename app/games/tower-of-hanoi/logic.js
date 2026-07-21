export function initializeGame(diskCount) {
  const peg0 = [];
  for (let i = diskCount; i > 0; i--) {
    peg0.push(i);
  }
  return [peg0, [], []];
}

export function makeMove(rods, fromPeg, toPeg) {
  if (fromPeg === toPeg) return rods;

  const sourcePeg = rods[fromPeg];
  const targetPeg = rods[toPeg];

  if (!sourcePeg || sourcePeg.length === 0) return rods;

  const diskToMove = sourcePeg[sourcePeg.length - 1];
  const topTargetDisk = targetPeg[targetPeg.length - 1];

  if (topTargetDisk !== undefined && diskToMove > topTargetDisk) return rods;

  const nextRods = rods.map((peg) => [...peg]);
  nextRods[fromPeg].pop();
  nextRods[toPeg].push(diskToMove);

  return nextRods;
}

export function checkWin(rods, diskCount) {
  return rods[2].length === diskCount;
}

export function getMinimumMoves(diskCount) {
  return Math.pow(2, diskCount) - 1;
}
