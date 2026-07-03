import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

/** report-job 运行时写入 public/reports/；Next 静态目录需重启才生效，此路由保证即写即读 */
const SAFE_FILENAME = /^report_[\w-]+\.html$/;

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ filename: string }> },
) {
  const { filename } = await ctx.params;
  if (!SAFE_FILENAME.test(filename)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const filePath = path.join(process.cwd(), 'public', 'reports', filename);
  try {
    const html = await fs.readFile(filePath, 'utf-8');
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
