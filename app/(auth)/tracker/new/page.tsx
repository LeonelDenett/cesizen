'use client';

import EmotionEntryForm from '@/components/tracker/EmotionEntryForm';

export default function NewEntryPage() {
  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Nouvelle entrée
        </h1>
        <EmotionEntryForm mode="create" />
      </div>
    </section>
  );
}
