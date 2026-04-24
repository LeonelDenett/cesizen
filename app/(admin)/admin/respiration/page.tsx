'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';

interface Challenge {
  id: string;
  exerciseId: string;
  exerciseName: string;
  timesPerDay: number;
  daysPerWeek: number;
  cyclesPerSession: number;
  isActive: boolean;
  createdAt: string;
  userName: string;
}

interface Log {
  id: string;
  exerciseId: string;
  cycles: number;
  durationSeconds: number;
  completedAt: string;
  userName: string;
}

interface Stats {
  activeUsersWithChallenges: number;
  sessionsLast30Days: number;
  sessionsToday: number;
  activeChallenges: number;
}

interface Exercise {
  id: string;
  code: string;
  name: string;
  description: string;
  inspire: number;
  hold: number;
  expire: number;
  category: 'basic' | 'advanced';
  benefit: string;
  color: string;
  isActive: boolean;
  displayOrder: number;
}

export default function AdminRespirationPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'exercises' | 'challenges' | 'logs'>('exercises');
  const [showExForm, setShowExForm] = useState(false);
  const [editingEx, setEditingEx] = useState<Exercise | null>(null);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [breathRes, exRes] = await Promise.all([
        fetch('/api/admin/breathing'),
        fetch('/api/breathing-exercises'),
      ]);
      if (breathRes.ok) {
        const data = await breathRes.json();
        setChallenges(data.challenges);
        setLogs(data.logs);
        setStats(data.stats);
      }
      if (exRes.ok) {
        const data = await exRes.json();
        setExercises(data.exercises);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const formatTime = (s: number) => {
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m${s % 60 > 0 ? ` ${s % 60}s` : ''}`;
  };

  async function handleExerciseSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);
    const body = {
      code: fd.get('code') as string,
      name: fd.get('name') as string,
      description: fd.get('description') as string,
      inspire: Number(fd.get('inspire')),
      hold: Number(fd.get('hold') || 0),
      expire: Number(fd.get('expire')),
      category: fd.get('category') as string,
      benefit: fd.get('benefit') as string,
      color: fd.get('color') as string,
      displayOrder: Number(fd.get('displayOrder') || 0),
    };
    try {
      const url = editingEx ? `/api/breathing-exercises/${editingEx.id}` : '/api/breathing-exercises';
      const method = editingEx ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) { const data = await res.json(); setError(data.error || 'Erreur'); return; }
      setShowExForm(false);
      setEditingEx(null);
      fetchData();
    } catch { setError('Erreur serveur.'); }
  }

  async function toggleExercise(ex: Exercise) {
    await fetch(`/api/breathing-exercises/${ex.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !ex.isActive }),
    });
    fetchData();
  }

  async function deleteExercise(id: string) {
    if (!confirm('Supprimer cet exercice ?')) return;
    await fetch(`/api/breathing-exercises/${id}`, { method: 'DELETE' });
    fetchData();
  }

  function startEdit(ex: Exercise) {
    setEditingEx(ex);
    setShowExForm(true);
    setError('');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Respiration</h1>
      <p className="text-sm text-gray-500 mb-6">Gestion des exercices, suivi anonymisé des défis et sessions.</p>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 mb-1">Défis actifs</p>
            <p className="text-2xl font-bold text-green-700">{stats.activeChallenges}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 mb-1">Utilisateurs engagés</p>
            <p className="text-2xl font-bold text-green-700">{stats.activeUsersWithChallenges}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 mb-1">Sessions (30j)</p>
            <p className="text-2xl font-bold text-green-700">{stats.sessionsLast30Days}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 mb-1">Sessions aujourd&apos;hui</p>
            <p className="text-2xl font-bold text-green-700">{stats.sessionsToday}</p>
          </div>
        </div>
      )}

      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
        <button type="button" onClick={() => setTab('exercises')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${tab === 'exercises' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          Exercices ({exercises.length})
        </button>
        <button type="button" onClick={() => setTab('challenges')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${tab === 'challenges' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          Défis ({challenges.length})
        </button>
        <button type="button" onClick={() => setTab('logs')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${tab === 'logs' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          Sessions ({logs.length})
        </button>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600" role="alert">{error}</div>}
      {loading && <p className="text-sm text-gray-500">Chargement...</p>}

      {/* ── EXERCISES TAB ── */}
      {!loading && tab === 'exercises' && (
        <>
          <div className="flex justify-end mb-4">
            <button type="button"
              onClick={() => { setEditingEx(null); setShowExForm(!showExForm); setError(''); }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
              {showExForm && !editingEx ? 'Annuler' : 'Nouvel exercice'}
            </button>
          </div>

          {showExForm && (
            <div className="mb-6 bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {editingEx ? `Modifier : ${editingEx.name}` : 'Nouvel exercice'}
              </h2>
              <form onSubmit={handleExerciseSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="ex-code" className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                    <input id="ex-code" name="code" type="text" required defaultValue={editingEx?.code || ''} placeholder="ex: 748"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="ex-name" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input id="ex-name" name="name" type="text" required defaultValue={editingEx?.name || ''}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="ex-benefit" className="block text-sm font-medium text-gray-700 mb-1">Bénéfice</label>
                    <input id="ex-benefit" name="benefit" type="text" required defaultValue={editingEx?.benefit || ''}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="ex-inspire" className="block text-sm font-medium text-gray-700 mb-1">Inspire (s)</label>
                    <input id="ex-inspire" name="inspire" type="number" required min={1} max={30} defaultValue={editingEx?.inspire || ''}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="ex-hold" className="block text-sm font-medium text-gray-700 mb-1">Rétention (s)</label>
                    <input id="ex-hold" name="hold" type="number" min={0} max={30} defaultValue={editingEx?.hold ?? 0}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="ex-expire" className="block text-sm font-medium text-gray-700 mb-1">Expire (s)</label>
                    <input id="ex-expire" name="expire" type="number" required min={1} max={30} defaultValue={editingEx?.expire || ''}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="ex-category" className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                    <select id="ex-category" name="category" defaultValue={editingEx?.category || 'basic'}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option value="basic">Base</option>
                      <option value="advanced">Avancé</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="ex-color" className="block text-sm font-medium text-gray-700 mb-1">Couleur (gradient)</label>
                    <input id="ex-color" name="color" type="text" defaultValue={editingEx?.color || 'from-green-400 to-green-600'}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="ex-order" className="block text-sm font-medium text-gray-700 mb-1">Ordre</label>
                    <input id="ex-order" name="displayOrder" type="number" min={0} defaultValue={editingEx?.displayOrder ?? 0}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label htmlFor="ex-desc" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea id="ex-desc" name="description" required rows={2} defaultValue={editingEx?.description || ''}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                    {editingEx ? 'Enregistrer' : 'Créer'}
                  </button>
                  <button type="button" onClick={() => { setShowExForm(false); setEditingEx(null); }}
                    className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors">
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {exercises.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun exercice. Créez-en un pour commencer.</p>
          ) : (
            <div className="overflow-x-auto bg-white rounded-xl shadow-md">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium text-gray-700">Code</th>
                    <th scope="col" className="px-4 py-3 font-medium text-gray-700">Nom</th>
                    <th scope="col" className="px-4 py-3 font-medium text-gray-700">Timing</th>
                    <th scope="col" className="px-4 py-3 font-medium text-gray-700">Catégorie</th>
                    <th scope="col" className="px-4 py-3 font-medium text-gray-700">Statut</th>
                    <th scope="col" className="px-4 py-3 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {exercises.map(ex => (
                    <tr key={ex.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-gray-900">{ex.code}</td>
                      <td className="px-4 py-3">
                        <p className="text-gray-900 font-medium">{ex.name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">{ex.benefit}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        ⬆{ex.inspire}s {ex.hold > 0 ? `⏸${ex.hold}s ` : ''}⬇{ex.expire}s
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          ex.category === 'advanced' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>{ex.category === 'advanced' ? 'Avancé' : 'Base'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          ex.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>{ex.isActive ? 'Actif' : 'Inactif'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => startEdit(ex)}
                            className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200">Modifier</button>
                          <button type="button" onClick={() => toggleExercise(ex)}
                            className={`rounded px-2 py-1 text-xs font-medium ${ex.isActive ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                            {ex.isActive ? 'Désactiver' : 'Activer'}
                          </button>
                          <button type="button" onClick={() => deleteExercise(ex.id)}
                            className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200">Supprimer</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── CHALLENGES TAB ── */}
      {!loading && tab === 'challenges' && (
        <>
          {challenges.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun défi créé pour le moment.</p>
          ) : (
            <div className="overflow-x-auto bg-white rounded-xl shadow-md">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium text-gray-700">Utilisateur</th>
                    <th scope="col" className="px-4 py-3 font-medium text-gray-700">Exercice</th>
                    <th scope="col" className="px-4 py-3 font-medium text-gray-700">Objectif</th>
                    <th scope="col" className="px-4 py-3 font-medium text-gray-700">Statut</th>
                    <th scope="col" className="px-4 py-3 font-medium text-gray-700">Créé le</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {challenges.map(ch => (
                    <tr key={ch.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">{ch.userName}</td>
                      <td className="px-4 py-3 text-gray-900">{ch.exerciseName}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {ch.timesPerDay}x/jour · {ch.daysPerWeek}j/sem · {ch.cyclesPerSession} cycles
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          ch.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>{ch.isActive ? 'Actif' : 'Terminé'}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(ch.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── LOGS TAB ── */}
      {!loading && tab === 'logs' && (
        <>
          {logs.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune session enregistrée ces 30 derniers jours.</p>
          ) : (
            <div className="overflow-x-auto bg-white rounded-xl shadow-md">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium text-gray-700">Utilisateur</th>
                    <th scope="col" className="px-4 py-3 font-medium text-gray-700">Exercice</th>
                    <th scope="col" className="px-4 py-3 font-medium text-gray-700">Cycles</th>
                    <th scope="col" className="px-4 py-3 font-medium text-gray-700">Durée</th>
                    <th scope="col" className="px-4 py-3 font-medium text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">{log.userName}</td>
                      <td className="px-4 py-3 text-gray-900">{log.exerciseId}</td>
                      <td className="px-4 py-3 text-gray-600">{log.cycles}</td>
                      <td className="px-4 py-3 text-gray-600">{formatTime(log.durationSeconds)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(log.completedAt).toLocaleString('fr-FR', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
