import { getAdminUser, loginUrl } from '@/lib/auth';

export default async function AdminHome() {
  const admin = await getAdminUser();

  if (!admin) {
    return (
      <main className="admin-shell">
        <div className="login-card">
          <h1>OraSage 管理后台</h1>
          <p>需要管理员账号登录后才能访问。</p>
          <a className="btn-primary" href={loginUrl()}>
            登录
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <h1>OraSage 管理后台</h1>
        <a className="btn-text" href="https://auth.orasage.com/center">
          返回用户中心
        </a>
      </header>
      <section className="card-grid">
        <div className="card">
          <h2>用户总数</h2>
          <div className="value">—</div>
        </div>
        <div className="card">
          <h2>订单总数</h2>
          <div className="value">—</div>
        </div>
        <div className="card">
          <h2>命理测算次数</h2>
          <div className="value">—</div>
        </div>
      </section>
      <p style={{ marginTop: '2rem', color: '#a7a9be', fontSize: '0.9rem' }}>
        当前为最小可用骨架：已完成管理员身份校验（仅 role=admin 可访问），
        数据看板与用户/订单管理功能待后续迭代接入 auth-service 的管理端 API。
      </p>
    </main>
  );
}
