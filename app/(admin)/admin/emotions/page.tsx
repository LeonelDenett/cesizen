'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';

interface EmotionLevel2 {
  id: string;
  name: string;
  isActive: boolean;
  displayOrder: number;
}

interface EmotionLevel1 {
  id: string;
  name: string;
  isActive: boolean;
  displayOrder: number;
  level2: EmotionLevel2[];
}

export default function AdminEmotionsPage() {
  const [emotions, setEmotions] = useState<EmotionLevel1[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Add level 1
  const [showAddL1, setShowAddL1] = useState(false);
  const [addingL1, setAddingL1] = useState(false);

  // Add level 2 (keyed by parent level1 id)
  const [addL2ParentId, setAddL2ParentId] = useState<string | null>(null);
  const [addingL2, setAddingL2] = useState(false);

  // Rename
  const [renaming, setRenaming] = useState<{ id: string; level: '1' | '2'; name: string } | null>(null);
  const [savingRename, setSavingRename] = useState(false);

  // Deactivate level 1 confirmation
  const [deactivateConfirm, setDeactivateConfirm] = useState<string | null>(null);

  const fetchEmotions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/emotions?all=true');
      if (!res.ok) throw new Error();
      const json = await res.json();
      setEmotions(json.emotions);
    } catch {
      setError('Impossible de charger les émotions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmotions();
  }, [fetchEmotions]);

  function toggleExpand(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  // --- Add Level 1 ---
  async function handleAddL1(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddingL1(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;

    try {
      const res = await fetch('/api/emotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, level: '1' }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error || 'Erreur lors de la création.');
        setAddingL1(false);
        return;
      }
      setShowAddL1(false);
      await fetchEmotions();
    } catch {
      setError('Une erreur est survenue.');
    } finally {
      setAddingL1(false);
    }
  }

  // --- Add Level 2 ---
  async function handleAddL2(e: FormEvent<HTMLFormElement>, parentId: string) {
    e.preventDefault();
    setAddingL2(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;

    try {
      const res = await fetch('/api/emotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, level: '2', emotionLevel1Id: parentId }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error || 'Erreur lors de la création.');
        setAddingL2(false);
        return;
      }
      setAddL2ParentId(null);
      await fetchEmotions();
    } catch {
      setError('Une erreur est survenue.');
    } finally {
      setAddingL2(false);
    }
  }

  // --- Rename ---
  async function handleRename(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!renaming) return;
    setSavingRename(true);
    setError('');

    try {
      const res = await fetch(`/api/emotions/${renaming.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: renaming.name, level: renaming.level }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error || 'Erreur lors de la modification.');
        setSavingRename(false);
        return;
      }
      setRenaming(null);
      await fetchEmotions();
    } catch {
      setError('Une erreur est survenue.');
    } finally {
      setSavingRename(false);
    }
  }

  // --- Toggle active ---
  async function handleToggleActive(id: string, currentActive: boolean, level: '1' | '2') {
    // For level 1 deactivation, require confirmation first
    if (level === '1' && currentActive) {
      setDeactivateConfirm(id);
      return;
    }
    await doToggle(id, currentActive, level);
  }

  async function doToggle(id: string, currentActive: boolean, level: '1' | '2') {
    setError('');
    try {
      const res = await fetch(`/api/emotions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive, level }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error || 'Erreur lors de la modification.');
        return;
      }
      setDeactivateConfirm(null);
      await fetchEmotions();
    } catch {
      setError('Une erreur est survenue.');
    }
  }

  function hasActiveChildren(emotionId: string): boolean {
    const emotion = emotions.find((e) => e.id === emotionId);
    return emotion ? emotion.level2.some((l2) => l2.isActive) : false;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Émotions</h1>
        <button
          type="button"
          onClick={() => { setShowAddL1(!showAddL1); setAddL2ParentId(null); }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          {showAddL1 ? 'Annuler' : 'Ajouter une émotion niveau 1'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600" role="alert">
          {error}
        </div>
      )}

      {/* Add Level 1 form */}
      {showAddL1 && (
        <div className="mb-6 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nouvelle émotion niveau 1</h2>
          <form onSubmit={handleAddL1} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label htmlFor="new-l1-name" className="sr-only">Nom</label>
              <input
                id="new-l1-name"
                name="name"
                type="text"
                required
                placeholder="Nom de l'émotion"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={addingL1}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {addingL1 ? 'Création...' : 'Créer'}
            </button>
          </form>
        </div>
      )}

      {/* Rename modal */}
      {renaming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setRenaming(null)}>
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Renommer l&apos;émotion</h2>
            <form onSubmit={handleRename} className="space-y-4">
              <div>
                <label htmlFor="rename-input" className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau nom
                </label>
                <input
                  id="rename-input"
                  type="text"
                  required
                  value={renaming.name}
                  onChange={(e) => setRenaming({ ...renaming, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenaming(null)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingRename}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {savingRename ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate Level 1 confirmation dialog */}
      {deactivateConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setDeactivateConfirm(null)}>
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Confirmer la désactivation</h2>
            <p className="text-sm text-gray-600 mb-4">
              {hasActiveChildren(deactivateConfirm)
                ? 'Cette émotion de niveau 1 possède des sous-émotions actives. Les désactiver toutes ? Les entrées existantes dans le journal seront conservées.'
                : 'Désactiver cette émotion ? Elle ne sera plus disponible dans le formulaire du tracker. Les entrées existantes seront conservées.'}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeactivateConfirm(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => doToggle(deactivateConfirm, true, '1')}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                Désactiver
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && <p className="text-sm text-gray-500">Chargement...</p>}

      {!loading && emotions.length === 0 && (
        <p className="text-sm text-gray-500">Aucune émotion trouvée.</p>
      )}

      {/* Emotions list */}
      {!loading && emotions.length > 0 && (
        <div className="space-y-3">
          {emotions.map((l1) => {
            const isExpanded = expanded[l1.id] ?? true;
            return (
              <div key={l1.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Level 1 header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleExpand(l1.id)}
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? `Réduire ${l1.name}` : `Développer ${l1.name}`}
                      className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    >
                      <svg className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <span className="font-medium text-gray-900 truncate">{l1.name}</span>
                    <span className={`shrink-0 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      l1.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {l1.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <button
                      type="button"
                      onClick={() => setRenaming({ id: l1.id, level: '1', name: l1.name })}
                      className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                    >
                      Renommer
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(l1.id, l1.isActive, '1')}
                      className={`rounded px-2 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                        l1.isActive
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 focus:ring-yellow-500'
                          : 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500'
                      }`}
                    >
                      {l1.isActive ? 'Désactiver' : 'Activer'}
                    </button>
                  </div>
                </div>

                {/* Level 2 children */}
                {isExpanded && (
                  <div className="px-4 py-2">
                    {l1.level2.length === 0 && (
                      <p className="text-xs text-gray-400 py-2 pl-7">Aucune sous-émotion.</p>
                    )}
                    {l1.level2.map((l2) => (
                      <div key={l2.id} className="flex items-center justify-between py-2 pl-7 border-b border-gray-50 last:border-b-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm text-gray-700 truncate">{l2.name}</span>
                          <span className={`shrink-0 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                            l2.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {l2.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={() => setRenaming({ id: l2.id, level: '2', name: l2.name })}
                            className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                          >
                            Renommer
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(l2.id, l2.isActive, '2')}
                            className={`rounded px-2 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                              l2.isActive
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 focus:ring-yellow-500'
                                : 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500'
                            }`}
                          >
                            {l2.isActive ? 'Désactiver' : 'Activer'}
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add level 2 form or button */}
                    {addL2ParentId === l1.id ? (
                      <form onSubmit={(e) => handleAddL2(e, l1.id)} className="flex items-center gap-2 py-2 pl-7">
                        <label htmlFor={`add-l2-${l1.id}`} className="sr-only">Nom de la sous-émotion</label>
                        <input
                          id={`add-l2-${l1.id}`}
                          name="name"
                          type="text"
                          required
                          placeholder="Nom de la sous-émotion"
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          type="submit"
                          disabled={addingL2}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {addingL2 ? '...' : 'Créer'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setAddL2ParentId(null)}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-colors"
                        >
                          Annuler
                        </button>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setAddL2ParentId(l1.id); setShowAddL1(false); }}
                        className="mt-1 mb-1 ml-7 rounded text-xs font-medium text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                      >
                        + Ajouter une sous-émotion
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
