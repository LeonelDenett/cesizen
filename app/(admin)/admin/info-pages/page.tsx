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
      const json = await res.json();
      setPages(json.pages);
    } catch {
      setError('Impossible de charger les pages.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  function handleEdit(page: InfoPage) {
    setEditingPage(page);
    setShowForm(true);
  }

  function handleNewPage() {
    setEditingPage(null);
    setShowForm(true);
  }

  function handleCancelForm() {
    setShowForm(false);
    setEditingPage(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const body = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      status: formData.get('status') as string,
    };

    try {
      if (editingPage) {
        const res = await fetch(`/api/info-pages/${editingPage.slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const json = await res.json();
          setError(json.error || 'Erreur lors de la mise à jour.');
          setSaving(false);
          return;
        }
      } else {
        const res = await fetch('/api/info-pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const json = await res.json();
          setError(json.error || 'Erreur lors de la création.');
          setSaving(false);
          return;
        }
      }
      setShowForm(false);
      setEditingPage(null);
      await fetchPages();
    } catch {
      setError('Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(slug: string) {
    try {
      const res = await fetch(`/api/info-pages/${slug}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error || 'Erreur lors de la suppression.');
        return;
      }
      setDeleteConfirmId(null);
      await fetchPages();
    } catch {
      setError('Une erreur est survenue.');
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pages d&apos;information</h1>
        <button
          type="button"
          onClick={showForm ? handleCancelForm : handleNewPage}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          {showForm ? 'Annuler' : 'Créer une page'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600" role="alert">
          {error}
        </div>
      )}

      {/* Create / Edit form */}
      {showForm && (
        <div className="mb-6 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingPage ? 'Modifier la page' : 'Nouvelle page'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="page-title" className="block text-sm font-medium text-gray-700 mb-1">
                Titre
              </label>
              <input
                id="page-title"
                name="title"
                type="text"
                required
                defaultValue={editingPage?.title ?? ''}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="page-content" className="block text-sm font-medium text-gray-700 mb-1">
                Contenu
              </label>
              <textarea
                id="page-content"
                name="content"
                required
                rows={8}
                defaultValue={editingPage?.content ?? ''}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="page-status" className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                id="page-status"
                name="status"
                required
                defaultValue={editingPage?.status ?? 'draft'}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Enregistrement...' : editingPage ? 'Mettre à jour' : 'Créer'}
            </button>
          </form>
        </div>
      )}

      {loading && <p className="text-sm text-gray-500">Chargement...</p>}

      {!loading && pages.length === 0 && (
        <p className="text-sm text-gray-500">Aucune page trouvée.</p>
      )}

      {!loading && pages.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-md">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium text-gray-700">Titre</th>
                  <th scope="col" className="px-4 py-3 font-medium text-gray-700">Statut</th>
                  <th scope="col" className="px-4 py-3 font-medium text-gray-700">Dernière modification</th>
                  <th scope="col" className="px-4 py-3 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-medium">{page.title}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        page.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {page.status === 'published' ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(page.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(page)}
                          className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                        >
                          Modifier
                        </button>
                        {deleteConfirmId === page.id ? (
                          <span className="flex items-center gap-1">
                            <span className="text-xs text-red-600">Confirmer ?</span>
                            <button
                              type="button"
                              onClick={() => handleDelete(page.slug)}
                              className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                            >
                              Oui
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(null)}
                              className="rounded bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                            >
                              Non
                            </button>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(page.id)}
                            className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {pages.map((page) => (
              <div key={page.id} className="bg-white rounded-xl shadow-md p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">{page.title}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    page.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {page.status === 'published' ? 'Publié' : 'Brouillon'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Modifié le {formatDate(page.updatedAt)}</p>
                <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => handleEdit(page)}
                    className="rounded bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                  >
                    Modifier
                  </button>
                  {deleteConfirmId === page.id ? (
                    <span className="flex items-center gap-1">
                      <span className="text-xs text-red-600">Confirmer ?</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(page.slug)}
                        className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                      >
                        Oui
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="rounded bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                      >
                        Non
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(page.id)}
                      className="rounded bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
