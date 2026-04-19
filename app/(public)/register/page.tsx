import Link from 'next/link';
import RegisterForm from '@/components/forms/RegisterForm';

export const metadata = { title: 'Créer un compte — CESIZen' };

export default function RegisterPage() {
  return (
    <div className="bg-gradient-to-br from-green-100 via-green-50 to-yellow-50/50 min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:py-5 lg:py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">

          {/* Logo card */}
          <div className="rounded-3xl bg-gradient-to-br from-green-200 via-green-100 to-yellow-100 border border-green-200/50 shadow-sm p-8 flex flex-col items-center justify-center min-h-[220px]">
            <Link href="/"><img src="/logo-cesizen.svg" alt="CESIZen" className="h-auto w-full max-w-[180px]" /></Link>
          </div>

          {/* Register form — spans 2 on desktop */}
          <div className="lg:col-span-2 rounded-3xl bg-white/70 backdrop-blur border border-white/80 shadow-sm p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-gray-900">Commencez votre voyage</h1>
            <p className="mt-1 text-sm text-gray-500">Créez votre compte pour accéder à votre espace bien-être.</p>
            <RegisterForm />
          </div>

          {/* Login link card */}
          <div className="rounded-3xl bg-white/70 backdrop-blur border border-white/80 shadow-sm p-6 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-gray-500 mb-3">Déjà membre ?</p>
            <Link href="/login" className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              Se connecter
            </Link>
          </div>

          {/* Legal card */}
          <div className="sm:col-span-2 rounded-3xl bg-yellow-400/60 shadow-sm p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="text-4xl">📋</div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-yellow-900/70 mb-1">Mentions légales</p>
              <p className="text-sm text-yellow-900">En créant un compte, vous acceptez nos conditions d&apos;utilisation et notre politique de confidentialité.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
