'use client';

import { deleteProductAction } from '@/app/actions';
import { AdminSubmitButton } from './AdminButton';

type ProductDeletePanelProps = {
  sku: string;
  name: string;
  active: boolean;
  /** 无计费引用、无订单、非其它组合子件时可永久删除 */
  canHardDelete?: boolean;
  hardDeleteBlockedReason?: string | null;
};

export function ProductDeletePanel({
  sku,
  name,
  active,
  canHardDelete = false,
  hardDeleteBlockedReason,
}: ProductDeletePanelProps) {
  return (
    <div className="product-delete-panel">
      <p className="muted">
        <strong>下架 / 删除</strong>会将商品从商城目录与计费推荐中隐藏，历史订单仍保留。
        当前状态：<strong>{active ? ' 上架中' : ' 已下架'}</strong>
      </p>

      <form action={deleteProductAction} className="product-delete-form">
        <input type="hidden" name="sku" value={sku} />
        <input type="hidden" name="mode" value="soft" />
        <label className="checkbox-label product-delete-confirm">
          <input type="checkbox" name="confirm" required />
          确认下架商品「{name}」（{sku}）
        </label>
        <AdminSubmitButton variant="destructive" size="sm">
          下架商品
        </AdminSubmitButton>
      </form>

      <hr className="product-delete-divider" />

      <p className="muted">
        <strong>永久删除</strong>会从数据库移除该 SKU（组合子项、首页推荐、标签关联一并清理）。
        已被订单或计费槽位引用的商品不可永久删除。
      </p>
      {canHardDelete ? (
        <form
          action={deleteProductAction}
          className="product-delete-form"
          onSubmit={(e) => {
            if (
              !window.confirm(
                `确定永久删除「${name}」（${sku}）？此操作不可恢复。`,
              )
            ) {
              e.preventDefault();
            }
          }}
        >
          <input type="hidden" name="sku" value={sku} />
          <input type="hidden" name="mode" value="hard" />
          <label className="checkbox-label product-delete-confirm">
            <input type="checkbox" name="confirm" required />
            确认永久删除「{name}」（{sku}）
          </label>
          <AdminSubmitButton variant="destructive" size="sm">
            永久删除商品
          </AdminSubmitButton>
        </form>
      ) : (
        <p className="muted product-delete-blocked">
          {hardDeleteBlockedReason?.trim() || '当前商品不可永久删除，请使用上方「下架」。'}
        </p>
      )}
    </div>
  );
}
