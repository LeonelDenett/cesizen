import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-green-950 text-white">
      {/* Main footer */}
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-5">
              <span className="text-3xl font-black tracking-tight">
                <span className="text-white">CESI</span>
                <span className="text-yellow-400">Zen</span>
              </span>
            </Link>
            <p className="text-sm text-green-200 leading-relaxed max-w-xs">
              Votre compagnon pour une vie sereine et équilibrée. Développé sous l&apos;autorité du Ministère de la Santé et de la Prévention.
            </p>
          </div>

          {/* Plateforme */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Plateforme</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/respiration" className="text-sm text-green-200 hover:text-yellow-400 transition-colors">
                  Exercices de respiration
                </Link>
              </li>
              <li>
                <Link href="/articles" className="text-sm text-green-200 hover:text-yellow-400 transition-colors">
                  Articles santé
                </Link>
              </li>
              <li>
                <Link href="/sante" className="text-sm text-green-200 hover:text-yellow-400 transition-colors">
                  Informations santé
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="text-sm text-green-200 hover:text-yellow-400 transition-colors">
                  À propos
                </Link>
              </li>
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Ressources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/sante" className="text-sm text-green-200 hover:text-yellow-400 transition-colors">
                  Numéros d&apos;urgence
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-green-200 hover:text-yellow-400 transition-colors">
                  Se connecter
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-green-200 hover:text-yellow-400 transition-colors">
                  Créer un compte
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="text-sm text-green-200 hover:text-yellow-400 transition-colors">Politique de confidentialité</Link>
              </li>
              <li>
                <Link href="/mentions-legales" className="text-sm text-green-200 hover:text-yellow-400 transition-colors">Mentions légales</Link>
              </li>
            </ul>
          </div>

          {/* Urgences — full width until desktop */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Urgences</h3>
            <div className="rounded-2xl bg-white/10 border border-white/10 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-black text-red-400">3114</p>
                  <p className="text-xs text-green-300">Prévention du suicide</p>
                </div>
                <span className="text-[10px] text-green-300 bg-green-800 rounded-full px-2 py-0.5">24h/24</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-white">15</p>
                  <p className="text-xs text-green-300">SAMU</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">112</p>
                  <p className="text-xs text-green-300">Urgences EU</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">114</p>
                  <p className="text-xs text-green-300">SMS urgences</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-green-900">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8 flex items-center justify-center">
          <p className="text-xs text-green-300 text-center">
            © 2025 CESIZen · Ministère de la Santé et de la Prévention · Tous droits réservés
          </p>
        </div>
      </div>
    </footer>
  );
}
