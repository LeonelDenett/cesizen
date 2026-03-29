import Link from 'next/link';
import NewPasswordForm from '@/components/forms/NewPasswordForm';

export default async function ResetPasswordConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { token } = await searchParams;

  if (!token || typeof token !== 'string') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Lien invalide
          </h1>
          <p className="mb-6 text-sm text-gray-600">
            Ce lien de réinitialisation est invalide. Veuillez demander un nouveau lien.
          </p>
          <Link
            href="/reset-password"
            className="inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Demander un nouveau lien
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Nouveau mot de passe
        </h1>

        <NewPasswordForm token={token} />

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
