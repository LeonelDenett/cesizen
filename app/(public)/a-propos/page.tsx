import Link from 'next/link';
import Image from 'next/image';

export const metadata = { title: 'À propos — CESIZen' };

export default function AProposPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero — dark green full width */}
      <section className="bg-green-950 text-white px-4 py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <Image src="/logo-cesizen.svg" alt="CESIZen" width={180} height={150} className="mx-auto mb-8" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Votre bien-être,{' '}
            <span className="text-yellow-400">notre priorité</span>
          </h1>
          <p className="mt-6 text-lg text-green-200 max-w-2xl mx-auto leading-relaxed">
            CESIZen est une plateforme web dédiée à la santé mentale, développée sous l&apos;autorité du Ministère de la Santé et de la Prévention pour le grand public français.
          </p>
        </div>
      </section>

      {/* Pourquoi CESIZen */}
      <section className="px-4 py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-green-600 mb-3">Pourquoi CESIZen ?</p>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                1 personne sur 5 souffrira d&apos;un trouble mental au cours de sa vie
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Face à ce constat, nous avons créé CESIZen : un outil gratuit, accessible et scientifiquement fondé pour aider chacun à mieux comprendre ses émotions et prendre soin de sa santé mentale au quotidien.
              </p>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Notre approche combine le suivi émotionnel personnalisé, des ressources éducatives validées par des professionnels, et des outils de visualisation pour identifier vos tendances émotionnelles.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-green-50 p-6 text-center">
                <p className="text-3xl font-black text-green-700">3</p>
                <p className="text-sm text-gray-600 mt-1">Modules complets</p>
              </div>
              <div className="rounded-2xl bg-yellow-50 p-6 text-center">
                <p className="text-3xl font-black text-yellow-600">6</p>
                <p className="text-sm text-gray-600 mt-1">Émotions de base</p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-6 text-center">
                <p className="text-3xl font-black text-blue-600">36</p>
                <p className="text-sm text-gray-600 mt-1">Nuances émotionnelles</p>
              </div>
              <div className="rounded-2xl bg-red-50 p-6 text-center">
                <p className="text-3xl font-black text-red-600">100%</p>
                <p className="text-sm text-gray-600 mt-1">Gratuit et confidentiel</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ce que nous offrons */}
      <section className="px-4 py-16 sm:py-20 bg-gray-50">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-green-600 mb-3 text-center">Nos outils</p>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Ce que CESIZen vous offre</h2>

          <div className="space-y-6">
            {/* Tracker */}
            <div className="flex flex-col sm:flex-row gap-6 items-start rounded-2xl bg-white border border-gray-100 p-6 sm:p-8">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-2xl">😊</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Tracker d&apos;émotions</h3>
                <p className="mt-2 text-gray-600 leading-relaxed">
                  Enregistrez vos émotions grâce à un système à deux niveaux : choisissez d&apos;abord une émotion de base (Joie, Colère, Peur, Tristesse, Surprise, Dégoût), puis précisez avec une nuance. Ajoutez une note personnelle et suivez votre journal de bord au fil du temps.
                </p>
              </div>
            </div>

            {/* Rapports */}
            <div className="flex flex-col sm:flex-row gap-6 items-start rounded-2xl bg-white border border-gray-100 p-6 sm:p-8">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-2xl">📊</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Rapports personnalisés</h3>
                <p className="mt-2 text-gray-600 leading-relaxed">
                  Visualisez la distribution de vos émotions par semaine, mois, trimestre ou année. Identifiez vos tendances dominantes, découvrez les nuances les plus fréquentes et suivez votre évolution émotionnelle dans le temps.
                </p>
              </div>
            </div>

            {/* Articles */}
            <div className="flex flex-col sm:flex-row gap-6 items-start rounded-2xl bg-white border border-gray-100 p-6 sm:p-8">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl">📚</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Articles de santé</h3>
                <p className="mt-2 text-gray-600 leading-relaxed">
                  Accédez à une bibliothèque d&apos;articles détaillés sur l&apos;alimentation, le sport, la méditation et la gestion du stress. Chaque article est rédigé avec des sources scientifiques et des conseils pratiques applicables immédiatement.
                </p>
              </div>
            </div>

            {/* Santé */}
            <div className="flex flex-col sm:flex-row gap-6 items-start rounded-2xl bg-white border border-gray-100 p-6 sm:p-8">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-2xl">❤️</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Informations santé</h3>
                <p className="mt-2 text-gray-600 leading-relaxed">
                  Retrouvez les numéros d&apos;urgence (3114, 15, 112), les ressources professionnelles et les informations essentielles sur la santé mentale. Parce que demander de l&apos;aide est un acte de courage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-green-600 mb-3 text-center">Ce qui nous guide</p>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Nos valeurs</h2>

          <div className="grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl mb-4">🌱</div>
              <h3 className="text-lg font-bold text-gray-900">Accessibilité</h3>
              <p className="mt-2 text-sm text-gray-600">Des outils simples, gratuits et pour tous. Aucune barrière technique, aucun abonnement.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-3xl mb-4">🤝</div>
              <h3 className="text-lg font-bold text-gray-900">Bienveillance</h3>
              <p className="mt-2 text-sm text-gray-600">Un espace sans jugement pour explorer, comprendre et accepter vos émotions.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl mb-4">🛡️</div>
              <h3 className="text-lg font-bold text-gray-900">Confiance</h3>
              <p className="mt-2 text-sm text-gray-600">Transparence totale. Vos données sont chiffrées, hébergées en UE et conformes au RGPD.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 sm:py-20 bg-green-950">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Prêt(e) à prendre soin de vous ?</h2>
          <p className="text-green-200 mb-8 max-w-lg mx-auto">Créez votre compte gratuitement et commencez à suivre vos émotions dès aujourd&apos;hui.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="inline-flex items-center justify-center rounded-xl bg-yellow-400 px-8 py-3.5 text-sm font-bold text-green-950 hover:bg-yellow-300 transition-colors">
              Créer un compte gratuit →
            </Link>
            <Link href="/respiration" className="inline-flex items-center justify-center rounded-xl border border-green-400 px-8 py-3.5 text-sm font-semibold text-white hover:bg-green-900 transition-colors">
              Exercices de respiration
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
