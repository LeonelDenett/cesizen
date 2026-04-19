import Link from 'next/link';
import NewPasswordForm from '@/components/forms/NewPasswordForm';

export const metadata = { title: 'Nouveau mot de passe — CESIZen' };

export default async function ResetPasswordConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { token } = await searchParams;

  if (!token || typeof token !== 'string') {
    return (
      <div className="bg-gradient-to-br from-green-200 via-green-100 to-green-950/10 min-h-screen">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8 lg:py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-3xl bg-green-950 border border-green-800 shadow-sm p-8 flex flex-col items-center justify-center min-h-[220px]">
              <Link href="/"><img src="/logo-cesizen.svg" alt="CESIZen" className="h-auto w-full max-w-[180px]" /></Link>
            </div>
            <div className="lg:col-span-2 rounded-3xl bg-white border border-gray-100 shadow-sm p-6 sm:p-8 flex flex-col items-center justify-center text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Lien invalide</h1>
              <p className="text-sm text-gray-500 mb-6">Ce lien de réinitialisation est invalide ou expiré.</p>
              <Link href="/reset-password" className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-6 py-3 text-sm font-semibold text-white hover:bg-green-800 transition-colors">
                Demander un nouveau lien →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-200 via-green-100 to-green-950/10 min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8 lg:py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Logo */}
          <div className="rounded-3xl bg-green-950 border border-green-800 shadow-sm p-8 flex flex-col items-center justify-center min-h-[220px]">
            <Link href="/"><img src="/logo-cesizen.svg" alt="CESIZen" className="h-auto w-full max-w-[180px]" /></Link>
          </div>

          {/* Form — spans 2 */}
          <div className="lg:col-span-2 rounded-3xl bg-white border border-gray-100 shadow-sm p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-gray-900">Nouveau mot de passe</h1>
            <p className="mt-1 text-sm text-gray-500">Choisissez un nouveau mot de passe sécurisé.</p>
            <NewPasswordForm token={token} />
          </div>

          {/* Back to login */}
          <div className="sm:col-span-2 lg:col-span-3 rounded-3xl bg-green-950 shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-green-200 text-sm">Vous vous souvenez de votre mot de passe ?</p>
            <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-green-900 hover:bg-green-50 transition-colors">
              Retour à la connexion →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
