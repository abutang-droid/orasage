import { getAdminUser, loginUrl } from '@/lib/auth';
import { getShippingZones } from '@/lib/api';
import { redirect } from 'next/navigation';
import { ShippingZonesEditor } from '@/components/ShippingZonesEditor';

export default async function ShopShippingPage() {
  const admin = await getAdminUser();
  if (!admin) redirect(loginUrl());

  let zones: Awaited<ReturnType<typeof getShippingZones>>['zones'] = [];
  try {
    ({ zones } = await getShippingZones());
  } catch (err) {
    console.error('[admin/shop/shipping]', err);
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>运费模板</h1>
        <p className="muted">
          按国家/区域配置基础运费与重量阶梯。shop 结账页与 auth-service 运费估算 API 均读取此处配置；
          未配置时回退至代码内置默认值。
        </p>
      </header>

      <section className="panel">
        <ShippingZonesEditor zones={zones} />
      </section>
    </div>
  );
}
