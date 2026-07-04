import { mainPortalUrl } from '@/lib/orasage-app-shell/config';

/** PC 页脚 — 版权 / 隐私 / 服务条款（仅桌面显示，见 app-shell.css） */
export function PortalFooter() {
  const base = mainPortalUrl('zh-CN');

  return (
    <footer className="orasage-portal-footer safe-bottom mt-auto">
      <div className="orasage-portal-footer-inner">
        <p className="orasage-portal-footer-copy">© 2026 OraSage. 保留所有权利。</p>
        <div className="orasage-portal-footer-links">
          <a href={`${base}/privacy`} className="orasage-portal-footer-link">
            隐私政策
          </a>
          <a href={`${base}/terms`} className="orasage-portal-footer-link">
            服务条款
          </a>
        </div>
      </div>
    </footer>
  );
}
