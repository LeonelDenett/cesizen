import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth-helpers';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminMobileMenu from '@/components/layout/AdminMobileMenu';

export const metadata = { title: 'Administration — CESIZen' };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect('/login');
  if (currentUser.role !== 'administrateur') redirect('/');

  return (
    <div className="flex flex-col min-h-screen">
      <a href="#admin-content" className="skip-to-content">Aller au contenu principal</a>
      {/* Admin header */}
      <header className="bg-green-950 text-white px-4 py-3 sm:px-6 flex items-center justify-between shrink-0" role="banner">
        <Link href="/admin" className="flex items-center gap-3">
          <span className="text-xl font-black">
            <span className="text-white">CESI</span>
            <span className="text-yellow-400">Zen</span>
          </span>
          <span className="text-xs text-green-400 font-medium hidden sm:inline">Administration</span>
        </Link>
        <AdminMobileMenu userName={currentUser.name ?? ''} userEmail={currentUser.email ?? ''} />
      </header>

      {/* Body: sidebar + content */}
      <div className="flex flex-1">
        <AdminSidebar userName={currentUser.name ?? ''} userEmail={currentUser.email ?? ''} />
        <main id="admin-content" className="flex-1 bg-gray-50 p-4 sm:p-6 lg:p-8 overflow-auto animate-fade-slide-up" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}
