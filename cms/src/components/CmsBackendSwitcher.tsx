'use client';

/** CMS 与运营后台（商品/订单）同域分路径，提供显式切换入口 */
export function CmsBackendSwitcher() {
  return (
    <div className="cms-backend-switcher" role="navigation" aria-label="后台切换">
      <span className="cms-backend-switcher-label">当前：内容管理（CMS）</span>
      <a href="/" className="cms-backend-switcher-link">
        运营后台（商品 / 订单 / 用户）
      </a>
    </div>
  );
}
