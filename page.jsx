'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  GRID_SIZE,
  SHIPS,
  createEmptyGrid,
  placeShipsRandomly,
  checkWinCondition,
  getSunkShips,
} from './logic';

const COLUMNS = Array.from({ length: GRID_SIZE }, (_, i) => i + 1);
const ROWS = Array.from({ length: GRID_SIZE }, (_, i) => String.fromCharCode(65 + i));

const TIME_LIMIT = 90;

const SHIP_ICON = {
  Carrier: '🚢',
  Battleship: '🛳️',
  Cruiser: '⛴️',
  Submarine: '🚤',
  Destroyer: '🛥️',
};

const keyframes = `
@keyframes bs-explode {
  0% { transform: scale(0.2) rotate(-25deg); opacity: 0; }
  55% { transform: scale(1.35) rotate(10deg); opacity: 1; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}
@keyframes bs-splash {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.25); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes bs-float {
  0%, 100% { transform: translateY(0) rotate(-4deg); }
  50% { transform: translateY(-7px) rotate(4deg); }
}
@keyframes bs-wave {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
@keyframes bs-ping {
  0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.55); }
  100% { box-shadow: 0 0 0 12px rgba(239,68,68,0); }
}
`;

let audioCtx = null;
function getAudioCtx() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function makeDistortionCurve(amount) {
  const k = amount;
  const n = 8192;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

function distortedMaster(ctx, peak, duration) {
  const now = ctx.currentTime;
  const shaper = ctx.createWaveShaper();
  shaper.curve = makeDistortionCurve(420);
  shaper.oversample = '4x';
  const master = ctx.createGain();
  master.gain.setValueAtTime(peak, now);
  master.gain.exponentialRampToValueAtTime(0.001, now + duration);
  master.connect(shaper);
  shaper.connect(ctx.destination);
  return { master, now };
}

function playFire(ctx) {
  const { master, now } = distortedMaster(ctx, 1.6, 1.2);


  [38, 41, 55, 58].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + 1.1);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 320;
    const g = ctx.createGain();
    g.gain.setValueAtTime(i % 2 === 0 ? 0.6 : 0.45, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
    osc.connect(lp).connect(g).connect(master);
    osc.start(now);
    osc.stop(now + 1.15);
  });


  [311, 330, 370, 392].forEach((freq) => {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.55, now + 0.45);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.28, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc.connect(g).connect(master);
    osc.start(now);
    osc.stop(now + 0.55);
  });


  const screech = ctx.createOscillator();
  screech.type = 'sawtooth';
  screech.frequency.setValueAtTime(2400, now);
  screech.frequency.linearRampToValueAtTime(900, now + 0.25);
  const screechGain = ctx.createGain();
  screechGain.gain.setValueAtTime(0.35, now);
  screechGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  screech.connect(screechGain).connect(master);
  screech.start(now);
  screech.stop(now + 0.3);


  const bufferSize = Math.floor(ctx.sampleRate * 0.6);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.8);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.setValueAtTime(4000, now);
  noiseFilter.frequency.exponentialRampToValueAtTime(250, now + 0.6);
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(1.1, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
  noise.connect(noiseFilter).connect(noiseGain).connect(master);
  noise.start(now);
  noise.stop(now + 0.6);
}

function playMiss(ctx) {
  const { master, now } = distortedMaster(ctx, 1.3, 0.7);


  const lfo = ctx.createOscillator();
  lfo.type = 'square';
  lfo.frequency.value = 14;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.5;
  const pulse = ctx.createGain();
  pulse.gain.setValueAtTime(0.5, now);
  lfo.connect(lfoGain).connect(pulse.gain);
  lfo.start(now);
  lfo.stop(now + 0.7);

  [210, 223].forEach((freq) => {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.linearRampToValueAtTime(freq * 0.8, now + 0.65);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.4, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc.connect(g).connect(pulse).connect(master);
    osc.start(now);
    osc.stop(now + 0.65);
  });


  const bufferSize = Math.floor(ctx.sampleRate * 0.7);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.0);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = 3;
  filter.frequency.setValueAtTime(1600, now);
  filter.frequency.linearRampToValueAtTime(700, now + 0.7);
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.5, now);
  ng.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
  noise.connect(filter).connect(ng).connect(master);
  noise.start(now);
  noise.stop(now + 0.7);
}
function tikTokVoice(ctx, freq, type, peak, dur, startOffset = 0) {
  const now = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(peak, now + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + dur + 0.02);
}

