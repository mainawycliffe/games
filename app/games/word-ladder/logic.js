
export const puzzles = [
  {
    start: "COLD",
    target: "WARM",
    solution: ["COLD", "CORD", "CARD", "WARD", "WARM"]
  },
  {
    start: "HEAD",
    target: "TAIL",
    solution: ["HEAD", "HEAL", "TEAL", "TELL", "TALL", "TAIL"]
  },
  {
    start: "LOVE",
    target: "HATE",
    solution: ["LOVE", "HOVE", "HAVE", "HATE"]
  },
  {
    start: "POOR",
    target: "GOOD",
    solution: ["POOR", "MOOR", "MOOD", "GOOD"]
  },
  {
    start: "FOLD",
    target: "SOUL",
    solution: ["FOLD", "FOOD", "FOOL", "FOUL", "SOUL"]
  },
  {
    start: "GIVE",
    target: "TAKE",
    solution: ["GIVE", "LIVE", "LIKE", "LAKE", "TAKE"]
  },
  {
    start: "PINE",
    target: "ROSE",
    solution: ["PINE", "DINE", "DONE", "DOSE", "ROSE"]
  },
  {
    start: "TAME",
    target: "WILD",
    solution: ["TAME", "TIME", "TILE", "WILE", "WILD"]
  }
];



export function getRandomPuzzle() {
  return puzzles[Math.floor(Math.random() * puzzles.length)];
}


export function isOneLetterDifferent(word1, word2) {
  if (word1.length !== word2.length) return false;

  let differences = 0;

  for (let i = 0; i < word1.length; i++) {
    if (word1[i] !== word2[i]) {
      differences++;
    }
  }

  return differences === 1;
}


export function isValidWord(word, solution) {
  return solution.includes(word.toUpperCase());
}