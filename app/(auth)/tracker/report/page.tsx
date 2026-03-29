'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import PeriodSelector, { type Period } from '@/components/tracker/PeriodSelector';
import EmotionReport, { type ReportData } from '@/components/tracker/EmotionReport';

export default function ReportPage() {
  const [period, setPeriod] = useState<Period>('month');
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async (p: Period) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tracker/report?period=${p}`);
      if (res.ok) {
        const data: ReportData = await res.json();
        setReport(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport(period);
  }, [period, fetchReport]);

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Rapport d&apos;émotions</h1>
          <Link
            href="/tracker"
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Retour au journal
          </Link>
        </div>

        <div className="mb-6">
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <p className="text-sm text-gray-500">Chargement...</p>
          </div>
        ) : report ? (
          <EmotionReport report={report} />
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-500">Impossible de charger le rapport.</p>
          </div>
        )}
      </div>
    </section>
  );
}
