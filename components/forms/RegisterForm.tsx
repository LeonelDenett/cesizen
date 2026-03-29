'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { registerUser, type FormState } from '@/lib/actions/auth';

const initialState: FormState = undefined;

export default function RegisterForm() {
  const [state, action, pending] = useActionState(registerUser, initialState);
  const [confirmError, setConfirmError] = useState('');

  function handleSubmit(formData: FormData) {
    const password = formData.get('password') as string;
    const confirm = formData.get('confirmPassword') as string;

    if (password !== confirm) {
      setConfirmError('Les mots de passe ne correspondent pas');
      return;
    }

    setConfirmError('');
    action(formData);
  }

  if (state?.success) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md p-6 sm:p-8">
        <div className="text-center">
          <div className="text-green-600 text-lg font-semibold mb-2">
            ✓ {state.message}
          </div>
          <p className="text-gray-600 mb-4">
            Vous pouvez maintenant vous connecter avec vos identifiants.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md p-6 sm:p-8">
      {state?.message && !state.success && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600" role="alert">
          {state.message}
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nom
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Votre nom"
          />
          {state?.errors?.name && (
            <p className="mt-1 text-xs text-red-600">{state.errors.name[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="votre@email.com"
          />
          {state?.errors?.email && (
            <p className="mt-1 text-xs text-red-600">{state.errors.email[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Minimum 8 caractères"
          />
          {state?.errors?.password && (
            <p className="mt-1 text-xs text-red-600">{state.errors.password[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Répétez le mot de passe"
          />
          {confirmError && (
            <p className="mt-1 text-xs text-red-600">{confirmError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? 'Création en cours...' : 'Créer un compte'}
        </button>
      </form>
    </div>
  );
}
