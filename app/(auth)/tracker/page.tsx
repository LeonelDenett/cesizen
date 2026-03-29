'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import EmotionJournal from '@/components/tracker/EmotionJournal';

interface EmotionLevel2 {
  id: string;
  name: string;
}

interface EmotionLevel1 {
  id: string;
  name: string;
  level2: EmotionLevel2[];
}

interface Entry {
  id: string;
  emotionLevel1Id: string;
  emotionLevel2Id: string;
  logDate: string;
  note: string | null;
}

export default function TrackerPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [emotions, setEmotions] = useState<EmotionLevel1[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tracker?page=${p}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries);
        setTotalPages(data.totalPages);
        setPage(data.page);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function fetchEmotions() {
      try {
        const res = await fetch('/api/emotions');
        if (res.ok) {
          const data = await res.json();
          setEmotions(data.emotions);
        }
      } catch {
        // silent
      }
    }
    fetchEmotions();
  }, []);

  useEffect(() => {
    fetchEntries(page);
  }, [page, fetchEntries]);

  function handleDelete(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Journal de bord</h1>
          <div className="flex gap-3">
            <Link
              href="/tracker/new"
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Nouvelle entrée
            </Link>
            <Link
              href="/tracker/report"
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Rapports
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <p className="text-sm text-gray-500">Chargement...</p>
          </div>
        ) : (
          <>
            <EmotionJournal
              entries={entries}
              emotions={emotions}
              onDelete={handleDelete}
            />

            {totalPages > 1 && (
              <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Précédent
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} sur {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Suivant
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </section>
  );
}
