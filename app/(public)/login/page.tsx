import Link from 'next/link';
import LoginForm from '@/components/forms/LoginForm';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Se connecter
        </h1>

        <LoginForm />

        <div className="mt-4 flex flex-col items-center gap-2 text-sm text-gray-600">
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
          >
            Créer un compte
          </Link>
          <Link
            href="/reset-password"
            className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </div>
      </div>
    </main>
  );
}
