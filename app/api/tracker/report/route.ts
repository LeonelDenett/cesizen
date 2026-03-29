import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { getEmotionReport } from '@/lib/actions/tracker';

const VALID_PERIODS = ['week', 'month', 'quarter', 'year'] as const;
type Period = (typeof VALID_PERIODS)[number];

function isValidPeriod(value: string): value is Period {
  return VALID_PERIODS.includes(value as Period);
}

// GET: Emotion report by period
export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return Response.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const periodParam = searchParams.get('period') || 'month';

  if (!isValidPeriod(periodParam)) {
    return Response.json(
      { error: 'Période invalide. Valeurs acceptées : week, month, quarter, year.' },
      { status: 400 }
    );
  }

  const report = await getEmotionReport(currentUser.id, periodParam);

  if (report.totalEntries === 0) {
    return Response.json({
      ...report,
      message: 'Aucune donnée disponible pour cette période.',
    });
  }

  return Response.json(report);
}
