"use client";
import React, { useState } from "react";
import styles from "./game.css";

const gameChoices = ["rock", "paper", "scissors", "lizard", "spock"];

const gameRules = {
  rock: { scissors: "crushes", lizard: "crushes" },
  paper: { rock: "covers", spock: "disproves" },
  scissors: { paper: "cuts", lizard: "dicapitates" },
  lizard: { spock: "poisons", paper: "eats" },
  spock: { scissors: "smashes", rock: "vaporizes" },
};

export default function RpsLizardSpock() {
  const [humanScore, setHumanScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [gameCount, setGameCount] = useState(0);

  const [humanChoice, setHumanChoice] = useState("");
  const [computerChoice, setComputerChoice] = useState("");
  const [gameStatus, setGameStatus] = useState("Start The Game");

  const playRound = (playerMove) => {
    const compMove = gameChoices[Math.floor(Math.random() * gameChoices.length)];

   
    const lowerPlayerMove = playerMove.toLowerCase();
    const machinecompMOve = compMove.charAt(0).toUpperCase() + compMove.slice(1);

    
    setHumanChoice(playerMove);
    setComputerChoice(machinecompMOve);
    setGameCount((prev) => prev + 1);

    if (lowerPlayerMove === compMove) {
      setGameStatus("It's a Draw");
      return;
    }

    if (gameRules[lowerPlayerMove] && gameRules[lowerPlayerMove][compMove]) {
      setHumanScore((prev) => prev + 1);
      setGameStatus("You have won");
      return;
    } else {
      setComputerScore((prev) => prev + 1);
      setGameStatus("You have lost");
    }
  };

  const Rock = () => playRound("Rock");
  const Paper = () => playRound("Paper");
  const Scissors = () => playRound("Scissors");
  const Lizard = () => playRound("Lizard");
  const Spock = () => playRound("Spock");

  const reset = () => {
    setHumanScore(0);
    setComputerScore(0);
    setGameCount(0);
    setHumanChoice("");
    setComputerChoice("");
    setGameStatus("Start The Game");
  };

  return (
    <main>
      <article>
        <nav>
          <h3>Welcome to our game! Have Funnnn!!!!!</h3>
        </nav>
        <header>
          <div className="rock-paper">
            <h1 className="heading">Rock Paper Scissors Lizard Spock</h1>
            <p>Your opponent is a computer</p>
          </div>
        </header>

        <section>
          <div className="scores">
            <h3>Score</h3>
            <div className="human">
              <p className="number">{humanScore}</p>
              <p className="player">Human</p>
              <p className="choice-text">{humanChoice || "-"}</p>
            </div>

            <div className="comp">
              <p className="number">{computerScore}</p>
              <p className="player">Computer</p>
              <p className="choice-text">{computerChoice || "-"}</p>
            </div>
          </div>
        </section>

        <section>
          <div className="buttons">
            <h4>{gameStatus}</h4>
            <div className="button-choices">
              <button onClick={Rock}>Rock</button>
              <button onClick={Paper}>Paper</button>
              <button onClick={Scissors}>Scissors</button>
              <button onClick={Lizard}>Lizard</button>
              <button onClick={Spock}>Spock</button>
            </div>

            <div className="reset-button">
              <button onClick={reset}>Reset</button>
            </div>

            <p className="game-count">Game Count: {gameCount}</p>
          </div>
        </section>
      </article>
    </main>
  );
}
