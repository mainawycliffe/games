'use client';
import { useState, useEffect } from 'react';

const maze_glade = [
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
[2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
[1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
[1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
[1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
[1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
[1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
[1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
[1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
[1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
[1, 2, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
[1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1],
[1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
[1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1],
[1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
[1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
[1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
[1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
[1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1],
[1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
[1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
[1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
[1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
[1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
[1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
[1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
[1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1],
[1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
[0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
[0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 3],
[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1]
];

const initial_player_position = { x: 1, y: 0 };
const initial_time = 90;

export default function MazeGame() {
  const [playerPos, setPlayerPos] = useState(initial_player_position);
  const [hasWon, setHasWon] = useState(false);
  const [timeLeft, setTimeLeft] = useState(initial_time);
  const [isGameOver, setIsGameOver] = useState(false);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);

  const handleRestart = () => {
    setPlayerPos(initial_player_position);
    setHasWon(false);
    setIsGameOver(false);
    setTimeLeft(initial_time);
    setIsGameStarted(false);
  };

  useEffect(() => {
    if (hasWon || isGameOver || !isGameStarted) 
      return;

        if (timeLeft <= 0) {
          setIsGameOver(true);
          setLosses(prev => prev + 1);
          return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, hasWon, isGameOver, isGameStarted]);


  useEffect(() => {
    if (hasWon || isGameOver || !isGameStarted) return;

    const handleKeyDown = (e) => {
      let newX = playerPos.x;
      let newY = playerPos.y;

      if (e.key === 'ArrowUp') newY -= 1;
      else if (e.key === 'ArrowDown') newY += 1;
      else if (e.key === 'ArrowLeft') newX -= 1;
      else if (e.key === 'ArrowRight') newX += 1;


      const isValidMove =
        newY >= 0 && newY < maze_glade.length &&
        newX >= 0 && newX < maze_glade[0].length &&
        maze_glade[newY][newX] !== 0;

      if (isValidMove) {
        setPlayerPos({ x: newX, y: newY });


        if (maze_glade[newY][newX] === 3) {
          setHasWon(true);
          setWins(prev => prev + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPos, hasWon, isGameOver, isGameStarted]);




    return (
    <div style={{ textAlign: 'center', margin: '50px', fontFamily: 'sans-serif' }}>
      <h1 style={{ margin: '20px ', fontSize: '50px', fontWeight: 'bold' }}>Maze Runner</h1>
      <h2>{!isGameStarted ? 'Click the pink ball to unlock movement and start the game! ' : 'Navigate using your arrow keys'}</h2>


      <div style={{ margin: '20px ', fontSize: '20px', fontWeight: 'bold' }}>
        {hasWon && <span style={{ color: 'green' }}>You Won!! </span>}
        {isGameOver && <span style={{ color: 'red' }}>Game Over! You ran out of time. 💀</span>}
        {!hasWon && !isGameOver && <span>Time Remaining: {timeLeft}s</span>}
      </div> 

      <div style={{
        margin: '15px auto',
        fontSize: '18px',
        fontWeight: 'bold',
        backgroundColor: '#f5f5f5',
        padding: '10px 20px',
        borderRadius: '8px',
        width: 'fit-content',
        display: 'flex',
        gap: '30px',
        border: '1px solid #dddddd'
      }}>
        <span style={{ color: 'green' }}>🏆 Wins: {wins}</span>
        <span style={{ color: 'red' }}>💀 Losses: {losses}</span>
      </div>

      <div
        style={{
          display: 'inline-grid',
          gridTemplateColumns: `repeat(${maze_glade[0].length}, 20px)`,
          gap: '1px'
        }}
      >
        {maze_glade.map((row, yIndex) =>
          row.map((cell, xIndex) => {
            const isPlayer = playerPos.x === xIndex && playerPos.y === yIndex;
            const isGoal = cell === 3;
            const isWall = cell === 0;

            return (
              <div
                key={`${xIndex}-${yIndex}`}
                onClick={() => {
                  if (isPlayer && !isGameStarted) {
                    setIsGameStarted(true);
                   }
               }}
                style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: isPlayer
                    ? 'pink'
                    : isGoal
                    ? 'green'
                    : isWall
                    ? 'black'
                    : 'lightgray',
                  borderRadius: isPlayer ? '50%' : '0%',
                  cursor: isPlayer && !isGameStarted ? 'pointer' : 'default', 
                }}
              />
            );
          })
        )}
      </div>

      {(hasWon || isGameOver) && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: isGameOver ? 'rgba(139, 0, 0, 0.95)' : 'rgba(34, 139, 34, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            color: 'white'
          }}
        >
           <h2 style={{ fontSize: '60px', marginBottom: '30px', fontWeight: 'bold' }}>
            {hasWon ? 'You Won!! 🏆' : 'Game Over! You ran out of time. 💀'}
          </h2>
          <p style={{ fontSize: '24px', marginBottom: '30px' }}>Total Record — Wins: {wins} | Losses: {losses}</p>
          <button
            onClick={handleRestart}
            style={{
              padding: '15px 40px',
              fontSize: '22px',
              backgroundColor: 'white',
              color: 'black',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0px 4px 15px rgba(0,0,0,0.3)'
            }}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
