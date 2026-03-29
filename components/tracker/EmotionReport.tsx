'use client';

import { formatDateFR } from '@/lib/utils';

const EMOTION_COLORS: Record<string, { bg: string; text: string }> = {
  Joie: { bg: 'bg-green-500', text: 'text-green-700' },
  Colère: { bg: 'bg-red-500', text: 'text-red-700' },
  Peur: { bg: 'bg-purple-500', text: 'text-purple-700' },
  Tristesse: { bg: 'bg-blue-500', text: 'text-blue-700' },
  Surprise: { bg: 'bg-yellow-400', text: 'text-yellow-700' },
  Dégoût: { bg: 'bg-gray-400', text: 'text-gray-700' },
};

function getColor(name: string) {
  return EMOTION_COLORS[name] ?? { bg: 'bg-gray-300', text: 'text-gray-600' };
}

interface TopLevel2 {
  id: string;
  name: string;
  count: number;
}

interface EmotionLevel1Data {
  id: string;
  name: string;
  count: number;
  topLevel2: TopLevel2 | null;
}

interface DistributionItem {
  emotionLevel1: EmotionLevel1Data;
}

export interface ReportData {
  period: string;
  startDate: string;
  endDate: string;
  distribution: DistributionItem[];
  totalEntries: number;
  message?: string;
}

interface EmotionReportProps {
  report: ReportData;
}

export default function EmotionReport({ report }: EmotionReportProps) {
  if (report.totalEntries === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">Aucune donnée disponible pour cette période.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary header */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-sm text-gray-500">
            Du{' '}
            <span className="font-medium text-gray-900">
              {formatDateFR(new Date(report.startDate))}
            </span>{' '}
            au{' '}
            <span className="font-medium text-gray-900">
              {formatDateFR(new Date(report.endDate))}
            </span>
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-medium text-gray-900">{report.totalEntries}</span>{' '}
            {report.totalEntries === 1 ? 'entrée' : 'entrées'}
          </p>
        </div>
      </div>

      {/* Distribution bars */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Distribution des émotions</h2>
        <div className="space-y-4">
          {report.distribution.map(({ emotionLevel1 }) => {
            const color = getColor(emotionLevel1.name);
            const pct = Math.round((emotionLevel1.count / report.totalEntries) * 100);

            return (
              <div key={emotionLevel1.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className={`font-medium ${color.text}`}>{emotionLevel1.name}</span>
                  <span className="text-gray-500">
                    {emotionLevel1.count} ({pct}%)
                  </span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${color.bg} transition-all duration-300`}
                    style={{ width: `${pct}%` }}
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${emotionLevel1.name}: ${pct}%`}
                  />
                </div>
                {emotionLevel1.topLevel2 && (
                  <p className="text-xs text-gray-400">
                    Émotion la plus fréquente :{' '}
                    <span className="font-medium text-gray-600">
                      {emotionLevel1.topLevel2.name}
                    </span>{' '}
                    ({emotionLevel1.topLevel2.count})
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
