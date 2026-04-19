import { notFound } from 'next/navigation';
import { eq, and, ne } from 'drizzle-orm';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { infoPages } from '@/lib/db/schema';
import { formatDateFR } from '@/lib/utils';
import MarkdownContent from '@/components/ui/MarkdownContent';

const CAT_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  alimentation: { label: 'Alimentation', emoji: '🥗', color: 'bg-orange-100 text-orange-700' },
  sport: { label: 'Sport', emoji: '🏃', color: 'bg-blue-100 text-blue-700' },
  meditation: { label: 'Méditation', emoji: '🧘', color: 'bg-purple-100 text-purple-700' },
  stress: { label: 'Stress', emoji: '😮‍💨', color: 'bg-red-100 text-red-700' },
  general: { label: 'Général', emoji: '💡', color: 'bg-gray-100 text-gray-700' },
};

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

  if (!page) notFound();

  // Fetch related articles (same category, excluding current)
  const related = await db
    .select({
      id: infoPages.id,
      title: infoPages.title,
      slug: infoPages.slug,
      category: infoPages.category,
      imageUrl: infoPages.imageUrl,
      content: infoPages.content,
    })
    .from(infoPages)
    .where(and(
      eq(infoPages.status, 'published'),
      eq(infoPages.category, page.category),
      ne(infoPages.id, page.id)
    ))
    .limit(4);

  const cat = CAT_LABELS[page.category] || CAT_LABELS.general;
  const parts = page.content.split('\n\n');
  const intro = parts[0] || '';
  const body = parts.slice(1).join('\n\n');

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="relative">
        {page.imageUrl ? (
          <div className="relative h-72 sm:h-96 lg:h-[28rem] w-full overflow-hidden">
            <Image src={page.imageUrl} alt={page.title} fill className="object-cover" priority sizes="100vw" quality={90} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-green-600 to-green-800" />
        )}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-14">
          <div className="mx-auto max-w-6xl">
            <Link href="/articles" className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors mb-4">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Tous les articles
            </Link>
            <div className="flex items-center gap-3 mb-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cat.color}`}>
                {cat.emoji} {cat.label}
              </span>
              <span className="text-sm text-white/70">{formatDateFR(page.updatedAt)}</span>
            </div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl leading-tight drop-shadow-lg max-w-3xl">
              {page.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content + Sidebar */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
          {/* Main article */}
          <div>
            <p className="text-xl sm:text-2xl text-gray-700 leading-relaxed font-light pb-8 border-b border-gray-100">
              {intro}
            </p>
            <div className="py-8">
              <MarkdownContent content={body} />
            </div>
            <div className="border-t border-gray-100 pt-8">
              <div className="rounded-2xl bg-green-50 border border-green-100 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm font-bold text-green-800">💡 Besoin d&apos;aide ?</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Appelez le <strong className="text-green-700">3114</strong> (24h/24, gratuit et confidentiel).
                  </p>
                </div>
                <Link href="/articles" className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800 transition-colors">
                  Plus d&apos;articles →
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar — related articles */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
              Articles similaires
            </h2>
            {related.length === 0 ? (
              <p className="text-sm text-gray-400">Aucun article similaire.</p>
            ) : (
              <div className="space-y-4">
                {related.map(r => {
                  const rCat = CAT_LABELS[r.category] || CAT_LABELS.general;
                  const excerpt = r.content.replace(/[#*\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80) + '...';
                  return (
                    <Link key={r.id} href={`/info/${r.slug}`} className="group block rounded-xl border border-gray-100 bg-white overflow-hidden hover:shadow-md transition-shadow">
                      {r.imageUrl && (
                        <div className="relative h-32 w-full overflow-hidden">
                          <Image src={r.imageUrl} alt={r.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="300px" />
                        </div>
                      )}
                      <div className="p-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${rCat.color} mb-1.5`}>
                          {rCat.emoji} {rCat.label}
                        </span>
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-green-700 transition-colors">
                          {r.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{excerpt}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
