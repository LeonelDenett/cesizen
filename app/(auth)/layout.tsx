import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth-helpers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Providers from '@/components/layout/Providers';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  return (
    <Providers>
      <div className="flex min-h-screen flex-col">
        <Header />
        <nav aria-label="Navigation utilisateur" className="border-b border-gray-100 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ul className="flex items-center gap-1 overflow-x-auto py-2 text-sm">
              <li>
                <Link
                  href="/tracker"
                  className="rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Tracker
                </Link>
              </li>
              <li>
                <Link
                  href="/tracker/report"
                  className="rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Rapports
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Mon profil
                </Link>
              </li>
            </ul>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </Providers>
  );
}
