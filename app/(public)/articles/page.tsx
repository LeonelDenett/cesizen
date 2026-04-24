'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  imageUrl: string | null;
  content: string;
  updatedAt: string;
}

const CATEGORIES = [
  { value: 'all', label: 'Tous', emoji: '📚' },
  { value: 'alimentation', label: 'Alimentation', emoji: '🥗' },
  { value: 'sport', label: 'Sport', emoji: '🏃' },
  { value: 'meditation', label: 'Méditation', emoji: '🧘' },
  { value: 'stress', label: 'Stress', emoji: '😮‍💨' },
  { value: 'general', label: 'Général', emoji: '💡' },
];

const CAT_COLORS: Record<string, string> = {
  alimentation: 'bg-orange-100 text-orange-700',
  sport: 'bg-blue-100 text-blue-700',
  meditation: 'bg-purple-100 text-purple-700',
  stress: 'bg-red-100 text-red-700',
  general: 'bg-gray-100 text-gray-700',
};

export default function ArticlesPage() {
  const { data: session } = useSession();
  const [articles, setArticles] = useState<Article[]>([]);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/info-pages').then(r => r.json()).then(d => {
      setArticles(d.pages || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetch('/api/favorites').then(r => r.json()).then(d => {
        setFavIds(new Set((d.favorites || []).map((f: { pageId: string }) => f.pageId)));
      }).catch(() => {});
    }
  }, [session]);

  async function toggleFav(pageId: string) {
    if (!session?.user) return;
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId }),
    });
    if (res.ok) {
      const { favorited } = await res.json();
      setFavIds(prev => {
        const next = new Set(prev);
        if (favorited) next.add(pageId); else next.delete(pageId);
        return next;
      });
    }
  }

  const filtered = filter === 'all' ? articles : articles.filter(a => a.category === filter);

  function excerpt(content: string) {
    return content.replace(/[#*\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120) + '...';
  }

  return (
    <div className="bg-gradient-to-br from-green-200 via-green-100 to-green-950/10 min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-950 px-4 py-1.5 text-xs font-semibold text-green-200 mb-4">
            📚 Bibliothèque de ressources
          </div>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Articles <span className="italic text-green-700">Santé</span>
          </h1>
          <p className="mt-2 text-gray-600 max-w-xl mx-auto">
            Ressources validées par des professionnels pour prendre soin de votre bien-être.
          </p>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map(cat => (
            <button key={cat.value} type="button" onClick={() => setFilter(cat.value)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                filter === cat.value
                  ? 'bg-green-950 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-700'
              }`}>
              <span>{cat.emoji}</span> {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-12">Aucun article dans cette catégorie.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(article => {
              const cat = CATEGORIES.find(c => c.value === article.category);
              const colorClass = CAT_COLORS[article.category] || 'bg-gray-100 text-gray-700';
              const isFav = favIds.has(article.id);
              return (
                <Link key={article.id} href={`/info/${article.slug}`} className="group rounded-3xl bg-white shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow block">
                  {/* Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    {article.imageUrl ? (
                      <Image
                        src={article.imageUrl}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        quality={85}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-4xl">{cat?.emoji || '📄'}</div>
                    )}
                    {/* Fav button */}
                    {session?.user && (
                      <button type="button" onClick={(e) => { e.preventDefault(); toggleFav(article.id); }}
                        className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-sm hover:scale-110 transition-transform"
                        aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}>
                        {isFav ? '❤️' : '🤍'}
                      </button>
                    )}
                    {/* Category badge */}
                    <span className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold ${colorClass} backdrop-blur`}>
                      {cat?.emoji} {cat?.label || article.category}
                    </span>
                  </div>
                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-green-700 transition-colors">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 line-clamp-3">{excerpt(article.content)}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-green-600 group-hover:text-green-700 transition-colors">
                      Lire l&apos;article
                      <span className="material-symbols-rounded text-base">arrow_forward</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
