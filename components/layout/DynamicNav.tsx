import Link from 'next/link';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { menuItems, infoPages } from '@/lib/db/schema';

export default async function DynamicNav() {
  const items = await db
    .select({
      id: menuItems.id,
      label: menuItems.label,
      slug: infoPages.slug,
    })
    .from(menuItems)
    .innerJoin(infoPages, eq(menuItems.pageId, infoPages.id))
    .orderBy(asc(menuItems.displayOrder));

  if (items.length === 0) return null;

  return (
    <nav aria-label="Menu principal">
      <ul className="hidden md:flex items-center gap-1">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={`/info/${item.slug}`}
              className="px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
