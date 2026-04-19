'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { createPortal } from 'react-dom';

function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function AuthStatus() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (status === 'loading') return <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />;

  if (!session?.user) {
    return (
      <Link href="/login" className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-green-600 text-green-600 hover:bg-green-50 transition-colors" aria-label="Se connecter">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </Link>
    );
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      const res = await fetch('/api/account', { method: 'DELETE' });
      if (res.ok) {
        await signOut({ callbackUrl: '/' });
      }
    } catch {} finally { setDeleting(false); }
  }

  return (
    <>
      {/* Avatar button */}
      <div className="relative">
        <button type="button" onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-green-700 text-white text-xs font-bold hover:bg-green-800 transition-colors"
          title={session.user.name || 'Mon compte'}>
          {getInitials(session.user.name)}
        </button>

        {/* Dropdown */}
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white border border-gray-100 shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900 truncate">{session.user.name}</p>
                <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
              </div>
              <div className="py-1">
                <button type="button" onClick={() => { setMenuOpen(false); setShowAccount(true); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <span className="material-symbols-rounded text-lg">person</span> Mon compte
                </button>
                <button type="button" onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                  <span className="material-symbols-rounded text-lg">logout</span> Déconnexion
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Account modal — rendered via portal to escape header stacking context */}
      {showAccount && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowAccount(false); setConfirmDelete(false); }} />
          <div className="relative w-full max-w-md mx-4 rounded-2xl bg-white p-8 shadow-xl max-h-[85vh] overflow-y-auto">
            <button type="button" onClick={() => { setShowAccount(false); setConfirmDelete(false); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Fermer">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-1">Mon compte</h2>
            <p className="text-sm text-gray-500 mb-6">Gérez vos informations et vos données personnelles.</p>

            {/* User info */}
            <div className="rounded-xl bg-gray-50 p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-700 text-white font-bold">
                  {getInitials(session.user.name)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{session.user.name}</p>
                  <p className="text-sm text-gray-500">{session.user.email}</p>
                </div>
              </div>
            </div>

            {/* RGPD section */}
            <div className="space-y-4 mb-6">
              <h3 className="text-sm font-bold text-gray-900">🔒 Vos droits (RGPD)</h3>
              <div className="text-sm text-gray-600 space-y-2 leading-relaxed">
                <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :</p>
                <ul className="space-y-1.5 pl-4">
                  <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✓</span> <strong>Droit d&apos;accès</strong> — Consulter toutes vos données personnelles</li>
                  <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✓</span> <strong>Droit de rectification</strong> — Modifier vos informations</li>
                  <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✓</span> <strong>Droit à l&apos;effacement</strong> — Supprimer définitivement votre compte et toutes vos données</li>
                  <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✓</span> <strong>Droit à la portabilité</strong> — Recevoir vos données dans un format structuré</li>
                </ul>
                <p className="text-xs text-gray-500 mt-2">Vos données sont chiffrées, hébergées en Union Européenne et ne sont jamais partagées avec des tiers.</p>
              </div>
            </div>

            {/* Delete account */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-sm font-bold text-red-600 mb-2">⚠️ Zone dangereuse</h3>
              <p className="text-xs text-gray-500 mb-4">
                La suppression de votre compte est irréversible. Toutes vos données personnelles seront définitivement effacées conformément au RGPD (droit à l&apos;oubli).
              </p>
              {!confirmDelete ? (
                <button type="button" onClick={() => setConfirmDelete(true)}
                  className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                  Supprimer mon compte
                </button>
              ) : (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                  <p className="text-sm text-red-800 font-medium mb-3">Êtes-vous sûr(e) ? Cette action est irréversible.</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={handleDeleteAccount} disabled={deleting}
                      className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
                      {deleting ? 'Suppression...' : 'Oui, supprimer définitivement'}
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(false)}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
