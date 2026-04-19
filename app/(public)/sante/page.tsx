import Link from 'next/link';

export const metadata = { title: 'Informations Santé — CESIZen' };

const NUMEROS = [
  { numero: '3114', label: 'Prévention du suicide', desc: '24h/24, gratuit', color: 'bg-red-50 border-red-200 text-red-700' },
  { numero: '15', label: 'SAMU', desc: 'Urgences médicales', color: 'bg-red-50 border-red-200 text-red-700' },
  { numero: '112', label: 'Urgences européen', desc: 'Universel en Europe', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { numero: '0 800 130 000', label: 'Fil Santé Jeunes', desc: 'Anonyme, 12-25 ans', color: 'bg-green-50 border-green-200 text-green-700' },
  { numero: '01 45 39 40 00', label: 'Suicide Écoute', desc: '24h/24, bénévoles', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { numero: '0 800 05 95 95', label: 'SOS Amitié', desc: 'Écoute et soutien', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
];

export default function SantePage() {
  return (
    <div className="bg-gradient-to-br from-green-100 via-green-50 to-yellow-50/50 min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:py-5 lg:py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">

          {/* Hero — spans full on mobile, 2 on tablet, 3 on desktop */}
          <div className="sm:col-span-2 lg:col-span-3 rounded-3xl bg-white/70 backdrop-blur border border-white/80 shadow-sm p-6 sm:p-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-1.5 text-xs font-semibold text-red-700 mb-4">❤️ Santé mentale</div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Votre santé mentale <span className="italic text-green-700">compte</span>
            </h1>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              La santé mentale est un état de bien-être essentiel. Elle est tout aussi importante que la santé physique.
            </p>
          </div>

          {/* Numéros d'urgence — 6 cards */}
          {NUMEROS.map((n) => (
            <div key={n.numero} className={`rounded-3xl border p-5 ${n.color}`}>
              <p className="text-2xl font-bold">{n.numero}</p>
              <p className="text-sm font-semibold mt-1">{n.label}</p>
              <p className="text-xs mt-1 opacity-70">{n.desc}</p>
            </div>
          ))}

          {/* Comprendre cards */}
          <div className="rounded-3xl bg-green-50 border border-green-100 p-6">
            <h3 className="font-bold text-gray-900 mb-2">Pas juste &ldquo;ne pas être malade&rdquo;</h3>
            <p className="text-sm text-gray-600">La santé mentale englobe notre bien-être émotionnel, psychologique et social.</p>
          </div>
          <div className="rounded-3xl bg-yellow-50 border border-yellow-100 p-6">
            <h3 className="font-bold text-gray-900 mb-2">1 personne sur 5</h3>
            <p className="text-sm text-gray-600">Selon l&apos;OMS, une personne sur cinq souffrira d&apos;un trouble mental au cours de sa vie.</p>
          </div>
          <div className="rounded-3xl bg-blue-50 border border-blue-100 p-6">
            <h3 className="font-bold text-gray-900 mb-2">Les piliers du bien-être</h3>
            <p className="text-sm text-gray-600">Sommeil, alimentation, activité physique, liens sociaux, gestion du stress.</p>
          </div>

          {/* Ressources — spans 2 */}
          <div className="sm:col-span-2 rounded-3xl bg-white/70 backdrop-blur border border-white/80 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">🔗 Ressources utiles</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="font-semibold text-gray-900 text-sm">Psycom.org</p>
                <p className="text-xs text-gray-500 mt-1">Information publique sur la santé mentale.</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="font-semibold text-gray-900 text-sm">Santé publique France</p>
                <p className="text-xs text-gray-500 mt-1">Données et campagnes de prévention.</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="font-semibold text-gray-900 text-sm">Mon soutien psy</p>
                <p className="text-xs text-gray-500 mt-1">8 séances remboursées par l&apos;Assurance Maladie.</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="font-semibold text-gray-900 text-sm">Ministère de la Santé</p>
                <p className="text-xs text-gray-500 mt-1">Politiques publiques et actualités.</p>
              </div>
            </div>
          </div>

          {/* CTA articles */}
          <div className="rounded-3xl bg-green-800 shadow-sm p-6 flex flex-col items-center justify-center text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-green-300 mb-2">Approfondir</p>
            <p className="text-white font-medium mb-4">Découvrez nos articles détaillés</p>
            <Link href="/articles" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-green-800 hover:bg-green-50 transition-colors">
              Voir les articles →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
