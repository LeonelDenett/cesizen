import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const dynamic = 'force-dynamic';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a href="#main-content" className="skip-to-content">Aller au contenu principal</a>
      <Header />
      <main id="main-content" className="flex-1 flex flex-col animate-fade-slide-up" role="main">{children}</main>
      <Footer />
    </>
  );
}
