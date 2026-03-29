'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'utilisateur' | 'administrateur';
  isActive: boolean;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/users?page=${page}&limit=20`);
      if (!res.ok) throw new Error('Erreur lors du chargement des utilisateurs.');
      const json: UsersResponse = await res.json();
      setData(json);
    } catch {
      setError('Impossible de charger les utilisateurs.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleToggleActive(userId: string, currentActive: boolean) {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error || 'Erreur lors de la modification.');
        return;
      }
      await fetchUsers();
    } catch {
      setError('Une erreur est survenue.');
    }
  }

  async function handleDelete(userId: string) {
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error || 'Erreur lors de la suppression.');
        return;
      }
      setDeleteConfirmId(null);
      await fetchUsers();
    } catch {
      setError('Une erreur est survenue.');
    }
  }

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as string,
      password: formData.get('password') as string,
    };

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error || 'Erreur lors de la création.');
        setCreating(false);
        return;
      }
      setShowCreateForm(false);
      await fetchUsers();
    } catch {
      setError('Une erreur est survenue.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
        <button
          type="button"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          {showCreateForm ? 'Annuler' : 'Créer un utilisateur'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600" role="alert">
          {error}
        </div>
      )}

      {/* Create user form */}
      {showCreateForm && (
        <div className="mb-6 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nouveau utilisateur</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="create-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <input
                  id="create-name"
                  name="name"
                  type="text"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="create-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="create-email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="create-role" className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle
                </label>
                <select
                  id="create-role"
                  name="role"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="utilisateur">Utilisateur</option>
                  <option value="administrateur">Administrateur</option>
                </select>
              </div>
              <div>
                <label htmlFor="create-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <input
                  id="create-password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {creating ? 'Création...' : 'Créer'}
            </button>
          </form>
        </div>
      )}

      {loading && (
        <p className="text-sm text-gray-500">Chargement...</p>
      )}

      {!loading && data && data.users.length === 0 && (
        <p className="text-sm text-gray-500">Aucun utilisateur trouvé.</p>
      )}

      {!loading && data && data.users.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-md">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium text-gray-700">Nom</th>
                  <th scope="col" className="px-4 py-3 font-medium text-gray-700">Email</th>
                  <th scope="col" className="px-4 py-3 font-medium text-gray-700">Rôle</th>
                  <th scope="col" className="px-4 py-3 font-medium text-gray-700">Statut</th>
                  <th scope="col" className="px-4 py-3 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{user.name}</td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.role === 'administrateur'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role === 'administrateur' ? 'Admin' : 'Utilisateur'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(user.id, user.isActive)}
                          className={`rounded px-2 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                            user.isActive
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 focus:ring-yellow-500'
                              : 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500'
                          }`}
                        >
                          {user.isActive ? 'Désactiver' : 'Activer'}
                        </button>
                        {deleteConfirmId === user.id ? (
                          <span className="flex items-center gap-1">
                            <span className="text-xs text-red-600">Confirmer ?</span>
                            <button
                              type="button"
                              onClick={() => handleDelete(user.id)}
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
                            onClick={() => setDeleteConfirmId(user.id)}
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
            {data.users.map((user) => (
              <div key={user.id} className="bg-white rounded-xl shadow-md p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <div className="flex gap-1.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      user.role === 'administrateur'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role === 'administrateur' ? 'Admin' : 'Utilisateur'}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      user.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{user.email}</p>
                <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(user.id, user.isActive)}
                    className={`rounded px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                      user.isActive
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 focus:ring-yellow-500'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500'
                    }`}
                  >
                    {user.isActive ? 'Désactiver' : 'Activer'}
                  </button>
                  {deleteConfirmId === user.id ? (
                    <span className="flex items-center gap-1">
                      <span className="text-xs text-red-600">Confirmer ?</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(user.id)}
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
                      onClick={() => setDeleteConfirmId(user.id)}
                      className="rounded bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Page {data.page} sur {data.totalPages} ({data.total} utilisateurs)
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
