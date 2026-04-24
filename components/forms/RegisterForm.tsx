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
    const prenom = (formData.get('prenom') as string).trim();
    const nom = (formData.get('nom') as string).trim();

    if (password !== confirm) {
      setConfirmError('Les mots de passe ne correspondent pas');
      return;
    }
    setConfirmError('');
    formData.set('name', `${prenom} ${nom}`);
    action(formData);
  }

  if (state?.success) {
    return (
      <div className="mt-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <span className="material-symbols-rounded text-3xl text-green-600">check_circle</span>
        </div>
        <p className="text-lg font-semibold text-gray-900">{state.message}</p>
        <p className="mt-1 text-sm text-gray-500">Vous pouvez maintenant vous connecter avec vos identifiants.</p>
        <Link href="/login"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-green-700 px-6 py-3 text-sm font-semibold text-white hover:bg-green-800 transition-colors">
          <span className="material-symbols-rounded text-lg">login</span> Se connecter
        </Link>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="mt-6 space-y-5">
      {state?.message && !state.success && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-100 flex items-center gap-2" role="alert">
          <span className="material-symbols-rounded text-lg">error</span>
          {state.message}
        </div>
      )}

      {/* Prénom + Nom */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="prenom" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Prénom</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <span className="material-symbols-rounded text-xl">person</span>
            </span>
            <input id="prenom" name="prenom" type="text" required
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
              placeholder="Marie" />
          </div>
        </div>
        <div>
          <label htmlFor="nom" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Nom</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <span className="material-symbols-rounded text-xl">badge</span>
            </span>
            <input id="nom" name="nom" type="text" required
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
              placeholder="Dupont" />
          </div>
        </div>
        {state?.errors?.name && (
          <p className="col-span-2 mt-1 text-xs text-red-600">{state.errors.name[0]}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Email</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <span className="material-symbols-rounded text-xl">mail</span>
          </span>
          <input id="email" name="email" type="email" required
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
            placeholder="votre@email.com" />
        </div>
        {state?.errors?.email && (
          <p className="mt-1 text-xs text-red-600">{state.errors.email[0]}</p>
        )}
      </div>

      {/* Mot de passe */}
      <div>
        <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Mot de passe</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <span className="material-symbols-rounded text-xl">lock</span>
          </span>
          <input id="password" name="password" type="password" required
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
            placeholder="••••••••" />
        </div>
        {state?.errors?.password && (
          <p className="mt-1 text-xs text-red-600">{state.errors.password[0]}</p>
        )}
      </div>

      {/* Confirmer */}
      <div>
        <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Confirmer le mot de passe</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <span className="material-symbols-rounded text-xl">verified_user</span>
          </span>
          <input id="confirmPassword" name="confirmPassword" type="password" required
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
            placeholder="••••••••" />
        </div>
        {confirmError && <p className="mt-1 text-xs text-red-600">{confirmError}</p>}
      </div>

      {/* Submit */}
      <button type="submit" disabled={pending}
        className="w-full rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
        {pending ? (
          <><span className="material-symbols-rounded text-lg animate-spin">progress_activity</span> Création en cours...</>
        ) : (
          <><span className="material-symbols-rounded text-lg">person_add</span> Créer un compte</>
        )}
      </button>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs uppercase tracking-wider text-gray-400">Déjà membre ?</span>
        </div>
      </div>

      <div className="text-center">
        <Link href="/login" className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline inline-flex items-center gap-1">
          <span className="material-symbols-rounded text-base">login</span> Se connecter
        </Link>
      </div>
    </form>
  );
}
