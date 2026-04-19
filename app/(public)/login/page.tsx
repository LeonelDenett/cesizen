import Link from 'next/link';
import LoginForm from '@/components/forms/LoginForm';

export const metadata = { title: 'Se connecter — CESIZen' };

export default function LoginPage() {
  return (
    <div className="bg-gradient-to-br from-green-200 via-green-100 to-green-950/10 flex-1 flex">
      <div className="mx-auto max-w-6xl w-full px-3 py-3 sm:px-4 sm:py-4 lg:px-6 flex flex-col">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 flex-1">

          {/* Logo */}
          <div className="rounded-3xl bg-green-950 border border-green-800 shadow-sm p-8 flex items-center justify-center">
            <Link href="/"><img src="/logo-cesizen.svg" alt="CESIZen" className="h-auto w-full max-w-[160px]" /></Link>
          </div>

          {/* Form — spans 2, stretches to fill */}
          <div className="lg:col-span-2 rounded-3xl bg-white border border-gray-100 shadow-sm p-6 sm:p-8 flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900">Bienvenue</h1>
            <p className="mt-1 text-sm text-gray-500">Connectez-vous pour accéder à votre espace bien-être.</p>
            <div className="flex-1 flex flex-col justify-center">
              <LoginForm />
            </div>
            <p className="mt-5 text-center text-sm text-gray-500">
              Nouveau sur CESIZen ?{' '}
              <Link href="/register" className="font-semibold text-green-700 hover:underline">Créer un compte</Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
