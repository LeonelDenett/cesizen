import { notFound } from 'next/navigation';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { infoPages } from '@/lib/db/schema';
import { formatDateFR } from '@/lib/utils';

export default async function InfoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [page] = await db
    .select()
    .from(infoPages)
    .where(and(eq(infoPages.slug, slug), eq(infoPages.status, 'published')))
    .limit(1);

  if (!page) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <article>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {page.title}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Dernière mise à jour : {formatDateFR(page.updatedAt)}
        </p>
        <div className="prose prose-gray mt-6 max-w-none whitespace-pre-wrap text-gray-700">
          {page.content}
        </div>
      </article>
    </div>
  );
}
