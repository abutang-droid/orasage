'use client';

import { deleteProductAction } from '@/app/actions';

type Props = {
  sku: string;
  name: string;
};

/** 列表行内「删除」：默认下架（soft），需二次确认 */
export function ProductRowDeleteButton({ sku, name }: Props) {
  return (
    <form
      action={deleteProductAction}
      className="product-row-delete-form"
      onSubmit={(e) => {
        if (!window.confirm(`确定删除（下架）「${name}」？\nSKU: ${sku}`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="sku" value={sku} />
      <input type="hidden" name="confirm" value="on" />
      <input type="hidden" name="mode" value="soft" />
      <input type="hidden" name="from" value="list" />
      <button type="submit" className="btn-text btn-text--danger">
        删除
      </button>
    </form>
  );
}
