'use client';

import { useRouter } from 'next/navigation';
import type { AdminProductReview } from '@/lib/api';
import { updateReviewStatusAction } from '@/app/actions';

const STATUSES = ['pending', 'approved', 'rejected', 'featured'] as const;

export function ProductReviewsTable({ reviews }: { reviews: AdminProductReview[] }) {
  const router = useRouter();

  const onStatus = async (id: number, status: string) => {
    await updateReviewStatusAction(id, status);
    router.refresh();
  };

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>用户</th>
            <th>评分</th>
            <th>内容</th>
            <th>状态</th>
            <th>时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {reviews.length === 0 ? (
            <tr><td colSpan={7} className="muted">暂无评价</td></tr>
          ) : reviews.map((r) => (
            <tr key={r.id}>
              <td><code>{r.sku}</code></td>
              <td>{r.userLabel}</td>
              <td>{'★'.repeat(r.rating)}</td>
              <td className="review-body-cell">{r.body}</td>
              <td><span className="badge">{r.statusLabel}</span></td>
              <td>{new Date(r.createdAt).toLocaleString('zh-CN')}</td>
              <td>
                <div className="review-status-actions">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`btn-secondary btn-secondary--sm${r.status === s ? ' is-active' : ''}`}
                      disabled={r.status === s}
                      onClick={() => void onStatus(r.id, s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
