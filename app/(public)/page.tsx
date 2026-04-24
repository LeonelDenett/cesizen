import Link from 'next/link';
import Image from 'next/image';
import RgpdCard from '@/components/ui/RgpdModal';

export default function HomePage() {
  return (
    <div className="bg-gradient-to-br from-green-50 via-white to-green-100/30 min-h-screen relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-20 -left-20 w-72 h-72 bg-green-200/30 rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute top-96 right-0 w-96 h-96 bg-green-100/40 rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-40 -left-32 w-80 h-80 bg-yellow-100/30 rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-0 right-20 w-64 h-64 bg-green-200/20 rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-green-300/15 rounded-full blur-2xl" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl px-3 py-3 sm:px-4 sm:py-4 lg:px-6">

        {/* Bento Grid: 1 col mobile, 2 tablet, 3 desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">

          {/* 1. Logo — always first */}
          <div className="rounded-3xl bg-green-950 border border-green-800 shadow-sm p-8 flex items-center justify-center min-h-[220px] sm:min-h-[260px]">
            <Image
              src="/logo-cesizen.svg"
              alt="CESIZen"
              width={220}
              height={190}
              priority
              className="h-auto w-full max-w-[180px] sm:max-w-[200px]"
            />
          </div>

          {/* 2. Hero text — spans 2 cols on desktop */}
          <div className="lg:col-span-2 rounded-3xl bg-white border border-gray-100 shadow-sm p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 mb-4">
                ✓ Recommandé par des experts de santé
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
                Retrouvez votre{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 italic text-green-700">équilibre</span>
                  <span className="absolute bottom-1 left-0 right-0 h-3 bg-yellow-200/60 -z-0 rounded" />
                </span>{' '}
                intérieur.
              </h1>
              <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed max-w-lg">
                CESIZen vous accompagne chaque jour pour mieux comprendre vos émotions et cultiver votre bien-être mental.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 lg:flex-row">
              <Link href="/respiration"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3 text-sm font-semibold text-white hover:bg-green-800 transition-colors">
                Exercice de respiration →
              </Link>
              <Link href="/a-propos"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                À propos de CESIZen
              </Link>
            </div>
          </div>

          {/* 3+4. Feature cards — full width row, 2 cols */}
          <div className="sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            <Link href="/respiration"
              className="group rounded-3xl bg-gradient-to-br from-green-100 to-green-200 shadow-sm p-6 hover:shadow-lg transition-all flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-300/30 rounded-full -translate-y-10 translate-x-10" />
              <div className="relative">
                <h3 className="text-xl font-bold text-green-900">Exercices de respiration</h3>
                <p className="mt-2 text-sm text-green-800/70 flex-1">Cohérence cardiaque, relaxation et apaisement — laissez-vous guider par le souffle.</p>
                <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-green-900/15 px-4 py-2 text-sm font-semibold text-green-900 group-hover:bg-green-900/25 transition-colors">
                  Commencer →
                </span>
              </div>
            </Link>

            <Link href="/sante"
              className="group rounded-3xl bg-gradient-to-br from-red-50 to-red-100 shadow-sm p-6 hover:shadow-lg transition-all flex flex-col relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-28 h-28 bg-red-200/40 rounded-full translate-y-10 -translate-x-10" />
              <div className="relative">
                <h3 className="text-xl font-bold text-red-900">❤️ Informations santé</h3>
                <p className="mt-2 text-sm text-red-800/70 flex-1">Numéros d&apos;urgence, ressources professionnelles et informations essentielles sur la santé mentale.</p>
                <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-red-900/10 px-4 py-2 text-sm font-semibold text-red-900 group-hover:bg-red-900/20 transition-colors">
                  En savoir plus →
                </span>
              </div>
            </Link>
          </div>

          {/* 5. Conseil du jour — full width separator */}
          <div className="sm:col-span-2 lg:col-span-3 rounded-3xl bg-green-950 shadow-sm p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="text-4xl sm:text-5xl">🌿</div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-green-300 mb-1">Conseil du jour</p>
              <p className="text-white font-medium">Pratiquez la marche consciente</p>
              <p className="text-green-200 text-sm mt-1">Accordez-vous 10 minutes pour marcher sans distraction. Portez votre attention sur le rythme de votre respiration.</p>
            </div>
          </div>

          {/* 6+7. Articles + RGPD — full width row, 2 cols */}
          <div className="sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            <Link href="/articles"
              className="group rounded-3xl bg-white border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-yellow-200 transition-all flex flex-col">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-600 mb-4 group-hover:bg-yellow-200 transition-colors">
                <span className="material-symbols-rounded text-2xl">menu_book</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-yellow-700">Articles santé</h3>
              <p className="mt-2 text-sm text-gray-500 flex-1">Alimentation, sport, méditation — des articles validés par des experts.</p>
              <span className="mt-4 text-sm font-medium text-yellow-600 inline-flex items-center gap-1">Lire les articles →</span>
            </Link>

            <RgpdCard />
          </div>

        </div>
      </div>
    </div>
  );
}
