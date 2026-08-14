'use client';
import { useEffect, useState } from "react";
import Link from "next/link";

const MAX_LEVEL = 9;
const STORAGE_KEY = "breakout_progress_v1";

function getProgress() {
  if (typeof window === "undefined") return { unlockedLevel: 1, highScores: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { unlockedLevel: 1, highScores: {} };
}

export default function LevelsPage() {
  const [progress, setProgress] = useState({ unlockedLevel: 1, highScores: {} });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setProgress(getProgress());
    setMounted(true);
  }, []);

  const handleReset = () => {
    const confirmed = window.confirm(
      "Are you sure? This will erase ALL scores and lock every level except Level 1."
    );
    if (!confirmed) return;
    localStorage.removeItem(STORAGE_KEY);
    setProgress({ unlockedLevel: 1, highScores: {} });
  };

  const levels = [];
  for (let i = 1; i <= MAX_LEVEL; i++) {
    levels.push(i);
  }

  return (
    <div style={{
      position: 'absolute',
      top: '50px',
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#09090b',
      color: '#ffffff',
      fontFamily: 'sans-serif',
      padding: '16px',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          letterSpacing: '-0.025em',
          margin: 0
        }}>
          SELECT A LEVEL
        </h1>
        <p style={{
          fontSize: '0.9rem',
          color: '#71717a',
          marginTop: '6px',
          marginBottom: 0
        }}>
          Choose your stage to begin the breakout game
        </p>
      </header>

      <div style={{
        display: 'grid',
        width: '100%',
        maxWidth: '380px',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '12px'
      }}>
        {levels.map((levelNum) => {
          const isUnlocked = mounted ? levelNum <= progress.unlockedLevel : levelNum === 1;
          const levelKey = String(levelNum);
          const levelHighScore = progress.highScores?.[levelKey] || 0;
          const isCompleted = levelHighScore > 0;

          return (
            <div key={levelNum}>
              {isUnlocked ? (
                <Link
                  href={`/games/breakout/levels/${levelNum}`}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <button
                    style={{
                      height: '76px',
                      width: '100%',
                      backgroundColor: isCompleted ? 'rgba(34, 197, 94, 0.1)' : 'rgba(33, 3, 67, 0.05)',
                      border: isCompleted ? '2px solid rgba(34, 197, 94, 0.5)' : '2px solid rgba(99, 7, 73, 0.4)',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: '#ffffff',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.borderColor = isCompleted ? 'rgb(34, 197, 94)' : 'rgb(147, 51, 234)';
                      e.currentTarget.style.boxShadow = isCompleted
                        ? '0 0 15px rgba(34, 197, 94, 0.4)'
                        : '0 0 15px rgba(147, 51, 234, 0.4)';
                      e.currentTarget.style.backgroundColor = isCompleted ? 'rgba(34, 197, 94, 0.2)' : 'rgba(147, 51, 234, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.borderColor = isCompleted ? 'rgba(34, 197, 94, 0.5)' : 'rgba(99, 7, 73, 0.4)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.backgroundColor = isCompleted ? 'rgba(34, 197, 94, 0.1)' : 'rgba(33, 3, 67, 0.05)';
                    }}
                  >
                    <span>{levelNum}</span>
                    {isCompleted && (
                      <span style={{
                        fontSize: '0.65rem',
                        color: '#22c55e',
                        fontWeight: '600',
                        marginTop: '2px'
                      }}>
                        ★ {levelHighScore.toLocaleString()}
                      </span>
                    )}
                  </button>
                </Link>
              ) : (
                <div
                  style={{
                    height: '76px',
                    width: '100%',
                    backgroundColor: 'rgba(30, 30, 35, 0.4)',
                    border: '2px solid rgba(60, 60, 70, 0.3)',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                    cursor: 'not-allowed',
                    opacity: 0.5
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>🔒</span>
                  <span style={{
                    fontSize: '0.65rem',
                    color: '#52525b',
                    marginTop: '4px',
                    fontWeight: '600'
                  }}>
                    Locked
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {mounted && (
        <div style={{
          marginTop: '20px',
          padding: '12px 20px',
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.06)',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#a1a1aa' }}>
            Unlocked: <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{progress.unlockedLevel}</span> / {MAX_LEVEL}
          </p>
        </div>
      )}

      <div style={{ marginTop: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Link href="/games/breakout" style={{ textDecoration: 'none' }}>
          <button
            style={{
              cursor: 'pointer',
              color: '#a1a1aa',
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '0.875rem',
              fontFamily: 'sans-serif',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#a1a1aa'}
          >
            ← Back to Start Screen
          </button>
        </Link>

        <button
          onClick={handleReset}
          style={{
            cursor: 'pointer',
            color: '#ef4444',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '0.875rem',
            fontFamily: 'sans-serif',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ff7777'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#ef4444'}
        >
          ↺ Reset Progress
        </button>
      </div>
    </div>
  );
}