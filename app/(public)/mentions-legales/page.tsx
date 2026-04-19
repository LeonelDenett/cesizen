import Link from 'next/link';

export const metadata = { title: 'Mentions légales — CESIZen' };

export default function MentionsLegalesPage() {
  return (
    <div className="bg-gradient-to-br from-green-100 via-green-50 to-yellow-50/50 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-green-700 mb-6">
          ← Retour à l&apos;accueil
        </Link>
        <div className="rounded-3xl bg-white/70 backdrop-blur border border-white/80 shadow-sm p-6 sm:p-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Mentions légales</h1>

          <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">1. Éditeur du site</h2>
              <p>Le site CESIZen est édité par :</p>
              <ul className="mt-2 space-y-1">
                <li><strong>Raison sociale</strong> : Ministère de la Santé et de la Prévention</li>
                <li><strong>Adresse</strong> : 14 avenue Duquesne, 75350 Paris 07 SP</li>
                <li><strong>Téléphone</strong> : 01 40 56 60 00</li>
                <li><strong>Email</strong> : contact@cesizen.fr</li>
                <li><strong>Directeur de la publication</strong> : Le Ministre de la Santé</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">2. Hébergement</h2>
              <ul className="space-y-1">
                <li><strong>Hébergeur</strong> : OVHcloud</li>
                <li><strong>Adresse</strong> : 2 rue Kellermann, 59100 Roubaix, France</li>
                <li><strong>Téléphone</strong> : 1007</li>
              </ul>
              <p className="mt-2">Les données sont hébergées exclusivement sur des serveurs situés dans l&apos;Union Européenne, conformément au RGPD.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">3. Propriété intellectuelle</h2>
              <p>L&apos;ensemble des contenus présents sur le site CESIZen (textes, images, graphismes, logo, icônes, logiciels) est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.</p>
              <p className="mt-2">Toute reproduction, représentation, modification ou exploitation non autorisée de tout ou partie du site est interdite et constitue une contrefaçon sanctionnée par les articles L.335-2 et suivants du Code de la propriété intellectuelle.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">4. Responsabilité</h2>
              <p>CESIZen est un outil d&apos;aide au suivi émotionnel et ne constitue en aucun cas un dispositif médical, un diagnostic ou un traitement. Les informations fournies sur le site sont à caractère informatif et éducatif.</p>
              <p className="mt-2">En cas de détresse psychologique, nous vous invitons à contacter le <strong>3114</strong> (numéro national de prévention du suicide, 24h/24) ou à consulter un professionnel de santé.</p>
              <p className="mt-2">L&apos;éditeur ne saurait être tenu responsable des dommages directs ou indirects résultant de l&apos;utilisation du site.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">5. Données personnelles</h2>
              <p>Le traitement des données personnelles est détaillé dans notre <Link href="/confidentialite" className="text-green-700 font-semibold hover:underline">Politique de confidentialité</Link>.</p>
              <p className="mt-2">Conformément à la loi « Informatique et Libertés » du 6 janvier 1978 modifiée et au Règlement Général sur la Protection des Données (RGPD), vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et de portabilité de vos données.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">6. Cookies</h2>
              <p>Le site utilise uniquement des cookies techniques strictement nécessaires au fonctionnement du service d&apos;authentification. Aucun cookie publicitaire, analytique ou de profilage n&apos;est déposé.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">7. Accessibilité</h2>
              <p>CESIZen s&apos;engage à rendre son site accessible conformément à l&apos;article 47 de la loi n°2005-102 du 11 février 2005. Le site utilise des balises sémantiques HTML, des attributs ARIA, une navigation au clavier et un ratio de contraste minimum de 4.5:1.</p>
              <p className="mt-2">Si vous rencontrez un défaut d&apos;accessibilité, contactez-nous à <strong>accessibilite@cesizen.fr</strong>.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">8. Droit applicable</h2>
              <p>Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux français seront seuls compétents.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">9. Crédits</h2>
              <ul className="space-y-1">
                <li><strong>Conception et développement</strong> : Équipe CESIZen</li>
                <li><strong>Photographies</strong> : Unsplash (licence libre)</li>
                <li><strong>Icônes</strong> : Lucide Icons (licence MIT)</li>
                <li><strong>Framework</strong> : Next.js, Tailwind CSS, Drizzle ORM</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
