'use client';

import { useState } from 'react';
import BreathingExercise from '@/components/respiration/BreathingExercise';

const BASIC_EXERCISES = [
  { id: '748', name: '7-4-8 Relaxation', desc: 'Idéal pour l\'endormissement et la gestion de l\'anxiété. L\'expiration longue active le système parasympathique.', inspire: 7, hold: 4, expire: 8, color: 'from-green-400 to-green-600', benefit: 'Réduit l\'anxiété en 4 cycles' },
  { id: '55', name: '5-5 Cohérence cardiaque', desc: 'L\'exercice de référence. 6 respirations par minute pendant 5 minutes = 4 à 6h de réduction du cortisol.', inspire: 5, hold: 0, expire: 5, color: 'from-green-500 to-emerald-600', benefit: 'Équilibre le système nerveux' },
  { id: '46', name: '4-6 Apaisement rapide', desc: 'Expiration plus longue que l\'inspiration pour un effet calmant immédiat. Parfait en situation de stress.', inspire: 4, hold: 0, expire: 6, color: 'from-emerald-400 to-green-600', benefit: 'Calme en 2 minutes' },
];

const ADVANCED_EXERCISES = [
  { id: '478', name: '4-7-8 Profonde', desc: 'Technique du Dr. Andrew Weil. La rétention longue augmente le CO2 sanguin, calmant puissamment le système nerveux.', inspire: 4, hold: 7, expire: 8, color: 'from-green-600 to-green-800', benefit: 'Endormissement rapide' },
  { id: '363', name: '3-6-3 Équilibre', desc: 'Inspiration courte, expiration double. Idéal pour les débutants qui trouvent les exercices longs difficiles.', inspire: 3, hold: 6, expire: 3, color: 'from-green-500 to-green-700', benefit: 'Accessible aux débutants' },
  { id: '5510', name: '5-5-10 Relaxation profonde', desc: 'Expiration très longue pour une relaxation maximale. Recommandé pour les praticiens expérimentés.', inspire: 5, hold: 5, expire: 10, color: 'from-green-700 to-green-900', benefit: 'Relaxation maximale' },
];

export default function RespirationPage() {
  const [selected, setSelected] = useState<typeof BASIC_EXERCISES[0] | null>(null);

  if (selected) {
    return <BreathingExercise exercise={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="bg-gradient-to-br from-green-200 via-green-100 to-green-950/10 flex-1">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:py-5 lg:py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">

          {/* Hero */}
          <div className="sm:col-span-2 lg:col-span-3 rounded-3xl bg-green-950 p-8 sm:p-12 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Exercices de respiration</h1>
            <p className="text-green-200 max-w-xl mx-auto">
              La respiration consciente est l&apos;outil le plus puissant pour gérer votre stress. Choisissez un exercice, appuyez sur le cercle et laissez-vous guider.
            </p>
          </div>

          {/* Section: Exercices de base */}
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-green-700 mb-3 px-1">Exercices de base</p>
          </div>

          {BASIC_EXERCISES.map(ex => (
            <button key={ex.id} type="button" onClick={() => setSelected(ex)}
              className="group rounded-3xl bg-white border border-gray-100 shadow-sm p-6 text-left hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${ex.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <span className="text-white text-lg font-bold">{ex.id}</span>
                </div>
                <span className="text-xs text-green-600 bg-green-50 rounded-full px-3 py-1 font-medium">{ex.benefit}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">{ex.name}</h3>
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">{ex.desc}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                <span>⬆ {ex.inspire}s</span>
                {ex.hold > 0 && <><span>·</span><span>⏸ {ex.hold}s</span></>}
                <span>·</span><span>⬇ {ex.expire}s</span>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-green-600 group-hover:gap-2 transition-all">
                Commencer →
              </span>
            </button>
          ))}

          {/* Section: Exercices avancés */}
          <div className="sm:col-span-2 lg:col-span-3 mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-green-700 mb-3 px-1">Exercices avancés</p>
          </div>

          {ADVANCED_EXERCISES.map(ex => (
            <button key={ex.id} type="button" onClick={() => setSelected(ex)}
              className="group rounded-3xl bg-white border border-gray-100 shadow-sm p-6 text-left hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${ex.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <span className="text-white text-sm font-bold">{ex.id}</span>
                </div>
                <span className="text-xs text-yellow-700 bg-yellow-50 rounded-full px-3 py-1 font-medium">{ex.benefit}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">{ex.name}</h3>
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">{ex.desc}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                <span>⬆ {ex.inspire}s</span>
                {ex.hold > 0 && <><span>·</span><span>⏸ {ex.hold}s</span></>}
                <span>·</span><span>⬇ {ex.expire}s</span>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-green-600 group-hover:gap-2 transition-all">
                Commencer →
              </span>
            </button>
          ))}

          {/* Pourquoi la respiration */}
          <div className="sm:col-span-2 lg:col-span-3 rounded-3xl bg-white border border-gray-100 shadow-sm p-6 sm:p-8 mt-4">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Pourquoi la respiration consciente ?</h2>
            <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-green-50 p-5">
                <p className="text-2xl mb-2">🧠</p>
                <h3 className="font-bold text-gray-900 text-sm">Réduit le cortisol</h3>
                <p className="text-xs text-gray-500 mt-1">5 min de cohérence cardiaque réduisent le cortisol pendant 4 à 6 heures.</p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-5">
                <p className="text-2xl mb-2">❤️</p>
                <h3 className="font-bold text-gray-900 text-sm">Régule le cœur</h3>
                <p className="text-xs text-gray-500 mt-1">Améliore la variabilité cardiaque, marqueur clé de résilience au stress.</p>
              </div>
              <div className="rounded-2xl bg-purple-50 p-5">
                <p className="text-2xl mb-2">😴</p>
                <h3 className="font-bold text-gray-900 text-sm">Améliore le sommeil</h3>
                <p className="text-xs text-gray-500 mt-1">La technique 4-7-8 est recommandée par les médecins pour l&apos;insomnie.</p>
              </div>
              <div className="rounded-2xl bg-yellow-50 p-5">
                <p className="text-2xl mb-2">⚡</p>
                <h3 className="font-bold text-gray-900 text-sm">Effet immédiat</h3>
                <p className="text-xs text-gray-500 mt-1">Contrairement aux médicaments, les effets sont ressentis dès la première séance.</p>
              </div>
            </div>
          </div>

          {/* Conseil */}
          <div className="sm:col-span-2 lg:col-span-3 rounded-3xl bg-green-950 p-6 flex flex-col sm:flex-row items-center gap-5 sm:gap-6 sm:gap-6">
            <div className="text-4xl sm:text-5xl">💡</div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-green-400 mb-1">Conseil de pratique</p>
              <p className="text-white font-medium">Pratiquez 3 fois par jour : matin, midi et soir</p>
              <p className="text-green-200 text-sm mt-1">Le protocole 365 (3 fois/jour, 6 respirations/min, 5 minutes) est le plus étudié scientifiquement pour ses bienfaits durables.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
