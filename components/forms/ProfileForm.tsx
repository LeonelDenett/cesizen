'use client';

import { useActionState } from 'react';
import { updateProfile } from '@/lib/actions/users';
import type { FormState } from '@/lib/actions/auth';

interface ProfileFormProps {
  name: string;
  email: string;
}

const initialState: FormState = undefined;

export default function ProfileForm({ name, email }: ProfileFormProps) {
  const [state, action, pending] = useActionState(updateProfile, initialState);

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Modifier mes informations
      </h2>

      {state?.success && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700" role="status">
          {state.message}
        </div>
      )}

      {state?.message && !state.success && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600" role="alert">
          {state.message}
        </div>
      )}

      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nom
          </label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={name}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            defaultValue={email}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {state?.errors?.email && (
            <p className="mt-1 text-xs text-red-600">{state.errors.email[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? 'Mise à jour en cours...' : 'Enregistrer les modifications'}
        </button>
      </form>
    </div>
  );
}
