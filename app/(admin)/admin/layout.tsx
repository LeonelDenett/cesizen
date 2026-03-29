import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-helpers';
import AdminSidebar from '@/components/layout/AdminSidebar';

export const metadata = {
  title: 'Administration — CESIZen',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  if (currentUser.role !== 'administrateur') {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
