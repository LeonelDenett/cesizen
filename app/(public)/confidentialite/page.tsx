import Link from 'next/link';

export const metadata = { title: 'Politique de confidentialité — CESIZen' };

export default function ConfidentialitePage() {
  return (
    <div className="bg-gradient-to-br from-green-100 via-green-50 to-yellow-50/50 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-green-700 mb-6">
          ← Retour à l&apos;accueil
        </Link>
        <div className="rounded-3xl bg-white/70 backdrop-blur border border-white/80 shadow-sm p-6 sm:p-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Politique de confidentialité</h1>
          <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : 1er janvier 2025</p>

          <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">1. Responsable du traitement</h2>
              <p>Le responsable du traitement des données personnelles est CESIZen, plateforme développée sous l&apos;autorité du Ministère de la Santé et de la Prévention, 14 avenue Duquesne, 75350 Paris 07 SP.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">2. Données collectées</h2>
              <p>Nous collectons uniquement les données strictement nécessaires au fonctionnement du service :</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Données d&apos;identification : nom, adresse email</li>
                <li>Données de connexion : mot de passe (hashé, jamais stocké en clair)</li>
                <li>Données émotionnelles : entrées du tracker (émotion, date, note)</li>
                <li>Données techniques : logs de connexion, adresse IP (anonymisée après 30 jours)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">3. Finalités du traitement</h2>
              <p>Vos données sont traitées pour les finalités suivantes :</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Gestion de votre compte utilisateur</li>
                <li>Fonctionnement du tracker d&apos;émotions et génération de rapports personnalisés</li>
                <li>Sécurité de la plateforme et prévention des abus</li>
                <li>Amélioration du service (statistiques anonymisées)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">4. Base légale</h2>
              <p>Le traitement de vos données repose sur votre consentement (article 6.1.a du RGPD) lors de la création de votre compte, et sur l&apos;exécution du contrat de service (article 6.1.b) pour le fonctionnement de la plateforme.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">5. Durée de conservation</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Données de compte : conservées tant que le compte est actif, supprimées dans les 30 jours suivant la suppression du compte</li>
                <li>Données émotionnelles : conservées tant que le compte est actif, supprimées en cascade avec le compte</li>
                <li>Logs de connexion : 12 mois maximum</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">6. Vos droits</h2>
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Droit d&apos;accès</strong> : obtenir une copie de vos données personnelles</li>
                <li><strong>Droit de rectification</strong> : corriger vos données inexactes</li>
                <li><strong>Droit à l&apos;effacement</strong> : supprimer votre compte et toutes vos données</li>
                <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
                <li><strong>Droit d&apos;opposition</strong> : vous opposer au traitement de vos données</li>
              </ul>
              <p className="mt-3">Pour exercer ces droits, contactez-nous à <strong>dpo@cesizen.fr</strong>.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">7. Sécurité</h2>
              <p>Nous mettons en œuvre les mesures techniques et organisationnelles appropriées pour protéger vos données :</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Chiffrement HTTPS de toutes les communications</li>
                <li>Hashage bcrypt des mots de passe (coût minimum 10)</li>
                <li>Hébergement sur des serveurs situés dans l&apos;Union Européenne</li>
                <li>Isolation des données entre utilisateurs</li>
                <li>Tokens de session avec expiration automatique</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">8. Cookies</h2>
              <p>CESIZen utilise uniquement des cookies strictement nécessaires au fonctionnement du service (cookie de session d&apos;authentification). Aucun cookie publicitaire ou de tracking n&apos;est utilisé.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">9. Contact</h2>
              <p>Pour toute question relative à la protection de vos données, vous pouvez contacter notre Délégué à la Protection des Données à l&apos;adresse <strong>dpo@cesizen.fr</strong> ou par courrier au Ministère de la Santé et de la Prévention, 14 avenue Duquesne, 75350 Paris 07 SP.</p>
              <p className="mt-2">Vous pouvez également introduire une réclamation auprès de la CNIL (Commission Nationale de l&apos;Informatique et des Libertés) sur <strong>www.cnil.fr</strong>.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
