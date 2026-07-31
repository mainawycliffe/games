'use client'
import { useState, useEffect } from "react";
import { CardGrid } from "./components/CardGrid";


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function OddOneOut() {
  const [score, setScore] = useState(0);
  const [colors, setColors] = useState({ normal: "hsl(0, 50%, 50%)", odd: "hsl(0, 50%, 60%)" });
  const [oddIndex, setOddIndex] = useState(8);

  const generateNewRound = (currentScore) => {
    const hue = getRandomInt(0, 360);
    const saturation = getRandomInt(60, 90);
    const lightness = getRandomInt(30, 70);

    const difficultyGap = Math.max(2, 20 - currentScore * 1.2,);
    const oddLightness = lightness + difficultyGap > 90
      ? lightness - difficultyGap : lightness + difficultyGap;

    setColors({
      normal: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
      odd: `hsl(${hue}, ${saturation}%, ${oddLightness}%)`,
    });

    setOddIndex(getRandomInt(0, 8));
  };

  useEffect(() => {
    generateNewRound(0);
  }, []);

  const handleCardClick = (isCorrect) => {
    if (isCorrect) {
      const nextScore = score + 1;
      setScore(nextScore);
      generateNewRound(nextScore);
    } else {
      alert(`Game Over! Your final score is ${score}`);
      setScore(0);
      generateNewRound(0);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "2rem" }}>Odd One Out</h1>
      <h2>Score: {score}</h2>
      <CardGrid
        clickCorrectOdd={handleCardClick}
        normalColor={colors.normal}
        oddColor={colors.odd}
        oddIndex={oddIndex}
      />
    </div>
  );
}



