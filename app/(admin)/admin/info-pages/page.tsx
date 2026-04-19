'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';

interface InfoPage {
  id: string;
  title: string;
  slug: string;
  content?: string;
  status: 'published' | 'draft';
  updatedAt: string;
}

export default function AdminInfoPagesPage() {
  const [pages, setPages] = useState<InfoPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPage, setEditingPage] = useState<InfoPage | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

  function handleEdit(page: InfoPage) { setEditingPage(page); setShowForm(true); }
  function handleNewPage() { setEditingPage(null); setShowForm(true); }
  function handleCancelForm() { setShowForm(false); setEditingPage(null); }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true); setError('');
    const fd = new FormData(e.currentTarget);
    const body = { title: fd.get('title') as string, content: fd.get('content') as string, status: fd.get('status') as string };
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
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`;
  }

  const publishedCount = pages.filter(p => p.status === 'published').length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Info Pages</h1>
          <p className="text-sm text-gray-500">Administration CESIZen</p>
        </div>
        <button type="button" onClick={showForm ? handleCancelForm : handleNewPage}
          className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-800 transition-colors">
          {showForm ? 'Annuler' : (<><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>New Entry</>)}
        </button>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Aperçu du contenu</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{publishedCount} Pages actives</p>
          <p className="text-xs text-gray-500 mt-1">Votre base de connaissances.</p>
        </div>
        <div className="rounded-2xl bg-green-700 p-5 text-white">
          <div className="flex items-center gap-1 mb-2"><span className="text-yellow-300">✨</span><span className="text-xs font-semibold uppercase tracking-wider text-green-200">Tips</span></div>
          <p className="text-sm font-medium">Mettez à jour vos fiches régulièrement pour le prochain séminaire.</p>
          <p className="text-xs text-green-200 mt-2">Voir les fiches →</p>
        </div>
      </div>

      {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-100" role="alert">{error}</div>}

      {/* Form */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{editingPage ? 'Modifier la page' : 'Nouvelle page'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="page-title" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Titre</label>
              <input id="page-title" name="title" type="text" required defaultValue={editingPage?.title ?? ''}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20" />
            </div>
            <div>
              <label htmlFor="page-content" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Contenu</label>
              <textarea id="page-content" name="content" required rows={8} defaultValue={editingPage?.content ?? ''}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 resize-none" />
            </div>
            <div>
              <label htmlFor="page-status" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Statut</label>
              <select id="page-status" name="status" required defaultValue={editingPage?.status ?? 'draft'}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20">
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
              </select>
            </div>
            <button type="submit" disabled={saving}
              className="rounded-xl bg-green-700 px-6 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50 transition-colors">
              {saving ? 'Enregistrement...' : editingPage ? 'Mettre à jour' : 'Créer'}
            </button>
          </form>
        </div>
      )}

      {loading && <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-600" /></div>}

      {!loading && pages.length === 0 && <p className="text-sm text-gray-500 text-center py-8">Aucune page trouvée.</p>}

      {/* Table */}
      {!loading && pages.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Titre</th>
                <th className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Slug</th>
                <th className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Statut</th>
                <th className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Dernière modification</th>
                <th className="py-4 px-6 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 text-xs">📄</div>
                      <span className="font-medium text-gray-900">{page.title}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-500 font-mono text-xs">/info/{page.slug}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      page.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${page.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      {page.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-500">{fmtDate(page.updatedAt)}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" onClick={() => handleEdit(page)}
                        className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors">Modifier</button>
                      {deleteConfirmId === page.id ? (
                        <span className="flex items-center gap-1">
                          <span className="text-xs text-red-600">Confirmer ?</span>
                          <button type="button" onClick={() => handleDelete(page.slug)} className="rounded-lg bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700">Oui</button>
                          <button type="button" onClick={() => setDeleteConfirmId(null)} className="rounded-lg bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300">Non</button>
                        </span>
                      ) : (
                        <button type="button" onClick={() => setDeleteConfirmId(page.id)}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors">Supprimer</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-500">
            Affichage de {pages.length} sur {pages.length} pages
          </div>
        </div>
      )}
    </div>
  );
}
