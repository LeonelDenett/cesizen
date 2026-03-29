'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDateFR } from '@/lib/utils';

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

interface EmotionJournalProps {
  entries: Entry[];
  emotions: EmotionLevel1[];
  onDelete: (id: string) => void;
}

function getEmotionName(emotions: EmotionLevel1[], level1Id: string): string {
  return emotions.find((e) => e.id === level1Id)?.name ?? '—';
}

function getLevel2Name(emotions: EmotionLevel1[], level1Id: string, level2Id: string): string {
  const l1 = emotions.find((e) => e.id === level1Id);
  return l1?.level2.find((e) => e.id === level2Id)?.name ?? '—';
}

export default function EmotionJournal({ entries, emotions, onDelete }: EmotionJournalProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/tracker/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onDelete(id);
      }
    } catch {
      // silent
    } finally {
      setDeletingId(null);
    }
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Aucune entrée dans votre journal.</p>
        <Link
          href="/tracker/new"
          className="inline-block rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Ajouter une entrée
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: card layout */}
      <div className="space-y-4 md:hidden">
        {entries.map((entry) => (
          <article
            key={entry.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <time className="text-sm font-medium text-gray-900">
                {formatDateFR(new Date(entry.logDate))}
              </time>
              <div className="flex items-center gap-2">
                <Link
                  href={`/tracker/${entry.id}/edit`}
                  className="text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                >
                  Modifier
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(entry.id)}
                  disabled={deletingId === entry.id}
                  className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                >
                  {deletingId === entry.id ? '...' : 'Supprimer'}
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              <span className="font-medium">{getEmotionName(emotions, entry.emotionLevel1Id)}</span>
              {' → '}
              <span>{getLevel2Name(emotions, entry.emotionLevel1Id, entry.emotionLevel2Id)}</span>
            </p>
            {entry.note && (
              <p className="mt-2 text-sm text-gray-500 line-clamp-2">{entry.note}</p>
            )}
          </article>
        ))}
      </div>

      {/* Desktop: table layout */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="py-3 px-4 font-medium text-gray-500">Date</th>
              <th className="py-3 px-4 font-medium text-gray-500">Émotion Niveau 1</th>
              <th className="py-3 px-4 font-medium text-gray-500">Émotion Niveau 2</th>
              <th className="py-3 px-4 font-medium text-gray-500">Note</th>
              <th className="py-3 px-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900">
                  <time>{formatDateFR(new Date(entry.logDate))}</time>
                </td>
                <td className="py-3 px-4 text-gray-700">
                  {getEmotionName(emotions, entry.emotionLevel1Id)}
                </td>
                <td className="py-3 px-4 text-gray-700">
                  {getLevel2Name(emotions, entry.emotionLevel1Id, entry.emotionLevel2Id)}
                </td>
                <td className="py-3 px-4 text-gray-500 max-w-xs truncate">
                  {entry.note || '—'}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/tracker/${entry.id}/edit`}
                      className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    >
                      Modifier
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      disabled={deletingId === entry.id}
                      className="text-red-600 hover:text-red-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                    >
                      {deletingId === entry.id ? '...' : 'Supprimer'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
