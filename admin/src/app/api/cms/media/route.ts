import { NextRequest, NextResponse } from 'next/server';
import { getAdminToken, getStaffUser } from '@/lib/auth';
import { uploadCmsMediaFile } from '@/lib/cms-content-api';

/** Client upload proxy → CMS /api/media (supports XHR progress on the browser → admin hop). */
export async function POST(req: NextRequest) {
  const staff = await getStaffUser(['admin', 'shop_ops', 'content_ops']);
  if (!staff) {
    return NextResponse.json({ error: '未登录或无权限' }, { status: 401 });
  }
  const token = await getAdminToken();
  if (!token) {
    return NextResponse.json({ error: '未登录或无权限' }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: '请选择文件' }, { status: 400 });
    }
    const alt = String(form.get('alt') ?? '').trim() || file.name;
    const uploaded = await uploadCmsMediaFile(file, alt, token);
    return NextResponse.json({
      id: uploaded.id,
      publicUrl: uploaded.publicUrl,
    });
  } catch (err) {
    console.error('[admin/api/cms/media]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '上传失败' },
      { status: 502 },
    );
  }
}
