"use client";

  import { useEffect, useRef, useState } from "react";
  import Link from "next/link";
if (typeof window !== "undefined") {
  const React = require("react");
  const originalCreateElement = React.createElement;
  React.createElement = function (type, props, ...children) {
    if (props && "asChild" in props) {
      const cleanProps = { ...props };
      delete cleanProps.asChild; 
      return originalCreateElement(type, cleanProps, ...children);
    }
    return originalCreateElement(type, props, ...children);
  };
}

const CONFIG = {
  CANVAS_WIDTH: 600,
  CANVAS_HEIGHT: 650,
  TABLE_WIDTH: 360,
  TABLE_HEIGHT: 500,
  PADDLE_RADIUS: 25,
  PADDLE_HANDLE_LENGTH: 20,
  BALL_RADIUS: 10,
  INITIAL_BALL_SPEED: 4.5,
  BALL_SPEED_INCREMENT: 0.35,
  PLAYER_SPEED: 8,
  TARGET_WIN_SCORE: 5,
};

export default function TableTennisPage() {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);

 
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [gameMode, setGameMode] = useState("VS_AI"); 
  const [gameState, setGameState] = useState("START"); 
  const [winnerName, setWinnerName] = useState("");
  const [difficulty, setDifficulty] = useState("MEDIUM");
 


  const keysPressedRef = useRef({});
  const mousePosRef = useRef({ x: CONFIG.CANVAS_WIDTH / 2, y: CONFIG.CANVAS_HEIGHT - 80 });

 
  const entitiesRef = useRef({
  
    p1X: CONFIG.CANVAS_WIDTH / 2,
    p1Y: CONFIG.CANVAS_HEIGHT - 65,
 
    p2X: CONFIG.CANVAS_WIDTH / 2,
    p2Y: 65,

    ballX: CONFIG.CANVAS_WIDTH / 2,
    ballY: CONFIG.CANVAS_HEIGHT / 2,
    ballVelX: 0,
    ballVelY: CONFIG.INITIAL_BALL_SPEED,
    currentSpeed: CONFIG.INITIAL_BALL_SPEED,

    ballHistory: [] 
  });


  const playSound = (freq, type = "sine", duration = 0.08) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  const resetBall = (serveUpward) => {
    const e = entitiesRef.current;
    e.ballX = CONFIG.CANVAS_WIDTH / 2;
    e.ballY = CONFIG.CANVAS_HEIGHT / 2;
    e.currentSpeed = CONFIG.INITIAL_BALL_SPEED;
    e.ballVelY = serveUpward ? -CONFIG.INITIAL_BALL_SPEED : CONFIG.INITIAL_BALL_SPEED;
    e.ballVelX = (Math.random() - 0.5) * 4;
    e.ballHistory = [];
  };

  const initGame = (mode) => {
    setGameMode(mode);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setWinnerName("");
    const e = entitiesRef.current;
    e.p1X = CONFIG.CANVAS_WIDTH / 2;
    e.p2X = CONFIG.CANVAS_WIDTH / 2;
    resetBall(Math.random() > 0.5);
    setGameState("PLAYING");
    playSound(440, "sine", 0.2);
  };

  const resetArcade = () => {
    setGameState("START");
    setPlayer1Score(0);
    setPlayer2Score(0);
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
  };

  const runEngine = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const e = entitiesRef.current;
    const keys = keysPressedRef.current;

    const leftBound = (CONFIG.CANVAS_WIDTH - CONFIG.TABLE_WIDTH) / 2;
    const rightBound = leftBound + CONFIG.TABLE_WIDTH;

   
    if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
      e.p1X -= CONFIG.PLAYER_SPEED;
    } else if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
      e.p1X += CONFIG.PLAYER_SPEED;
    } else {
      e.p1X += (mousePosRef.current.x - e.p1X) * 0.25;
    }
    e.p1X = Math.max(leftBound, Math.min(rightBound, e.p1X));

  
    if (gameMode === "TWO_PLAYER") {
      if (keys["w"] || keys["W"]) e.p2X -= CONFIG.PLAYER_SPEED;
      if (keys["s"] || keys["S"]) e.p2X += CONFIG.PLAYER_SPEED;
    } else {
    
      const aiTargetX = e.ballX;
      e.p2X += (aiTargetX - e.p2X) * 0.12; 
    }
    e.p2X = Math.max(leftBound, Math.min(rightBound, e.p2X));

    e.ballX += e.ballVelX;
    e.ballY += e.ballVelY;

    
    e.ballHistory.push({ x: e.ballX, y: e.ballY });
    if (e.ballHistory.length > 7) e.ballHistory.shift();

  
    if (e.ballX - CONFIG.BALL_RADIUS <= leftBound) {
      e.ballX = leftBound + CONFIG.BALL_RADIUS;
      e.ballVelX = -e.ballVelX;
      playSound(280, "triangle");
    } else if (e.ballX + CONFIG.BALL_RADIUS >= rightBound) {
      e.ballX = rightBound - CONFIG.BALL_RADIUS;
      e.ballVelX = -e.ballVelX;
      playSound(280, "triangle");
    }

   
    const distP1 = Math.hypot(e.ballX - e.p1X, e.ballY - e.p1Y);
    if (distP1 <= CONFIG.PADDLE_RADIUS + CONFIG.BALL_RADIUS && e.ballVelY > 0) {
      e.currentSpeed += CONFIG.BALL_SPEED_INCREMENT;
      e.ballVelY = -Math.abs(e.currentSpeed);
      e.ballVelX = (e.ballX - e.p1X) * 0.25; 
      playSound(600, "square");
    }

  
    const distP2 = Math.hypot(e.ballX - e.p2X, e.ballY - e.p2Y);
    if (distP2 <= CONFIG.PADDLE_RADIUS + CONFIG.BALL_RADIUS && e.ballVelY < 0) {
      e.currentSpeed += CONFIG.BALL_SPEED_INCREMENT;
      e.ballVelY = Math.abs(e.currentSpeed);
      e.ballVelX = (e.ballX - e.p2X) * 0.25;
      playSound(550, "square");
    }


    if (e.ballY < 0) {
      playSound(150, "sawtooth", 0.25);
      setPlayer1Score((p) => {
        if (p + 1 >= CONFIG.TARGET_WIN_SCORE) {
          setWinnerName("Player 1");
          setGameState("GAMEOVER");
        } else resetBall(false);
        return p + 1;
      });
    } else if (e.ballY > CONFIG.CANVAS_HEIGHT) {
      playSound(150, "sawtooth", 0.25);
      setPlayer2Score((p) => {
        if (p + 1 >= CONFIG.TARGET_WIN_SCORE) {
          setWinnerName(gameMode === "TWO_PLAYER" ? "Player 2" : "Computer AI");
          setGameState("GAMEOVER");
        } else resetBall(true);
        return p + 1;
      });
    }

   
    ctx.fillStyle = "#facf43";
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    ctx.save();
    

    const tableX = (CONFIG.CANVAS_WIDTH - CONFIG.TABLE_WIDTH) / 2;
    const tableY = (CONFIG.CANVAS_HEIGHT - CONFIG.TABLE_HEIGHT) / 2;

    ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
    ctx.fillRect(tableX + 15, tableY + 20, CONFIG.TABLE_WIDTH, CONFIG.TABLE_HEIGHT);


    ctx.fillStyle = "#2ec194";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 6;
    ctx.fillRect(tableX, tableY, CONFIG.TABLE_WIDTH, CONFIG.TABLE_HEIGHT);
    ctx.strokeRect(tableX, tableY, CONFIG.TABLE_WIDTH, CONFIG.TABLE_HEIGHT);


    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(CONFIG.CANVAS_WIDTH / 2, tableY);
    ctx.lineTo(CONFIG.CANVAS_WIDTH / 2, tableY + CONFIG.TABLE_HEIGHT);
    ctx.stroke();

  
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(tableX, CONFIG.CANVAS_HEIGHT / 2);
    ctx.lineTo(tableX + CONFIG.TABLE_WIDTH, CONFIG.CANVAS_HEIGHT / 2);
    ctx.stroke();

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.strokeRect(tableX - 2, (CONFIG.CANVAS_HEIGHT / 2) - 2, CONFIG.TABLE_WIDTH + 4, 4);

  
    if (e.ballHistory.length > 1) {
      ctx.beginPath();
      ctx.moveTo(e.ballHistory[0].x, e.ballHistory[0].y);
      for (let i = 1; i < e.ballHistory.length; i++) {
        ctx.lineTo(e.ballHistory[i].x, e.ballHistory[i].y);
      }
      ctx.strokeStyle = "rgba(168, 85, 247, 0.4)"; 
      ctx.lineWidth = CONFIG.BALL_RADIUS * 1.5;
      ctx.lineCap = "round";
      ctx.stroke();
    }


    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(e.ballX, e.ballY, CONFIG.BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();


    const drawPaddle = (x, y, isRed) => {
      ctx.save();
      ctx.translate(x, y);

      if (!isRed) ctx.rotate(Math.PI);

  
      ctx.fillStyle = "#c17a47";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.fillRect(-6, 0, 12, CONFIG.PADDLE_HANDLE_LENGTH);
      ctx.strokeRect(-6, 0, 12, CONFIG.PADDLE_HANDLE_LENGTH);

     
      ctx.fillStyle = isRed ? "#e13d3d" : "#3b82f6";
      ctx.beginPath();
      ctx.arc(0, 0, CONFIG.PADDLE_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    };

    drawPaddle(e.p2X, e.p2Y, false); 
    drawPaddle(e.p1X, e.p1Y, true); 

    ctx.restore();

    if (gameState === "PLAYING") {
      gameLoopRef.current = requestAnimationFrame(runEngine);
    }
  };

   
  useEffect(() => {
    const currentKeys = keysPressedRef.current;
    
    const handleDown = (ev) => {
      currentKeys[ev.key] = true;
      if (["ArrowLeft", "ArrowRight", "w", "s", "a", "d"].includes(ev.key)) {
        ev.preventDefault();
      }
    };
    
    const handleUp = (ev) => {
      currentKeys[ev.key] = false;
    };

    const handleMouse = (ev) => {
      const cv = canvasRef.current;
      if (!cv) return;
      const r = cv.getBoundingClientRect();
      mousePosRef.current = { x: ev.clientX - r.left, y: ev.clientY - r.top };
    };

    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);
    window.addEventListener("mousemove", handleMouse);

    if (gameState === "PLAYING") {
      gameLoopRef.current = requestAnimationFrame(runEngine);
    }

    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
      window.removeEventListener("mousemove", handleMouse);
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, gameMode, runEngine]); 

      return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4 font-sans select-none">
      
     
      <div className="flex justify-between items-center w-full max-w-[600px] mb-4">
        <a 
          href="/" 
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium rounded-lg text-xs border border-slate-800 transition no-underline inline-block cursor-pointer"
        >
          ← Back to Arcade
        </a>
        <button 
          onClick={resetArcade} 
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-yellow-500 font-mono rounded-lg text-xs border border-slate-800 transition cursor-pointer"
        >
          ↻ Reset Game
        </button>
      </div>

   
      <div className="flex justify-between items-center w-full max-w-[600px] mb-4 gap-4">
        <div className="flex-1 flex items-center justify-between px-4 py-2.5 bg-blue-600 rounded-full border-2 border-black font-black tracking-wide shadow-md">
          <span className="text-sm uppercase"> Player 1</span>
          <span className="text-xl font-mono">{player1Score}</span>
        </div>
        <div className="text-center font-mono text-[10px] text-slate-500 font-bold uppercase tracking-wider min-w-[70px]">
          Limit {CONFIG.TARGET_WIN_SCORE}
        </div>
        <div className="flex-1 flex items-center justify-between px-4 py-2.5 bg-red-500 rounded-full border-2 border-black font-black tracking-wide shadow-md">
          <span className="text-sm uppercase"> {gameMode === "TWO_PLAYER" ? "Player 2" : "CPU AI"}</span>
          <span className="text-xl font-mono">{player2Score}</span>
        </div>
      </div>

      {/* 3. PRIMARY INTERACTIVE GAME BOARD DISPLAY WINDOW */}
      <div className="relative border-4 border-slate-900 bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
        <canvas ref={canvasRef} width={CONFIG.CANVAS_WIDTH} height={CONFIG.CANVAS_HEIGHT} className="block" />

        {/* Modular Screen Control Interceptor Overlays */}
        {gameState !== "PLAYING" && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            {gameState === "START" && (
              <>
                {/* 1. HEADING TITLE */}
                <h1 className="text-3xl font-black uppercase tracking-wider text-slate-100 mb-2">Modern Ping Pong</h1>

                {/* 2. LEVEL SELECTOR INTERFACE */}
                <div className="mb-6">
                  <p className="text-slate-400 text-xs uppercase tracking-widest font-mono font-bold mb-2">Select AI Difficulty Level:</p>
                  <div className="flex gap-2 justify-center bg-slate-900 p-1.5 rounded-xl border border-slate-800 w-fit mx-auto">
                    <button 
                      onClick={() => setDifficulty("EASY")} 
                      className={`px-3 py-1 text-xs font-bold rounded-lg border-0 cursor-pointer transition ${difficulty === "EASY" ? "bg-emerald-500 text-white shadow" : "bg-transparent text-slate-400 hover:text-slate-200"}`}
                    >
                      🟢 Easy
                    </button>
                    <button 
                      onClick={() => setDifficulty("MEDIUM")} 
                      className={`px-3 py-1 text-xs font-bold rounded-lg border-0 cursor-pointer transition ${difficulty === "MEDIUM" ? "bg-amber-500 text-white shadow" : "bg-transparent text-slate-400 hover:text-slate-200"}`}
                    >
                      🟡 Medium
                    </button>
                    <button 
                      onClick={() => setDifficulty("HARD")} 
                      className={`px-3 py-1 text-xs font-bold rounded-lg border-0 cursor-pointer transition ${difficulty === "HARD" ? "bg-rose-500 text-white shadow" : "bg-transparent text-slate-400 hover:text-slate-200"}`}
                    >
                      🔴 Expert
                    </button>
                  </div>
                </div>

                {/* 3. PARAGRAPH DESCRIPTION */}
                <p className="text-slate-400 text-xs max-w-sm mb-6 leading-relaxed">
                  Slide your mouse pointer across the screen field framework area to automatically maneuver your lower racket handle asset.
                </p>

                {/* 4. MODE BUTTONS SELECTION CONTAINER */}
                <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
                  <button onClick={() => initGame("VS_AI")} className="w-full px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 font-bold uppercase rounded-xl tracking-wider text-sm shadow-md hover:from-blue-400 hover:to-indigo-500 transition text-white border-0 cursor-pointer">
                    Singleplayer vs AI
                  </button>
                  <button onClick={() => initGame("TWO_PLAYER")} className="w-full px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 font-bold uppercase rounded-xl tracking-wider text-sm shadow-md hover:from-emerald-400 hover:to-teal-500 transition text-white border-0 cursor-pointer">
                    Keyboard 2-Player (A/D vs Keys)
                  </button>
                </div>
              </>
            )}

            {gameState === "GAMEOVER" && (
              <div>
                <h2 className="text-2xl font-black text-yellow-400 uppercase tracking-widest mb-2">Set Complete</h2>
                <p className="text-slate-300 text-sm mb-6">
                  <span className="text-white font-bold">{winnerName}</span> secured the court victory match set!
                </p>
                <button onClick={() => initGame(gameMode)} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold uppercase rounded-xl text-xs border border-slate-700 shadow-md transition cursor-pointer">
                  Rematch Arena
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
