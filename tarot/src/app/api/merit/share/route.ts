import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { MERIT_SHARE_PATH_ENABLED } from '@/lib/merit';
import { isMeritAwarded, recordShareClick } from '@/lib/merit-service';

/** POST /api/merit/share — 记录分享点击 (+1 功德，日上限 5)；传播路暂停时 no-op */
export async function POST() {
  if (!MERIT_SHARE_PATH_ENABLED) {
    return NextResponse.json({ awarded: 0, disabled: true });
  }
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const result = await recordShareClick(auth.userId);
  if (!result.ok) {
    return NextResponse.json({ error: result.reason, awarded: 0 }, { status: 400 });
  }
  if (!isMeritAwarded(result)) {
    return NextResponse.json({ awarded: 0, duplicate: true });
  }
  return NextResponse.json({
    awarded: result.awarded,
    levelUp: result.levelUp,
  });
}
