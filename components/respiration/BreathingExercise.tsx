'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Exercise {
  id: string;
  name: string;
  inspire: number;
  hold: number;
  expire: number;
  color: string;
}

type Phase = 'idle' | 'inspire' | 'hold' | 'expire';

const PHASE_LABELS: Record<Phase, string> = {
  idle: 'Appuyez',
  inspire: 'Inspirez',
  hold: 'Retenez',
  expire: 'Expirez',
};

export default function BreathingExercise({ exercise, onBack, onComplete }: { exercise: Exercise; onBack: () => void; onComplete?: (exerciseId: string, cycles: number, duration: number) => void }) {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [countdown, setCountdown] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [totalCycles, setTotalCycles] = useState(6);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cyclesRef = useRef(0);
  const elapsedRef = useRef(0);

  const stop = useCallback((completed = false) => {
    setRunning(false);
    setPhase('idle');
    setCountdown(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (completed && onComplete) {
      onComplete(exercise.id, cyclesRef.current, elapsedRef.current);
    }
  }, [exercise.id, onComplete]);

  const tick = useCallback(() => {
    setCountdown(prev => {
      if (prev <= 1) {
        setPhase(currentPhase => {
          if (currentPhase === 'inspire') {
            if (exercise.hold > 0) { setCountdown(exercise.hold); return 'hold'; }
            setCountdown(exercise.expire); return 'expire';
          }
          if (currentPhase === 'hold') { setCountdown(exercise.expire); return 'expire'; }
          if (currentPhase === 'expire') {
            cyclesRef.current += 1;
            setCycles(cyclesRef.current);
            if (cyclesRef.current >= totalCycles) { stop(true); return 'idle'; }
            setCountdown(exercise.inspire); return 'inspire';
          }
          return currentPhase;
        });
        return prev;
      }
      return prev - 1;
    });
    setElapsed(e => {
      const next = e + 1;
      elapsedRef.current = next;
      return next;
    });
  }, [exercise, totalCycles, stop]);

  function start() {
    cyclesRef.current = 0;
    elapsedRef.current = 0;
    setCycles(0);
    setElapsed(0);
    setPhase('inspire');
    setCountdown(exercise.inspire);
    setRunning(true);
  }

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }
  }, [running, tick]);

  const getScale = () => {
    if (!running || phase === 'idle') return 1;
    const dur = phase === 'inspire' ? exercise.inspire : phase === 'hold' ? exercise.hold : exercise.expire;
    const progress = 1 - (countdown / dur);
    if (phase === 'inspire') return 1 + progress * 0.8;
    if (phase === 'hold') return 1.8;
    if (phase === 'expire') return 1.8 - progress * 0.8;
    return 1;
  };

  const scale = getScale();
  const done = cycles >= totalCycles && !running && cycles > 0;
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // Click on bubble starts the exercise
  function handleBubbleClick() {
    if (!running && !done) start();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-950 via-green-900 to-green-950 flex flex-col items-center justify-center px-4 relative overflow-hidden" role="region" aria-label={`Exercice de respiration : ${exercise.name}`}>
      {/* Screen reader live region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {running && `${PHASE_LABELS[phase]}, ${countdown} secondes. Cycle ${cycles + 1} sur ${totalCycles}.`}
        {done && `Exercice terminé. ${cycles} cycles complétés en ${formatTime(elapsed)}.`}
      </div>

      {/* Back */}
      <button type="button" onClick={() => { stop(); onBack(); }}
        aria-label="Retour à la liste des exercices"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-green-300/60 hover:text-white transition-colors z-10">
        ← Retour
      </button>

      {/* Exercise info */}
      <div className="absolute top-6 right-6 text-right z-10">
        <p className="text-xs text-green-300/50 uppercase tracking-wider">{exercise.name}</p>
      </div>

      {/* Ambient glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full blur-[150px] opacity-30 bg-green-500 transition-transform duration-1000 ease-in-out" aria-hidden="true"
        style={{ transform: `scale(${scale * 0.8})` }} />

      {/* Main circle — clickable to start */}
      <button type="button" onClick={handleBubbleClick} disabled={running}
        aria-label={done ? `Exercice terminé, ${cycles} cycles` : running ? `${PHASE_LABELS[phase]}, ${countdown} secondes` : 'Appuyez pour commencer l\'exercice de respiration'}
        className="relative flex items-center justify-center focus:outline-none group">
        {/* Outer ring */}
        <div className={`absolute rounded-full border-2 transition-all duration-1000 ease-in-out ${
          phase === 'inspire' ? 'border-green-400/30' : phase === 'hold' ? 'border-yellow-400/30' : phase === 'expire' ? 'border-green-300/30' : 'border-green-500/20'
        }`} style={{ width: `${scale * 240}px`, height: `${scale * 240}px` }} />

        {/* Inner circle */}
        <div className={`rounded-full shadow-2xl flex items-center justify-center transition-all duration-1000 ease-in-out ${
          running ? 'bg-gradient-to-br from-green-400 to-green-600' : done ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-green-500/80 to-green-700/80 group-hover:from-green-400 group-hover:to-green-600 cursor-pointer'
        }`} style={{ width: `${scale * 200}px`, height: `${scale * 200}px` }}>
          <div className="text-center">
            {done ? (
              <>
                <div className="text-4xl mb-1">✨</div>
                <p className="text-white text-sm font-medium">Bravo !</p>
                <p className="text-green-200 text-xs">{cycles} cycles</p>
              </>
            ) : running ? (
              <>
                <p className="text-6xl font-bold text-white drop-shadow-lg">{countdown}</p>
                <p className="text-sm font-semibold mt-1 text-green-100">{PHASE_LABELS[phase]}</p>
              </>
            ) : (
              <>
                <p className="text-green-200 text-sm font-medium">Appuyez pour commencer</p>
              </>
            )}
          </div>
        </div>
      </button>

      {/* Controls */}
      <div className="mt-12 flex flex-col items-center gap-4 z-10">
        {!running && !done && (
          <div className="flex items-center gap-3" role="radiogroup" aria-label="Nombre de cycles">
            <span className="text-xs text-green-400/60">Cycles :</span>
            {[3, 6, 10].map(n => (
              <button key={n} type="button" onClick={() => setTotalCycles(n)}
                role="radio" aria-checked={totalCycles === n}
                aria-label={`${n} cycles`}
                className={`h-9 w-9 rounded-full text-xs font-bold transition-all ${totalCycles === n ? 'bg-green-400 text-green-950' : 'bg-green-800/50 text-green-300 hover:bg-green-700/50'}`}>
                {n}
              </button>
            ))}
          </div>
        )}

        {running && (
          <button type="button" onClick={stop}
            className="rounded-full bg-green-800/50 border border-green-600/30 px-6 py-2.5 text-sm font-medium text-green-200 hover:bg-green-700/50 transition-colors">
            Arrêter
          </button>
        )}

        {done && (
          <div className="text-center">
            <p className="text-green-400/60 text-sm mb-4">{formatTime(elapsed)} de respiration consciente</p>
            <div className="flex gap-3">
              <button type="button" onClick={start}
                className="rounded-full bg-green-400 px-6 py-2.5 text-sm font-bold text-green-950 hover:bg-green-300 transition-colors">
                Recommencer
              </button>
              <button type="button" onClick={() => { stop(); onBack(); }}
                className="rounded-full bg-green-800/50 border border-green-600/30 px-6 py-2.5 text-sm font-medium text-green-200 hover:bg-green-700/50 transition-colors">
                Terminer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Progress dots */}
      {(running || done) && (
        <div className="absolute bottom-8 flex items-center gap-2" role="progressbar" aria-valuenow={cycles} aria-valuemin={0} aria-valuemax={totalCycles} aria-label={`Progression : ${cycles} cycles sur ${totalCycles}`}>
          {Array.from({ length: totalCycles }).map((_, i) => (
            <div key={i} className={`h-2 w-2 rounded-full transition-colors ${i < cycles ? 'bg-green-400' : i === cycles && running ? 'bg-green-400/60 animate-pulse' : 'bg-green-700/40'}`} />
          ))}
        </div>
      )}
    </div>
  );
}
