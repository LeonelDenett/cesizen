import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth-helpers';
import AdminSidebar from '@/components/layout/AdminSidebar';

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
      {/* Admin header */}
      <header className="bg-green-950 text-white px-4 py-3 sm:px-6 flex items-center justify-between shrink-0">
        <Link href="/admin" className="flex items-center gap-3">
          <span className="text-xl font-black">
            <span className="text-white">CESI</span>
            <span className="text-yellow-400">Zen</span>
          </span>
          <span className="text-xs text-green-400 font-medium hidden sm:inline">Administration</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-xs text-green-300 hidden sm:inline">{currentUser.name}</span>
          <span className="text-xs text-green-400">Pour voir le site, déconnectez-vous</span>
        </div>
      </header>

      {/* Body: sidebar + content */}
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 bg-gray-50 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
