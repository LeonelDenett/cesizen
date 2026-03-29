import Link from 'next/link';
import RegisterForm from '@/components/forms/RegisterForm';

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Créer un compte
        </h1>

        <RegisterForm />

        <p className="mt-4 text-center text-sm text-gray-600">
          Déjà un compte ?{' '}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
