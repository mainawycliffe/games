"use client";

import { useState, useEffect } from "react";
import confetti from "canvas-confetti"; 
import "./game.css";

import {
  getRandomPuzzle,
  isOneLetterDifferent,
  isValidWord
} from "./logic";

export default function Game() {
  const [game, setGame] = useState(null);
  const [currentWord, setCurrentWord] = useState("");
  const [history, setHistory] = useState([]);
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [moves, setMoves] = useState(0);
  
  const [time, setTime] = useState(60);
  const [isWon, setIsWon] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    let interval = null;
    
    if (game && isStarted && !isWon) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            loadNewPuzzle();
            setMessage("⏰ Time's up! New challenge loaded.");
            return 60;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [game, isStarted, isWon]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  function submitWord() {
    if (isWon || !isStarted) return;

    const word = guess.toUpperCase();

    if (word.length !== currentWord.length) {
      setMessage("Word must have the same letters.");
      return;
    }

    if (!isOneLetterDifferent(currentWord, word)) {
      setMessage("Only one letter can change.");
      return;
    }

    if (!isValidWord(word, game.solution)) {
      setMessage("That word is not part of this ladder.");
      return;
    }

    setCurrentWord(word);
    setHistory([...history, word]);
    setMoves(moves + 1);
    setGuess("");

    if (word === game.target) {
      setMessage("🎉 You Win!");
      setIsWon(true);
      
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#433A88", "#D23C89", "#D6C5E3"]
      });
    } else {
      setMessage("Correct!");
    }
  }

  function loadNewPuzzle() {
    const puzzle = getRandomPuzzle();
    setGame(puzzle);
    setCurrentWord(puzzle.start);
    setHistory([puzzle.start]);
    setMoves(0);
    setGuess("");
  }

  function handleStartGame() {
    loadNewPuzzle();
    setTime(60);
    setIsWon(false);
    setMessage("");
    setIsStarted(true);
  }

  function handleResetGame() {
    loadNewPuzzle();
    setTime(60);
    setIsWon(false);
    setMessage("");
  }

  if (!isStarted) {
    return (
      <div className="game-card" style={{ textAlign: "center" }}>
        <h1 style={{ fontWeight: 900, marginBottom: "20px" }}>WORD LADDER</h1>
        <p className="subtitle" style={{ fontSize: "1.2rem", marginBottom: "40px" }}>
          Change exactly one letter at a time to mutate your current word into the target destination word before your 60-second timer hits zero.
        </p>
        <button 
          onClick={handleStartGame} 
          style={{ fontSize: "1.4rem", padding: "18px 45px", borderRadius: "20px" }}
        >
          🚀 Start Game
        </button>
      </div>
    );
  }

  return (
    <div className="game-card">
      <h1 style={{ fontWeight: 900 }}>WORD LADDER</h1>

      <p className="subtitle">
        Change one letter at a time to reach the target word.
      </p>

      <div className="words">
        <div>
          <p>Current</p>
          <div className="word-box">{currentWord}</div>
        </div>

        <div>
          <p>Target</p>
          <div className="word-box target">{game.target}</div>
        </div>
      </div>

      <div className="stats">
        <div>
          <span>Moves</span>
          <h2>{moves}</h2>
        </div>

        <div>
          <span>Time Left</span>
          <h2 style={{ color: time <= 10 ? "#D23C89" : "inherit" }}>
            {formatTime(time)}
          </h2>
        </div>

        <div>
          <span>Steps</span>
          <h2>{game.solution.length - 1}</h2>
        </div>
      </div>

      <input
        value={guess}
        placeholder={isWon ? "You won! Click New Game." : "Enter next word"}
        disabled={isWon}
        onChange={(e) => setGuess(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submitWord();
        }}
      />

      <div className="buttons">
        <button onClick={submitWord} disabled={isWon}>
          Submit
        </button>

        <button className="restart" onClick={handleResetGame}>
          New Game
        </button>
      </div>

      <p className="message">{message}</p>

      <div className="history">
        {history.map((word, index) => (
          <div className="history-word" key={index}>
            {word}
          </div>
        ))}
      </div>
    </div>
  );
}
