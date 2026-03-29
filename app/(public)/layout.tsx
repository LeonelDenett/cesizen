import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Providers from '@/components/layout/Providers';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </Providers>
  );
}
