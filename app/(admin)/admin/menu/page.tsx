'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';

interface InfoPage {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
}

interface MenuItem {
  id: string;
  label: string;
  pageId: string;
  displayOrder: number;
}

export default function AdminMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [pages, setPages] = useState<InfoPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [menuRes, pagesRes] = await Promise.all([
        fetch('/api/menu-items'),
        fetch('/api/info-pages?all=true'),
      ]);
      if (!menuRes.ok || !pagesRes.ok) throw new Error();
      const menuJson = await menuRes.json();
      const pagesJson = await pagesRes.json();
      setMenuItems(
        [...menuJson.items].sort(
          (a: MenuItem, b: MenuItem) => a.displayOrder - b.displayOrder
        )
      );
      setPages(pagesJson.pages);
    } catch {
      setError('Impossible de charger les données.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleMoveUp(index: number) {
    if (index === 0) return;
    const updated = [...menuItems];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setMenuItems(updated);
    setSuccess('');
  }

  function handleMoveDown(index: number) {
    if (index === menuItems.length - 1) return;
    const updated = [...menuItems];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setMenuItems(updated);
    setSuccess('');
  }

  function handleRemove(index: number) {
    setMenuItems(menuItems.filter((_, i) => i !== index));
    setSuccess('');
  }

  function handleAddItem(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const pageId = formData.get('pageId') as string;
    const label = formData.get('label') as string;

    if (!pageId || !label.trim()) return;

    setMenuItems([
      ...menuItems,
      {
        id: '',
        label: label.trim(),
        pageId,
        displayOrder: menuItems.length,
      },
    ]);
    setShowAddForm(false);
    setSuccess('');
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const body = {
        items: menuItems.map((item, index) => ({
          label: item.label,
          pageId: item.pageId,
          order: index,
        })),
      };
      const res = await fetch('/api/menu-items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error || 'Erreur lors de la sauvegarde.');
        return;
      }
      setSuccess('Menu mis à jour avec succès.');
      await fetchData();
    } catch {
      setError('Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  }

  function getPageTitle(pageId: string) {
    const page = pages.find((p) => p.id === pageId);
    return page ? page.title : 'Page inconnue';
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Menu de navigation</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            {showAddForm ? 'Annuler' : 'Ajouter un élément'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Sauvegarde...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-600" role="status">
          {success}
        </div>
      )}

      {/* Add item form */}
      {showAddForm && (
        <div className="mb-6 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nouvel élément de menu</h2>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="menu-label" className="block text-sm font-medium text-gray-700 mb-1">
                  Label
                </label>
                <input
                  id="menu-label"
                  name="label"
                  type="text"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="menu-page" className="block text-sm font-medium text-gray-700 mb-1">
                  Page associée
                </label>
                <select
                  id="menu-page"
                  name="pageId"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Sélectionner une page</option>
                  {pages.map((page) => (
                    <option key={page.id} value={page.id}>
                      {page.title} {page.status === 'draft' ? '(brouillon)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Ajouter
            </button>
          </form>
        </div>
      )}

      {loading && <p className="text-sm text-gray-500">Chargement...</p>}

      {!loading && menuItems.length === 0 && (
        <p className="text-sm text-gray-500">Aucun élément dans le menu.</p>
      )}

      {!loading && menuItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-md divide-y divide-gray-100">
          {menuItems.map((item, index) => (
            <div
              key={`${item.pageId}-${index}`}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4"
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">Page : {getPageTitle(item.pageId)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  aria-label={`Monter ${item.label}`}
                  className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-colors"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === menuItems.length - 1}
                  aria-label={`Descendre ${item.label}`}
                  className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-colors"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
