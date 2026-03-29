'use client';

import { useState, useEffect } from 'react';
import EmotionEntryForm from '@/components/tracker/EmotionEntryForm';

interface EditEntryClientProps {
  entryId: string;
}

export default function EditEntryClient({ entryId }: EditEntryClientProps) {
  const [initialData, setInitialData] = useState<{
    emotionLevel1Id: string;
    emotionLevel2Id: string;
    logDate: string;
    note: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchEntry() {
      try {
        const res = await fetch(`/api/tracker?page=1&limit=100`);
        if (!res.ok) {
          setError('Impossible de charger l\u0027entrée.');
          setLoading(false);
          return;
        }
        const data = await res.json();
        const entry = data.entries?.find((e: { id: string }) => e.id === entryId);
        if (!entry) {
          setError('Entrée non trouvée.');
          setLoading(false);
          return;
        }
        setInitialData({
          emotionLevel1Id: entry.emotionLevel1Id,
          emotionLevel2Id: entry.emotionLevel2Id,
          logDate: new Date(entry.logDate).toISOString().split('T')[0],
          note: entry.note || '',
        });
      } catch {
        setError('Une erreur est survenue.');
      } finally {
        setLoading(false);
      }
    }
    fetchEntry();
  }, [entryId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-sm text-gray-500">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 text-center" role="alert">
        {error}
      </div>
    );
  }

  if (!initialData) return null;

  return (
    <EmotionEntryForm
      mode="edit"
      entryId={entryId}
      initialData={initialData}
    />
  );
}
