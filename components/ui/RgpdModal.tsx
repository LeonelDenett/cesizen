'use client';

import { useState } from 'react';

export default function RgpdCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-3xl bg-yellow-400/80 shadow-sm p-6 flex flex-col items-center justify-center text-center hover:bg-yellow-400 transition-colors cursor-pointer"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-yellow-900/70">Conformité</p>
        <p className="text-4xl font-bold text-yellow-900 mt-1">RGPD</p>
        <p className="text-sm text-yellow-900/70 mt-1">Données sécurisées &amp; confidentielles</p>
        <span className="mt-3 text-xs text-yellow-800 underline">En savoir plus →</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-8 shadow-xl">
            <button type="button" onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Fermer">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                <span className="text-2xl">🔒</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Conformité RGPD</h2>
                <p className="text-sm text-gray-500">Protection de vos données personnelles</p>
              </div>
            </div>

            <div className="space-y-5 text-sm text-gray-700 leading-relaxed">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Qu&apos;est-ce que le RGPD ?</h3>
                <p>
                  Le Règlement Général sur la Protection des Données (RGPD) est la réglementation européenne
                  qui encadre le traitement des données personnelles. Il garantit vos droits fondamentaux
                  en matière de vie privée et de protection des données.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-1">Comment CESIZen protège vos données ?</h3>
                <ul className="space-y-2 mt-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span><strong>Chiffrement</strong> — Toutes les communications sont chiffrées via HTTPS. Vos mots de passe sont hashés avec bcrypt.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span><strong>Hébergement UE</strong> — Vos données sont stockées exclusivement sur des serveurs situés dans l&apos;Union Européenne.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span><strong>Minimisation</strong> — Nous ne collectons que les données strictement nécessaires au fonctionnement du service.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span><strong>Droit à l&apos;oubli</strong> — Vous pouvez supprimer votre compte et toutes vos données à tout moment.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span><strong>Isolation</strong> — Vos données émotionnelles sont strictement privées. Aucun autre utilisateur ne peut y accéder.</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-1">Vos droits</h3>
                <p>
                  Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression
                  et de portabilité de vos données. Pour exercer ces droits, contactez-nous à
                  <span className="text-green-700 font-medium"> contact@cesizen.fr</span>.
                </p>
              </div>

              <div className="rounded-xl bg-green-50 border border-green-100 p-4">
                <p className="text-xs text-green-800">
                  🛡️ CESIZen est développé sous l&apos;autorité du Ministère de la Santé et de la Prévention.
                  La protection de vos données de santé mentale est notre priorité absolue.
                </p>
              </div>
            </div>

            <button type="button" onClick={() => setOpen(false)}
              className="mt-6 w-full rounded-xl bg-green-700 py-3 text-sm font-semibold text-white hover:bg-green-800 transition-colors">
              J&apos;ai compris
            </button>
          </div>
        </div>
      )}
    </>
  );
}
