import Link from 'next/link';
import ResetPasswordForm from '@/components/forms/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Mot de passe oublié
        </h1>

        <p className="mb-6 text-center text-sm text-gray-600">
          Entrez votre adresse email pour recevoir un lien de réinitialisation.
        </p>

        <ResetPasswordForm />

        <p className="mt-4 text-center text-sm text-gray-600">
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
          >
            Retour à la connexion
          </Link>
        </p>
      </div>
    </main>
  );
}
