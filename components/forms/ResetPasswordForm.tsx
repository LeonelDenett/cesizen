'use client';

import { useActionState } from 'react';
import { requestPasswordReset, type FormState } from '@/lib/actions/auth';

const initialState: FormState = undefined;

export default function ResetPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initialState);

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md p-6 sm:p-8">
      {state?.message && (
        <div
          className={`mb-4 rounded-lg p-3 text-sm ${
            state.success
              ? 'bg-green-50 text-green-600'
              : 'bg-red-50 text-red-600'
          }`}
          role="alert"
        >
          {state.message}
        </div>
      )}

      <form action={action} className="space-y-4">
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

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
        </button>
      </form>
    </div>
  );
}
