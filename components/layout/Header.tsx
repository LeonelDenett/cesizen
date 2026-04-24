import Link from 'next/link';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { menuItems, infoPages } from '@/lib/db/schema';
import MobileNav from './MobileNav';
import AuthStatus from './AuthStatus';

export default async function Header() {
  let items: { id: string; label: string; slug: string }[] = [];
  try {
    items = await db
      .select({
        id: menuItems.id,
        label: menuItems.label,
        slug: infoPages.slug,
      })
      .from(menuItems)
      .innerJoin(infoPages, eq(menuItems.pageId, infoPages.id))
      .orderBy(asc(menuItems.displayOrder));
  } catch {
    // DB not available (build time on Vercel)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-green-200 bg-white md:bg-white/95 md:backdrop-blur md:supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-3 sm:px-4 lg:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity rounded-lg">
            <span className="text-2xl font-black tracking-tight"><span className="text-green-700">CESI</span><span className="text-yellow-500">Zen</span></span>
          </Link>

          {/* Static nav links */}
          <nav aria-label="Navigation principale" className="hidden md:block">
            <ul className="flex items-center gap-1">
              <li>
                <Link href="/" className="px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-700 transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-700 transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/respiration" className="px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-700 transition-colors">
                  Respiration
                </Link>
              </li>
              <li>
                <Link href="/articles" className="px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-700 transition-colors">
                  Articles
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <AuthStatus />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
