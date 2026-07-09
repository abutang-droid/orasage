'use client';

import { deleteProductAction } from '@/app/actions';
import { AdminSubmitButton } from './AdminButton';

type ProductDeletePanelProps = {
  sku: string;
  name: string;
  active: boolean;
};

export function ProductDeletePanel({ sku, name, active }: ProductDeletePanelProps) {
  return (
    <div className="product-delete-panel">
      <p className="muted">
        下架后商品将从商城目录与计费推荐中隐藏，历史订单数据保留。当前状态：
        <strong>{active ? ' 上架中' : ' 已下架'}</strong>
      </p>
      <form action={deleteProductAction} className="product-delete-form">
        <input type="hidden" name="sku" value={sku} />
        <label className="checkbox-label product-delete-confirm">
          <input type="checkbox" name="confirm" required />
          确认下架商品「{name}」（{sku}）
        </label>
        <AdminSubmitButton variant="destructive" size="sm">
          下架商品
        </AdminSubmitButton>
      </form>
    </div>
  );
}
