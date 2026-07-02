import { NextRequest, NextResponse } from 'next/server';
import { isLocalIp, runReportJob, type ReportJobInput } from '@/lib/reportJob';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-real-ip') ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (!isLocalIp(ip)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  try {
    const body = (await req.json()) as ReportJobInput;
    if (!body.orderNo || !body.userId || !body.readingId) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 });
    }
    const result = await runReportJob(body);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[report-job]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'report job failed' },
      { status: 500 },
    );
  }
}
