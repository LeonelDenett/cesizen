import Link from 'next/link';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { menuItems, infoPages } from '@/lib/db/schema';
import DynamicNav from './DynamicNav';
import MobileNav from './MobileNav';
import AuthStatus from './AuthStatus';

export default async function Header() {
  // Fetch menu items for the mobile nav (client component needs serialized data)
  const items = await db
    .select({
      id: menuItems.id,
      label: menuItems.label,
      slug: infoPages.slug,
    })
    .from(menuItems)
    .innerJoin(infoPages, eq(menuItems.pageId, infoPages.id))
    .orderBy(asc(menuItems.displayOrder));

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-1"
          >
            CESIZen
          </Link>
          <DynamicNav />
        </div>

        <div className="flex items-center gap-2">
          <AuthStatus />
          <MobileNav items={items} />
        </div>
      </div>
    </header>
  );
}