function playTikTokFire(ctx) {

  tikTokVoice(ctx, 880, 'triangle', 0.5, 0.12);
  tikTokVoice(ctx, 1320, 'triangle', 0.4, 0.14, 0.06);
  tikTokVoice(ctx, 180, 'sine', 0.5, 0.18);
}

function playTikTokMiss(ctx) {

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(520, now);
  osc.frequency.exponentialRampToValueAtTime(260, now + 0.18);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.4, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
  osc.connect(g).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.22);
}

function playShotSound(hit, theme) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  if (theme === 'tiktok') (hit ? playTikTokFire : playTikTokMiss)(ctx);
  else (hit ? playFire : playMiss)(ctx);
}

const neighborIndices = (index) => {
  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;
  const out = [];
  if (row > 0) out.push(index - GRID_SIZE);
  if (row < GRID_SIZE - 1) out.push(index + GRID_SIZE);
  if (col > 0) out.push(index - 1);
  if (col < GRID_SIZE - 1) out.push(index + 1);
  return out;
};

function chooseComputerShot(grid, shots, targets) {
  const tried = new Set(shots);
  for (const t of targets) {
    if (!tried.has(t)) return t;
  }
  const options = [];
  for (let i = 0; i < grid.length; i++) {
    if (!tried.has(i)) options.push(i);
  }
  return options[Math.floor(Math.random() * options.length)];
}

function buildFreshGame() {
  return {
    enemyGrid: placeShipsRandomly(createEmptyGrid()),
    playerGrid: placeShipsRandomly(createEmptyGrid()),
    playerShots: [],
    computerShots: [],
    computerTargets: [],
    turn: 'player',
    gameStatus: 'playing',
  };
}

