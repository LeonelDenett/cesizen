'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import Image from 'next/image';

interface InfoPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  imageUrl: string | null;
  status: 'published' | 'draft';
  updatedAt: string;
}

const CAT_LABELS: Record<string, string> = {
  alimentation: '🥗 Alimentation',
  sport: '🏃 Sport',
  meditation: '🧘 Méditation',
  stress: '😮‍💨 Stress',
  general: '💡 Général',
};

const CAT_COLORS: Record<string, string> = {
  alimentation: 'bg-orange-100 text-orange-700',
  sport: 'bg-green-100 text-green-700',
  meditation: 'bg-purple-100 text-purple-700',
  stress: 'bg-red-100 text-red-700',
  general: 'bg-gray-100 text-gray-700',
};

export default function AdminInfoPagesPage() {
  const [pages, setPages] = useState<InfoPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPage, setEditingPage] = useState<InfoPage | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/info-pages?all=true');
      if (!res.ok) throw new Error();
      setPages((await res.json()).pages);
    } catch { setError('Impossible de charger les pages.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  function handleEdit(page: InfoPage) { setEditingPage(page); setShowForm(true); setError(''); }
  function handleNewPage() { setEditingPage(null); setShowForm(true); setError(''); }
  function handleCancelForm() { setShowForm(false); setEditingPage(null); }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true); setError('');
    const fd = new FormData(e.currentTarget);
    const body = {
      title: fd.get('title') as string,
      content: fd.get('content') as string,
      status: fd.get('status') as string,
      imageUrl: (fd.get('imageUrl') as string) || undefined,
      category: fd.get('category') as string,
    };
    try {
      const url = editingPage ? `/api/info-pages/${editingPage.slug}` : '/api/info-pages';
      const method = editingPage ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) { setError((await res.json()).error || 'Erreur.'); setSaving(false); return; }
      setShowForm(false); setEditingPage(null); await fetchPages();
    } catch { setError('Une erreur est survenue.'); } finally { setSaving(false); }
  }

  async function handleDelete(slug: string) {
    try {
      const res = await fetch(`/api/info-pages/${slug}`, { method: 'DELETE' });
      if (!res.ok) { setError((await res.json()).error || 'Erreur.'); return; }
      setDeleteConfirmId(null); await fetchPages();
    } catch { setError('Une erreur est survenue.'); }
  }

  function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function excerpt(content: string) {
    return content.replace(/[#*\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100) + '...';
  }

  const publishedCount = pages.filter(p => p.status === 'published').length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
          <p className="text-sm text-gray-500">{pages.length} articles · {publishedCount} publiés · {pages.length - publishedCount} brouillons</p>
        </div>
        <button type="button" onClick={showForm ? handleCancelForm : handleNewPage}
          className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors">
          {showForm ? 'Annuler' : 'Nouvel article'}
        </button>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600" role="alert">{error}</div>}

      {/* Form */}
      {showForm && (
        <div className="mb-6 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{editingPage ? `Modifier : ${editingPage.title}` : 'Nouvel article'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="page-title" className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                <input id="page-title" name="title" type="text" required defaultValue={editingPage?.title ?? ''}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500" />
              </div>
              <div>
                <label htmlFor="page-category" className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select id="page-category" name="category" defaultValue={editingPage?.category ?? 'general'}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500">
                  <option value="general">Général</option>
                  <option value="alimentation">Alimentation</option>
                  <option value="sport">Sport</option>
                  <option value="meditation">Méditation</option>
                  <option value="stress">Stress</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="page-image" className="block text-sm font-medium text-gray-700 mb-1">Image (URL)</label>
              <input id="page-image" name="imageUrl" type="url" defaultValue={editingPage?.imageUrl ?? ''}
                placeholder="https://images.unsplash.com/..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500" />
            </div>
            <div>
              <label htmlFor="page-content" className="block text-sm font-medium text-gray-700 mb-1">Contenu (Markdown)</label>
              <textarea id="page-content" name="content" required rows={10} defaultValue={editingPage?.content ?? ''}
                placeholder="## Titre&#10;&#10;Votre contenu ici..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-mono focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 resize-y" />
            </div>
            {/* Collapsible: Statut & options */}
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <span className="material-symbols-rounded text-base">tune</span>
                  Statut & publication
                </span>
                <span className={`material-symbols-rounded text-gray-400 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              {showAdvanced && (
                <div className="px-4 py-4 space-y-4 border-t border-gray-200 bg-white">
                  <div>
                    <label htmlFor="page-status" className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <select id="page-status" name="status" defaultValue={editingPage?.status ?? 'draft'}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500">
                      <option value="draft">🟡 Brouillon</option>
                      <option value="published">🟢 Publié</option>
                    </select>
                  </div>
                </div>
              )}
              {/* Hidden fallback so the value is always submitted */}
              {!showAdvanced && (
                <input type="hidden" name="status" value={editingPage?.status ?? 'draft'} />
              )}
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving}
                className="rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50 transition-colors">
                {saving ? 'Enregistrement...' : editingPage ? 'Mettre à jour' : 'Créer'}
              </button>
              <button type="button" onClick={handleCancelForm}
                className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-600" /></div>}
      {!loading && pages.length === 0 && !showForm && <p className="text-sm text-gray-500 text-center py-8">Aucun article.</p>}

      {/* Cards grid */}
      {!loading && pages.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map(page => {
            const colorClass = CAT_COLORS[page.category] || CAT_COLORS.general;
            const catLabel = CAT_LABELS[page.category] || page.category;
            return (
              <div key={page.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                {/* Image */}
                <div className="relative h-40 w-full bg-gray-100">
                  {page.imageUrl ? (
                    <Image src={page.imageUrl} alt={page.title} fill
                      className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-4xl text-gray-300">📄</div>
                  )}
                  <span className={`absolute top-2 left-2 rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}>
                    {catLabel}
                  </span>
                  <span className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    page.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {page.status === 'published' ? 'Publié' : 'Brouillon'}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-2">{page.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 flex-1">{excerpt(page.content)}</p>
                  <p className="text-xs text-gray-400 mt-2">{fmtDate(page.updatedAt)}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button type="button" onClick={() => handleEdit(page)}
                      className="flex-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors text-center">
                      Modifier
                    </button>
                    {deleteConfirmId === page.id ? (
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => handleDelete(page.slug)}
                          className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-700">Oui</button>
                        <button type="button" onClick={() => setDeleteConfirmId(null)}
                          className="rounded-lg bg-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-300">Non</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setDeleteConfirmId(page.id)}
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors">
                        Supprimer
                      </button>
                    )}
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
