'use client';

import { useState, useEffect, useCallback } from 'react';

interface Challenge {
  id: string;
  exerciseId: string;
  exerciseName: string;
  timesPerDay: number;
  daysPerWeek: number;
  cyclesPerSession: number;
  isActive: boolean;
}

interface BreathingLog {
  id: string;
  exerciseId: string;
  challengeId: string | null;
  completedAt: string;
}

interface Exercise {
  id: string;
  name: string;
}

interface ChallengePanelProps {
  exercises: Exercise[];
  onStartExercise?: (exerciseId: string) => void;
}

export default function ChallengePanel({ exercises, onStartExercise }: ChallengePanelProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [logs, setLogs] = useState<BreathingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    exerciseId: exercises[0]?.id || '',
    timesPerDay: 2,
    daysPerWeek: 5,
    cyclesPerSession: 6,
  });

  const fetchData = useCallback(async () => {
    try {
      const [chRes, logRes] = await Promise.all([
        fetch('/api/breathing-challenges'),
        fetch('/api/breathing-logs?days=7'),
      ]);
      if (chRes.ok) {
        const { challenges: ch } = await chRes.json();
        setChallenges(ch.filter((c: Challenge) => c.isActive));
      }
      if (logRes.ok) {
        const { logs: l } = await logRes.json();
        setLogs(l);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function createChallenge() {
    const exercise = exercises.find(e => e.id === formData.exerciseId);
    if (!exercise) return;

    const res = await fetch('/api/breathing-challenges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        exerciseId: formData.exerciseId,
        exerciseName: exercise.name,
        timesPerDay: formData.timesPerDay,
        daysPerWeek: formData.daysPerWeek,
        cyclesPerSession: formData.cyclesPerSession,
      }),
    });

    if (res.ok) {
      setShowForm(false);
      fetchData();
    }
  }

  async function deleteChallenge(id: string) {
    await fetch(`/api/breathing-challenges?id=${id}`, { method: 'DELETE' });
    fetchData();
  }

  function getTodayCount(exerciseId: string) {
    const today = new Date().toDateString();
    return logs.filter(
      l => l.exerciseId === exerciseId && new Date(l.completedAt).toDateString() === today
    ).length;
  }

  function getWeekCount(exerciseId: string) {
    return logs.filter(l => l.exerciseId === exerciseId).length;
  }

  function getWeekDays(exerciseId: string) {
    const days = new Set(
      logs.filter(l => l.exerciseId === exerciseId).map(l => new Date(l.completedAt).toDateString())
    );
    return days.size;
  }

  if (loading) {
    return (
      <div className="rounded-3xl bg-white/80 border border-green-200 p-6 animate-pulse">
        <div className="h-6 bg-green-100 rounded w-1/3 mb-4" />
        <div className="h-20 bg-green-50 rounded" />
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white border border-green-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎯</span>
          <h2 className="text-lg font-bold text-gray-900">Mes défis respiration</h2>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors"
          >
            + Nouveau défi
          </button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="mb-5 rounded-2xl bg-green-50 p-5 space-y-4">
          <p className="text-sm font-semibold text-green-800">Créer un défi</p>

          <div>
            <label htmlFor="challenge-exercise" className="block text-xs text-gray-600 mb-1">Exercice</label>
            <select
              id="challenge-exercise"
              value={formData.exerciseId}
              onChange={e => setFormData(d => ({ ...d, exerciseId: e.target.value }))}
              className="w-full rounded-xl border border-green-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              {exercises.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="challenge-times" className="block text-xs text-gray-600 mb-1">Fois / jour</label>
              <select
                id="challenge-times"
                value={formData.timesPerDay}
                onChange={e => setFormData(d => ({ ...d, timesPerDay: +e.target.value }))}
                className="w-full rounded-xl border border-green-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="challenge-days" className="block text-xs text-gray-600 mb-1">Jours / sem.</label>
              <select
                id="challenge-days"
                value={formData.daysPerWeek}
                onChange={e => setFormData(d => ({ ...d, daysPerWeek: +e.target.value }))}
                className="w-full rounded-xl border border-green-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                {[1, 2, 3, 4, 5, 6, 7].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="challenge-cycles" className="block text-xs text-gray-600 mb-1">Cycles</label>
              <select
                id="challenge-cycles"
                value={formData.cyclesPerSession}
                onChange={e => setFormData(d => ({ ...d, cyclesPerSession: +e.target.value }))}
                className="w-full rounded-xl border border-green-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                {[3, 6, 10].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={createChallenge}
              className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
            >
              Créer le défi
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Active challenges */}
      {challenges.length === 0 && !showForm ? (
        <div className="text-center py-6">
          <p className="text-3xl mb-2">🌬️</p>
          <p className="text-sm text-gray-500">Aucun défi en cours.</p>
          <p className="text-xs text-gray-400 mt-1">Créez un défi pour vous motiver à pratiquer régulièrement.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {challenges.map(ch => {
            const todayDone = getTodayCount(ch.exerciseId);
            const weekDays = getWeekDays(ch.exerciseId);
            const weekSessions = getWeekCount(ch.exerciseId);
            const todayPct = Math.min(100, (todayDone / ch.timesPerDay) * 100);
            const weekPct = Math.min(100, (weekDays / ch.daysPerWeek) * 100);
            const todayComplete = todayDone >= ch.timesPerDay;
            const weekOnTrack = weekDays >= ch.daysPerWeek;

            return (
              <div key={ch.id} className="rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{ch.exerciseName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {ch.timesPerDay}x/jour · {ch.daysPerWeek}j/sem · {ch.cyclesPerSession} cycles
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {onStartExercise && (
                      <button
                        type="button"
                        onClick={() => onStartExercise(ch.exerciseId)}
                        className="text-xs font-semibold text-green-600 hover:text-green-700 bg-white rounded-lg px-2.5 py-1 border border-green-200"
                      >
                        ▶ Go
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteChallenge(ch.id)}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                      aria-label={`Supprimer le défi ${ch.exerciseName}`}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Today progress */}
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">
                      Aujourd&apos;hui : {todayDone}/{ch.timesPerDay}
                      {todayComplete && ' ✅'}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-green-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${todayComplete ? 'bg-green-500' : 'bg-green-400'}`}
                      style={{ width: `${todayPct}%` }}
                    />
                  </div>
                </div>

                {/* Week progress */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">
                      Semaine : {weekDays}/{ch.daysPerWeek} jours ({weekSessions} sessions)
                      {weekOnTrack && ' 🔥'}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-green-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${weekOnTrack ? 'bg-emerald-500' : 'bg-emerald-400'}`}
                      style={{ width: `${weekPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
