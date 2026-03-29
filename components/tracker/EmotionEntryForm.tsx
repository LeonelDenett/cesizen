'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import EmotionLevelSelector from './EmotionLevelSelector';

interface EmotionLevel2 {
  id: string;
  name: string;
}

interface EmotionLevel1 {
  id: string;
  name: string;
  level2: EmotionLevel2[];
}

interface EntryData {
  emotionLevel1Id: string;
  emotionLevel2Id: string;
  logDate: string;
  note: string;
}

interface EmotionEntryFormProps {
  mode: 'create' | 'edit';
  entryId?: string;
  initialData?: EntryData;
}

export default function EmotionEntryForm({ mode, entryId, initialData }: EmotionEntryFormProps) {
  const router = useRouter();
  const [emotions, setEmotions] = useState<EmotionLevel1[]>([]);
  const [selectedLevel1Id, setSelectedLevel1Id] = useState(initialData?.emotionLevel1Id ?? '');
  const [selectedLevel2Id, setSelectedLevel2Id] = useState(initialData?.emotionLevel2Id ?? '');
  const [logDate, setLogDate] = useState(initialData?.logDate ?? new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState(initialData?.note ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingEmotions, setLoadingEmotions] = useState(true);

  useEffect(() => {
    async function fetchEmotions() {
      try {
        const res = await fetch('/api/emotions');
        if (res.ok) {
          const data = await res.json();
          setEmotions(data.emotions);
        }
      } catch {
        setError('Impossible de charger les émotions.');
      } finally {
        setLoadingEmotions(false);
      }
    }
    fetchEmotions();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (!selectedLevel1Id || !selectedLevel2Id) {
      setError('Les deux niveaux d\u0027émotion sont obligatoires.');
      return;
    }

    setLoading(true);

    const body = {
      emotionLevel1Id: selectedLevel1Id,
      emotionLevel2Id: selectedLevel2Id,
      logDate,
      note: note || undefined,
    };

    try {
      const url = mode === 'edit' ? `/api/tracker/${entryId}` : '/api/tracker';
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Une erreur est survenue.');
        setLoading(false);
        return;
      }

      router.push('/tracker');
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
      setLoading(false);
    }
  }

  if (loadingEmotions) {
    return (
      <div className="flex justify-center py-8">
        <p className="text-sm text-gray-500">Chargement des émotions...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-xl shadow-md p-6 sm:p-8">
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <EmotionLevelSelector
          emotions={emotions}
          selectedLevel1Id={selectedLevel1Id}
          selectedLevel2Id={selectedLevel2Id}
          onLevel1Change={setSelectedLevel1Id}
          onLevel2Change={setSelectedLevel2Id}
        />

        <div>
          <label htmlFor="logDate" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            id="logDate"
            type="date"
            value={logDate}
            onChange={(e) => setLogDate(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
            Note <span className="text-gray-400">(optionnelle)</span>
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Comment vous sentez-vous ?"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading
              ? 'Enregistrement...'
              : mode === 'edit'
                ? 'Modifier'
                : 'Enregistrer'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/tracker')}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
