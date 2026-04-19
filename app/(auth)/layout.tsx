import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getCurrentUser } from '@/lib/auth-helpers';
import AuthGate from '@/components/ui/AuthGate';

export const dynamic = 'force-dynamic';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  return (
    <>
      <Header />
      <AuthGate isAuthenticated={!!currentUser}>
        {children}
      </AuthGate>
      <Footer />
    </>
  );
}
