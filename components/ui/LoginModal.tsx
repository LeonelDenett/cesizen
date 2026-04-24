'use client';

import { useState, type FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  redirectTo?: string;
}

export default function LoginModal({ open, onClose, redirectTo = '/' }: LoginModalProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(''); setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const result = await signIn('credentials', {
        email: fd.get('email') as string,
        password: fd.get('password') as string,
        redirect: false,
      });
      if (result?.error) {
        setError('Email ou mot de passe incorrect');
        setLoading(false);
        return;
      }
      onClose();
      router.push(redirectTo);
    } catch {
      setError('Une erreur est survenue.');
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 rounded-2xl bg-white p-8 shadow-xl">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Fermer">
          <span className="material-symbols-rounded text-xl">close</span>
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto mb-5 flex h-[150px] w-[150px] items-center justify-center rounded-full bg-green-50 border-2 border-green-100">
            <img src="/logo-cesizen.svg" alt="CESIZen" className="h-24 w-auto" />
          </div>
          <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-3 mb-4">
            <p className="text-sm text-yellow-800">
              🔒 Pour suivre vos émotions et sauvegarder vos résultats, vous devez être connecté(e).
            </p>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Connectez-vous</h2>
          <p className="mt-1 text-sm text-gray-500">Accédez à votre espace bien-être personnel.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-100">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="modal-email" className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input id="modal-email" name="email" type="email" required placeholder="nom@exemple.com"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20" />
          </div>
          <div>
            <label htmlFor="modal-password" className="block text-sm font-semibold text-gray-700 mb-1">Mot de passe</label>
            <input id="modal-password" name="password" type="password" required placeholder="••••••••"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full rounded-xl bg-green-700 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50 transition-colors">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Pas encore de compte ?{' '}
          <Link href="/register" onClick={onClose} className="font-semibold text-green-600 hover:text-green-700">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}
