"use client";
import React, { useState, useEffect } from "react";

const createDeck = () => {
  const suits = ["♠", "♥", "♦", "♣"];
  const values = [
    { name: "2", val: 2 },
    { name: "3", val: 3 },
    { name: "4", val: 4 },
    { name: "5", val: 5 },
    { name: "6", val: 6 },
    { name: "7", val: 7 },
    { name: "8", val: 8 },
    { name: "9", val: 9 },
    { name: "10", val: 10 },
    { name: "J", val: 10 },
    { name: "Q", val: 10 },
    { name: "K", val: 10 },
    { name: "A", val: 11 },
  ];

  let deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ ...value, suit });
    }
  }

  return deck.sort(() => Math.random() - 0.5);
};

const calculateScore = (hand) => {
  let score = hand.reduce((acc, card) => acc + card.val, 0);
  let aces = hand.filter((card) => card.name === "A").length;

  while (score > 21 && aces > 0) {
    score -= 10;
    aces -= 1;
  }
  return score;
};

export default function BlackjackPage() {
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameState, setGameState] = useState("START"); // START, PLAYING, DEALER_TURN, OVER
  const [message, setMessage] = useState("Want to play a round?");

  const [chips, setChips] = useState(150);
  const playerName = "Player";

  const startNewGame = () => {
    const newDeck = createDeck();
    const pCard1 = newDeck.pop();
    const dCard1 = newDeck.pop();
    const pCard2 = newDeck.pop();
    const dCard2 = newDeck.pop();

    const pHand = [pCard1, pCard2];
    const dHand = [dCard1, dCard2];

    setDeck(newDeck);
    setPlayerHand(pHand);
    setDealerHand(dHand);

    const playerScore = calculateScore(pHand);
    if (playerScore === 21) {
      setGameState("OVER");
      setMessage("Blackjack! You win instantly!");
      setChips((prev) => prev + 50); // Reward payout
    } else {
      setGameState("PLAYING");
      setMessage("Do you want to draw a new card?");
    }
  };

  const handleHit = () => {
    if (gameState !== "PLAYING") return;

    const newDeck = [...deck];
    const nextCard = newDeck.pop();
    const newHand = [...playerHand, nextCard];

    setDeck(newDeck);
    setPlayerHand(newHand);

    if (calculateScore(newHand) > 21) {
      setGameState("OVER");
      setMessage("You're out of the game! (Bust)");
      setChips((prev) => prev - 20); 
    }
  };

  
  const handleStand = () => {
    if (gameState !== "PLAYING") return;
    setGameState("DEALER_TURN");
  };

    useEffect(() => {
      if (gameState !== "DEALER_TURN") return;

      const dealerScore = calculateScore(dealerHand);

      if (dealerScore < 17) {
        const timer = setTimeout(() => {
          const newDeck = [...deck];
          const nextCard = newDeck.pop();
          setDeck(newDeck);
          setDealerHand([...dealerHand, nextCard]);
        }, 800);
        return () => clearTimeout(timer);
      } else {
        // Delaying the execution slightly prevents cascading synchronous renders
        const endTimer = setTimeout(() => {
          setGameState("OVER");
          const playerScore = calculateScore(playerHand);

          if (dealerScore > 21) {
            setMessage("Dealer busts! You win!");
            setChips((prev) => prev + 20);
          } else if (playerScore > dealerScore) {
            setMessage(`You win! ${playerScore} beats ${dealerScore}.`);
            setChips((prev) => prev + 20);
          } else if (playerScore < dealerScore) {
            setMessage(`Dealer wins! ${dealerScore} beats ${playerScore}.`);
            setChips((prev) => prev - 20);
          } else {
            setMessage(`It's a tie (Push) at ${playerScore}!`);
          }
        }, 0);

        return () => clearTimeout(endTimer);
      }
    }, [gameState, dealerHand, deck, playerHand]);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Blackjack</h1>
      <p style={styles.text}>{message}</p>

      {gameState === "START" ? (
        <button onClick={startNewGame} style={styles.button}>
          START GAME
        </button>
      ) : (
        <div>
          <div style={styles.section}>
            <p style={styles.sectionTitle}>
              Dealer Hand (Score: {gameState === "PLAYING" ? "?" : calculateScore(dealerHand)})
            </p>
            <div style={styles.handContainer}>
              {dealerHand.map((card, index) => (
                <div key={index} style={styles.card}>
                  {index === 1 && gameState === "PLAYING" ? (
                    <div style={{ color: "#e40505" }}>❓</div>
                  ) : (
                    <div style={{ color: ["♥", "♦"].includes(card.suit) ? "#d32f2f" : "#222" }}>
                      {card.name}
                      {card.suit}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={styles.section}>
            <p style={styles.sectionTitle}>Your Hand (Score: {calculateScore(playerHand)})</p>
            <div style={styles.handContainer}>
              {playerHand.map((card, index) => (
                <div key={index} style={styles.card}>
                  <div style={{ color: ["♥", "♦"].includes(card.suit) ? "#d32f2f" : "#222" }}>
                    {card.name}
                    {card.suit}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            {gameState === "PLAYING" && (
              <>
                <button onClick={handleHit} style={styles.button}>
                  Hit
                </button>
                <button onClick={handleStand} style={styles.button}>
                  Stand
                </button>
              </>
            )}
            {gameState === "OVER" && (
              <button onClick={startNewGame} style={styles.button}>
                Play Again
              </button>
            )}
          </div>
        </div>
      )}

      {/* CHIPS PANEL */}
      <p style={styles.chipText}>
        {playerName}: ${chips}
      </p>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: "#016D29",
    color: "white",
    textAlign: "center",
    padding: "30px 20px",
    borderRadius: "12px",
    margin: "50px auto 0 auto",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
  },
  heading: {
    color: "#E4A834",
    fontSize: "42px",
    margin: "0 0 10px 0",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  text: {
    fontSize: "18px",
    margin: "10px 0 20px 0",
    minHeight: "27px",
  },
  section: {
    margin: "15px 0",
    padding: "10px",
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: "8px",
  },
  sectionTitle: {
    margin: "0 0 10px 0",
    fontSize: "15px",
    opacity: 0.9,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  handContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    minHeight: "90px",
  },
  card: {
    width: "60px",
    height: "90px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "bold",
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
  },
  button: {
    color: "#016D29",
    width: "130px",
    backgroundColor: "#E4A834",
    padding: "12px 0",
    border: "none",
    fontWeight: "bold",
    fontSize: "15px",
    borderRadius: "4px",
    cursor: "pointer",
    margin: "6px",
    textTransform: "uppercase",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  },
  chipText: {
    fontSize: "20px",
    fontWeight: "bold",
    marginTop: "25px",
    color: "#E4A834",
  },
};