export default function BattleshipGame() {
  const [enemyGrid, setEnemyGrid] = useState(() => createEmptyGrid());
  const [playerGrid, setPlayerGrid] = useState(() => createEmptyGrid());
  const [playerShots, setPlayerShots] = useState([]);
  const [computerShots, setComputerShots] = useState([]);
  const [computerTargets, setComputerTargets] = useState([]);
  const [enemySunk, setEnemySunk] = useState([]);
  const [playerSunk, setPlayerSunk] = useState([]);
  const [turn, setTurn] = useState('player');
  const [gameStatus, setGameStatus] = useState('playing');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundTheme, setSoundTheme] = useState('cinematic');
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);

  const startNewGame = useCallback(() => {
    const fresh = buildFreshGame();
    setEnemyGrid(fresh.enemyGrid);
    setPlayerGrid(fresh.playerGrid);
    setPlayerShots(fresh.playerShots);
    setComputerShots(fresh.computerShots);
    setComputerTargets(fresh.computerTargets);
    setEnemySunk([]);
    setPlayerSunk([]);
    setTimeLeft(TIME_LIMIT);
    setTurn('player');
    setGameStatus('playing');
  }, []);
  useEffect(() => {
    const id = setTimeout(() => startNewGame(), 0);
    return () => clearTimeout(id);
  }, [startNewGame]);

  const handlePlayerFire = (index) => {
    if (turn !== 'player' || gameStatus !== 'playing' || playerShots.includes(index)) return;

    const newShots = [...playerShots, index];
    setPlayerShots(newShots);
    const hit = enemyGrid[index].ship !== null;
    if (soundEnabled) playShotSound(hit, soundTheme);

    const justSunk = getSunkShips(enemyGrid, newShots);
    const newSinks = justSunk.filter((name) => !enemySunk.includes(name));
    if (newSinks.length > 0) {
      setEnemySunk(justSunk);
      newSinks.forEach((name) => toast.success(`💥 You sank the enemy ${name}!`));
    }

    if (checkWinCondition(enemyGrid, newShots)) {
      setGameStatus('won');
      toast.success('🎉 Enemy fleet destroyed — you win!');
      return;
    }

    setTurn('computer');
  };


  useEffect(() => {
    if (turn !== 'computer' || gameStatus !== 'playing') return;
    const timer = setTimeout(() => {
      setComputerShots((prevShots) => {
        const idx = chooseComputerShot(playerGrid, prevShots, computerTargets);
        const newShots = [...prevShots, idx];
        const hit = playerGrid[idx].ship !== null;
        if (soundEnabled) playShotSound(hit, soundTheme);

        if (hit) {
          const sunkNow = getSunkShips(playerGrid, newShots);
          if (sunkNow.length > 0) {
            setPlayerSunk(sunkNow);
            toast.error(`💀 Computer sank your ${sunkNow[sunkNow.length - 1]}!`);
            setComputerTargets([]);
          } else {
            setComputerTargets((t) => [...neighborIndices(idx), ...t]);
          }
        }

        if (checkWinCondition(playerGrid, newShots)) {
          setGameStatus('lost');
          toast.error('💀 Your fleet was sunk — you lose!');
          return newShots;
        }

        setTurn('player');
        return newShots;
      });
    }, 750);
    return () => clearTimeout(timer);
  }, [turn, gameStatus, playerGrid, computerTargets, soundEnabled, soundTheme]);


  useEffect(() => {
    if (gameStatus !== 'playing') return;
    if (timeLeft > 0) {
      const id = setTimeout(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => {
      const mine = enemySunk.length;
      const theirs = playerSunk.length;
      if (mine > theirs) {
        setGameStatus('won');
        toast.success('⏰ Time! You sunk the most ships — victory!');
      } else if (theirs > mine) {
        setGameStatus('lost');
        toast.error('⏰ Time! The computer sunk the most ships — you lose!');
      } else {
        setGameStatus('draw');
        toast('⏰ Time! It’s a dead heat — draw!');
      }
    }, 0);
    return () => clearTimeout(id);
  }, [gameStatus, timeLeft, enemySunk, playerSunk]);

  const playerHits = playerShots.filter((i) => enemyGrid[i].ship).length;
  const computerHits = computerShots.filter((i) => playerGrid[i].ship).length;
  const enemyShipsLeft = SHIPS.length - enemySunk.length;
  const playerShipsLeft = SHIPS.length - playerSunk.length;
  const playerAccuracy = playerShots.length > 0 ? Math.round((playerHits / playerShots.length) * 100) : 0;

  const statusMessage =
    gameStatus === 'won'
      ? '🎉 Victory! Enemy fleet sent to the depths!'
      : gameStatus === 'lost'
        ? '💀 Defeated! The computer destroyed your fleet.'
        : gameStatus === 'draw'
          ? '🤝 Draw! Both fleets limped home alive!'
          : turn === 'player'
            ? '🎯 Your turn — fire at the enemy waters!'
            : '🤖 Computer is taking aim…';

  const lowTime = timeLeft <= 10;

  return (
    <div className="relative min-h-[70vh] w-full overflow-hidden rounded-2xl bg-gradient-to-b from-sky-400 via-cyan-600 to-blue-900 p-4 sm:p-8">
      <style>{keyframes}</style>

      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute left-[10%] top-[20%] h-3 w-3 rounded-full bg-white/60 animate-[bs-float_6s_ease-in-out_infinite]" />
        <div className="absolute left-[80%] top-[30%] h-4 w-4 rounded-full bg-white/50 animate-[bs-float_7s_ease-in-out_infinite]" />
        <div className="absolute left-[60%] top-[70%] h-2 w-2 rounded-full bg-white/70 animate-[bs-float_5s_ease-in-out_infinite]" />
        <div className="absolute left-[30%] top-[80%] h-3 w-3 rounded-full bg-white/50 animate-[bs-float_8s_ease-in-out_infinite]" />
      </div>

      <Card className="relative mx-auto w-full max-w-3xl border-0 bg-white/95 shadow-2xl shadow-blue-900/40 backdrop-blur-sm">
        <div className="p-6 text-center sm:p-8">
          <div className="mb-1 flex items-center justify-center gap-3">
            <span className="text-4xl sm:text-5xl" style={{ animation: 'bs-float 4s ease-in-out infinite' }}>⚓</span>
            <h1 className="bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-900 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
              Battleship
            </h1>
            <span className="text-4xl sm:text-5xl" style={{ animation: 'bs-float 4s ease-in-out infinite' }}>🚢</span>
            <button
              type="button"
              onClick={() => setSoundEnabled((s) => !s)}
              aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
              className="ml-2 rounded-full border border-blue-200 bg-white/70 px-2 py-1 text-lg shadow-sm transition-transform hover:scale-110 active:scale-95"
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
            <button
              type="button"
              onClick={() => setSoundTheme((t) => (t === 'cinematic' ? 'tiktok' : 'cinematic'))}
              aria-label={`Switch sound theme (currently ${soundTheme})`}
              title={`Sound: ${soundTheme === 'tiktok' ? 'TikTok style' : 'Cinematic'}`}
              className="rounded-full border border-blue-200 bg-white/70 px-2 py-1 text-lg shadow-sm transition-transform hover:scale-110 active:scale-95"
            >
              {soundTheme === 'tiktok' ? '🎵' : '🎬'}
            </button>
          </div>
          <p className="mb-4 text-sm font-medium text-slate-500">
            Hunt the hidden fleet — and don&apos;t let the computer sink yours! 🌊
          </p>

          <div
            className={`mb-5 rounded-xl border px-4 py-3 text-base font-extrabold shadow-sm ${gameStatus === 'won'
                ? 'border-emerald-300 bg-gradient-to-r from-emerald-400 to-green-500 text-white'
                : gameStatus === 'lost'
                  ? 'border-rose-300 bg-gradient-to-r from-rose-500 to-red-600 text-white'
                  : gameStatus === 'draw'
                    ? 'border-violet-300 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white'
                    : turn === 'player'
                      ? 'border-cyan-200 bg-cyan-50 text-cyan-800'
                      : 'border-amber-200 bg-amber-50 text-amber-800'
              }`}
          >
            {statusMessage}
          </div>

          <div className="mb-5">
            <div className="mb-1 flex items-center justify-center gap-2 text-sm font-bold">
              <span className={lowTime ? 'text-red-600 animate-pulse' : 'text-slate-600'}>
                ⏱ Time remaining
              </span>
              <span
                className={`rounded-full px-3 py-0.5 font-extrabold ${lowTime
                    ? 'bg-red-100 text-red-600 animate-pulse'
                    : 'bg-blue-100 text-blue-700'
                  }`}
              >
                {timeLeft}s
              </span>
            </div>
            <div className="mx-auto h-2.5 w-full max-w-md overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${lowTime ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-cyan-500 to-blue-600'
                  }`}
                style={{ width: `${(timeLeft / TIME_LIMIT) * 100}%` }}
              />
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat icon="🎯" label="Your shots" value={playerShots.length} />
            <Stat icon="💥" label="Your hits" value={playerHits} />
            <Stat icon="🚢" label="Enemy left" value={enemyShipsLeft} />
            <Stat icon="🎯" label="Accuracy" value={`${playerAccuracy}%`} />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Board
              title="🌊 Enemy Waters"
              subtitle="Click to fire"
              grid={enemyGrid}
              shots={playerShots}
              showShips={false}
              interactive
              disabled={turn !== 'player' || gameStatus !== 'playing'}
              onCellClick={handlePlayerFire}
            />
            <Board
              title="🛡️ Your Fleet"
              subtitle="Under fire!"
              grid={playerGrid}
              shots={computerShots}
              showShips
              interactive={false}
              disabled
              onCellClick={() => { }}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {SHIPS.map((ship) => {
              const sunk = enemySunk.includes(ship.name);
              return (
                <span
                  key={ship.name}
                  className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition-all ${sunk
                      ? 'border-rose-300 bg-rose-100 text-rose-500 line-through opacity-70'
                      : 'border-cyan-200 bg-cyan-50 text-cyan-800'
                    }`}
                >
                  <span>{sunk ? '💀' : SHIP_ICON[ship.name] ?? '🚢'}</span>
                  {ship.name}
                </span>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-sm font-semibold text-slate-600">
            <span>🤖 Computer hits: <span className="text-rose-600">{computerHits}</span></span>
            <span>⚓ Your ships left: <span className="text-cyan-700">{playerShipsLeft}</span></span>
          </div>

          <Button
            onClick={startNewGame}
            size="lg"
            className="mt-6 w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-base font-bold shadow-lg shadow-blue-600/30 transition-transform hover:scale-[1.03] hover:from-blue-500 hover:to-cyan-400 active:scale-95 sm:w-auto"
          >
            🔄 New Game
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-blue-100 bg-gradient-to-b from-white to-blue-50 px-3 py-2 shadow-sm">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {icon} {label}
      </div>
      <div className="text-xl font-extrabold text-blue-700">{value}</div>
    </div>
  );
}

