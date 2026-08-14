'use client';

import { useState, useEffect, useCallback } from 'react';

const choices = ['rock', 'paper', 'scissors'];
const icons = { rock: '✊', paper: '✋', scissors: '✌️' };

const resultText = {
  win: 'You Win! 🎉',
  lose: 'You Lose! 😢',
  tie: "It's a Tie! 🤝",
};

const resultColor = {
  win: '#4ade80',
  lose: '#f87171',
  tie: '#fbbf24',
};

export default function Home() {
  const [player, setPlayer] = useState(null);
  const [cpu, setCpu] = useState(null);
  const [result, setResult] = useState('');
  const [score, setScore] = useState({ player: 0, cpu: 0, ties: 0 });
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [history, setHistory] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);

  const getWinner = (p, c) => {
    if (p === c) return 'tie';
    if (
      (p === 'rock' && c === 'scissors') ||
      (p === 'paper' && c === 'rock') ||
      (p === 'scissors' && c === 'paper')
    ) return 'win';
    return 'lose';
  };

  const play = (pick) => {
    if (animating) return;
    setAnimating(true);
    setPlayer(pick);
    setCpu(null);
    setResult('');
    setShowConfetti(false);

    setTimeout(() => {
      const cpuPick = choices[Math.floor(Math.random() * 3)];
      setCpu(cpuPick);

      const res = getWinner(pick, cpuPick);
      setResult(res);

      setScore(s => {
        const newScore = { ...s };
        if (res === 'win') newScore.player++;
        else if (res === 'lose') newScore.cpu++;
        else newScore.ties++;
        return newScore;
      });

      if (res === 'win') {
        setStreak(s => {
          const newStreak = s + 1;
          setBestStreak(b => Math.max(b, newStreak));
          return newStreak;
        });
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      } else if (res === 'lose') {
        setStreak(0);
      }

      setHistory(h => [...h.slice(-9), { player: pick, cpu: cpuPick, result: res }]);

      setAnimating(false);
    }, 600);
  };

  const reset = () => {
    setScore({ player: 0, cpu: 0, ties: 0 });
    setStreak(0);
    setBestStreak(0);
    setPlayer(null);
    setCpu(null);
    setResult('');
    setHistory([]);
    setShowConfetti(false);
  };

  useEffect(() => {
    const key = (e) => {
      if (e.key === '1' || e.key === 'ArrowLeft') play('rock');
      if (e.key === '2' || e.key === 'ArrowUp') play('paper');
      if (e.key === '3' || e.key === 'ArrowRight') play('scissors');
      if (e.key === 'r' || e.key === 'R') reset();
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [animating]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#e2e8f0',
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px',
      overflow: 'hidden',
      position: 'relative',
    }}>


      {showConfetti && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 100 }}>
          {[...Array(30)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: 8 + Math.random() * 8,
              height: 8 + Math.random() * 8,
              background: ['#f87171', '#60a5fa', '#fbbf24', '#4ade80', '#a78bfa'][i % 5],
              left: `${Math.random() * 100}%`,
              top: -20,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              animation: `fall ${2 + Math.random() * 2}s linear forwards`,
              animationDelay: `${Math.random() * 0.5}s`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }} />
          ))}
        </div>
      )}


      <style>{`
        @keyframes fall {
          to { transform: translateY(110vh) rotate(720deg); }
        }
        @keyframes pop {
          0% { transform: scale(0.3); opacity: 0; }
          60% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(96, 165, 250, 0.3); }
          50% { box-shadow: 0 0 40px rgba(96, 165, 250, 0.6); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-12deg); }
          40% { transform: rotate(12deg); }
          60% { transform: rotate(-8deg); }
          80% { transform: rotate(8deg); }
        }
        .pop { animation: pop 0.4s ease-out; }
        .shake { animation: shake 0.5s ease-in-out; }
        .float { animation: float 2s ease-in-out infinite; }
      `}</style>



      <div style={{ marginBottom: 8, fontSize: 48 }} className="float">✊ ✋ ✌️</div>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4, background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Rock Paper Scissors
      </h1>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 30 }}>First to win? Just have fun.</p>



      {streak > 1 && (
        <div style={{
          marginBottom: 15,
          padding: '8px 20px',
          background: 'rgba(251, 191, 36, 0.15)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          borderRadius: 20,
          color: '#fbbf24',
          fontSize: 15,
          fontWeight: 600,
        }} className="pop">
          🔥 {streak} win streak! {bestStreak > streak && `(Best: ${bestStreak})`}
        </div>
      )}



      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 40,
        marginBottom: 35,
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        padding: '22px 45px',
        borderRadius: 20,
        border: '1px solid #334155',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        minWidth: 280,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#60a5fa', lineHeight: 1 }}>{score.player}</div>
          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>You</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#fbbf24', lineHeight: 1 }}>{score.ties}</div>
          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>Ties</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#f87171', lineHeight: 1 }}>{score.cpu}</div>
          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>CPU</div>
        </div>
      </div>



      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 50,
        marginBottom: 30,
        minHeight: 130,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 110,
            height: 110,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 56,
            border: '3px solid #60a5fa',
            boxShadow: player ? '0 0 30px rgba(96, 165, 250, 0.4)' : 'none',
            transition: 'all 0.3s',
          }} className={player ? 'pop' : ''}>
            {player ? icons[player] : '?'}
          </div>
          <div style={{ marginTop: 12, fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>You</div>
        </div>

        <div style={{ fontSize: 22, color: '#475569', fontWeight: 700, letterSpacing: 2 }}>VS</div>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 110,
            height: 110,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 56,
            border: '3px solid #f87171',
            boxShadow: cpu ? '0 0 30px rgba(248, 113, 113, 0.4)' : 'none',
            transition: 'all 0.3s',
          }} className={cpu ? (result === 'lose' ? 'shake' : 'pop') : ''}>
            {cpu ? icons[cpu] : '?'}
          </div>
          <div style={{ marginTop: 12, fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>CPU</div>
        </div>
      </div>


      {result && (
        <div style={{
          fontSize: 32,
          fontWeight: 800,
          marginBottom: 30,
          color: resultColor[result],
          textShadow: `0 0 30px ${resultColor[result]}40`,
        }} className="pop">
          {resultText[result]}
        </div>
      )}

      {animating && !cpu && (
        <div style={{ fontSize: 16, color: '#64748b', marginBottom: 30, fontStyle: 'italic' }}>
          Computer is choosing...
        </div>
      )}



      <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginBottom: 25 }}>
        {choices.map((c, i) => (
          <button
            key={c}
            onClick={() => play(c)}
            disabled={animating}
            style={{
              width: 95,
              height: 95,
              borderRadius: 20,
              border: player === c ? '3px solid #60a5fa' : '2px solid #334155',
              background: player === c 
                ? 'linear-gradient(135deg, #1e3a5f, #0f172a)' 
                : 'linear-gradient(135deg, #1e293b, #0f172a)',
              color: '#e2e8f0',
              fontSize: 42,
              cursor: animating ? 'not-allowed' : 'pointer',
              transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              opacity: animating ? 0.5 : 1,
              boxShadow: player === c 
                ? '0 0 25px rgba(96, 165, 250, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)' 
                : '0 4px 15px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => {
              if (!animating) {
                e.currentTarget.style.transform = 'scale(1.12) translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(96, 165, 250, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = '#60a5fa';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
              e.currentTarget.style.boxShadow = player === c 
                ? '0 0 25px rgba(96, 165, 250, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)' 
                : '0 4px 15px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)';
              e.currentTarget.style.borderColor = player === c ? '#60a5fa' : '#334155';
            }}
            onMouseDown={e => {
              if (!animating) e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onMouseUp={e => {
              if (!animating) e.currentTarget.style.transform = 'scale(1.12) translateY(-6px)';
            }}
          >
            {icons[c]}
            <span style={{
              position: 'absolute',
              bottom: 6,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 10,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}>
              {['1', '2', '3'][i]}
            </span>
          </button>
        ))}
      </div>


      <button
        onClick={reset}
        style={{
          padding: '12px 28px',
          borderRadius: 10,
          border: '1px solid #475569',
          background: 'transparent',
          color: '#94a3b8',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 500,
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          e.target.style.background = '#334155';
          e.target.style.color = '#e2e8f0';
          e.target.style.borderColor = '#64748b';
        }}
        onMouseLeave={e => {
          e.target.style.background = 'transparent';
          e.target.style.color = '#94a3b8';
          e.target.style.borderColor = '#475569';
        }}
      >
        🔄 Reset Game
      </button>


      {history.length > 0 && (
        <div style={{ marginTop: 35, width: '100%', maxWidth: 320 }}>
          <div style={{
            fontSize: 11,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 10,
            textAlign: 'center',
          }}>
            Last {history.length} Rounds
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[...history].reverse().map((h, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 16px',
                background: 'rgba(30, 41, 59, 0.6)',
                borderRadius: 10,
                fontSize: 14,
                border: '1px solid rgba(51, 65, 85, 0.5)',
              }}>
                <span style={{ fontSize: 20 }}>{icons[h.player]}</span>
                <span style={{ color: '#475569', fontSize: 12 }}>vs</span>
                <span style={{ fontSize: 20 }}>{icons[h.cpu]}</span>
                <span style={{
                  color: resultColor[h.result],
                  fontWeight: 700,
                  fontSize: 12,
                  textTransform: 'uppercase',
                  minWidth: 30,
                  textAlign: 'right',
                }}>
                  {h.result === 'win' ? 'W' : h.result === 'lose' ? 'L' : 'T'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      

      <div style={{ marginTop: 30, display: 'flex', gap: 12, alignItems: 'center' }}>
        {[
          { key: '1', label: 'Rock' },
          { key: '2', label: 'Paper' },
          { key: '3', label: 'Scissors' },
          { key: 'R', label: 'Reset' },
        ].map(k => (
          <div key={k.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              background: '#1e293b',
              border: '1px solid #334155',
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 12,
              color: '#94a3b8',
              fontFamily: 'monospace',
            }}>
              {k.key}
            </span>
            <span style={{ fontSize: 12, color: '#475569' }}>{k.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}