function Board({ title, subtitle, grid, shots, showShips, interactive, disabled, onCellClick }) {
  const shotSet = new Set(shots);
  return (
    <div>
      <div className="mb-1 text-center">
        <div className="font-bold text-slate-700">{title}</div>
        <div className="text-[11px] text-slate-400">{subtitle}</div>
      </div>
      <div className="overflow-x-auto">
        <div className="relative mx-auto inline-grid min-w-max gap-1 rounded-xl bg-blue-950/90 p-3 shadow-inner ring-2 ring-cyan-400/30">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.07] animate-spin [animation-duration:9s]"
            style={{ background: 'conic-gradient(from 0deg, transparent 0deg, #22d3ee 60deg, transparent 120deg)' }}
          />
          <div className="relative inline-grid gap-1"
            style={{ gridTemplateColumns: `auto repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
          >
            <div />
            {COLUMNS.map((c) => (
              <div key={`col-${c}`} className="pb-1 text-center font-mono text-[10px] font-bold text-cyan-300/80">
                {c}
              </div>
            ))}
            {ROWS.map((rowLabel, row) => (
              <FragmentRow
                key={rowLabel}
                rowLabel={rowLabel}
                row={row}
                grid={grid}
                shotSet={shotSet}
                showShips={showShips}
                interactive={interactive}
                disabled={disabled}
                onCellClick={onCellClick}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FragmentRow({ rowLabel, row, grid, shotSet, showShips, interactive, disabled, onCellClick }) {
  return (
    <>
      <div className="pr-1 font-mono text-[10px] font-bold text-cyan-300/80 flex items-center justify-center">
        {rowLabel}
      </div>
      {COLUMNS.map((_, col) => {
        const index = row * GRID_SIZE + col;
        const cell = grid[index];
        if (!cell) return <div key={index} />;

        const hasBeenShot = shotSet.has(index);
        const isShip = cell.ship !== null;
        const reveal = isShip && (hasBeenShot || showShips);

        let cellStyle =
          'bg-cyan-500/20 hover:bg-cyan-400/40 border border-cyan-300/30 hover:scale-105';
        let anim = '';
        if (hasBeenShot) {
          if (isShip) {
            cellStyle = 'bg-red-600 border border-red-700 text-white shadow-lg shadow-red-600/40';
            anim = 'animate-[bs-explode_0.45s_ease-out]';
          } else {
            cellStyle = 'bg-slate-300 border border-slate-400 text-slate-600';
            anim = 'animate-[bs-splash_0.4s_ease-out]';
          }
        } else if (reveal) {
          cellStyle = 'bg-slate-600 border border-slate-500 text-white';
        }

        const clickable = interactive && !disabled && !hasBeenShot;

        return (
          <button
            key={index}
            type="button"
            disabled={!clickable}
            className={`flex aspect-square w-full min-w-5 min-h-5 items-center justify-center rounded-md text-sm transition-all duration-150 ${cellStyle} ${anim} ${clickable ? 'cursor-crosshair' : 'cursor-default'
              }`}
            style={hasBeenShot && isShip ? { animation: 'bs-ping 0.6s ease-out' } : undefined}
            onClick={() => clickable && onCellClick(index)}
            aria-label={`${rowLabel}${col + 1}`}
          >
            {hasBeenShot ? (isShip ? '💥' : '💧') : reveal ? '🚢' : ''}
          </button>
        );
      })}
    </>
  );
}
