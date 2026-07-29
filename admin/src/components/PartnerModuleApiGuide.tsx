/**
 * 合作方 Module API 开户与调用说明（展示在 /partners「创建合作方」栏）
 */
export function PartnerModuleApiGuide({
  baseUrl,
  exampleSlug = 'acme-shop',
}: {
  baseUrl: string;
  exampleSlug?: string;
}) {
  const root = `${baseUrl.replace(/\/$/, '')}/v1/partners/{partnerSlug}`;
  const exampleRoot = `${baseUrl.replace(/\/$/, '')}/v1/partners/${exampleSlug}`;

  return (
    <aside
      className="partner-api-guide"
      style={{
        margin: '0 0 1rem',
        padding: '0.85rem 1rem',
        background: 'var(--muted-bg, #f5f5f4)',
        borderRadius: 8,
        fontSize: '0.9rem',
        lineHeight: 1.55,
      }}
    >
      <h3 style={{ fontSize: '0.95rem', margin: '0 0 0.5rem' }}>对外 Module API · 开户与调用规则</h3>
      <p className="muted" style={{ margin: '0 0 0.75rem' }}>
        第三方 / 白标用 <strong>API Key</strong> 调配置接口，不走员工登录 Cookie，也不开放 finance /
        Payload。完整契约见仓库 <code>docs/products/module-api-v1.md</code>。
      </p>

      <h4 style={{ fontSize: '0.85rem', margin: '0.75rem 0 0.35rem' }}>一、怎么开账号（平台超管）</h4>
      <ol style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
        <li>
          下方填写 <code>slug</code>（小写字母数字与连字符，如 <code>{exampleSlug}</code>）与显示名称，选择交付模板后保存。
        </li>
        <li>
          模板会写入 <code>partner_modules</code>：
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.1rem' }}>
            <li>
              <code>shop-only</code> → shop, billing, ops, analytics
            </li>
            <li>
              <code>tarot-only</code> → app.tarot, billing, content, legal, ops, analytics
            </li>
            <li>
              <code>full-apps</code> → shop + 三命理 App + billing/content/legal/ops/analytics
            </li>
          </ul>
        </li>
        <li>
          在列表点「管理」→「创建 API Key」。明文 Key（前缀 <code>mk_live_</code>）<strong>只显示一次</strong>，请立即交给对接方并安全保管。
        </li>
        <li>
          可选：在「子账号与权限」为该合作方建员工账号（绑同一 <code>partnerId</code>），仅供登录本后台；对外集成仍用 API Key。
        </li>
        <li>
          停用：将合作方 <code>status</code> 设为 <code>disabled</code>，或吊销对应 API Key。
        </li>
      </ol>

      <h4 style={{ fontSize: '0.85rem', margin: '0.75rem 0 0.35rem' }}>二、接口地址</h4>
      <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
        <li>
          基址：<code>{baseUrl.replace(/\/$/, '')}</code>
        </li>
        <li>
          前缀：<code>{root}</code>
        </li>
        <li>
          示例（slug=<code>{exampleSlug}</code>）：
          <code style={{ display: 'block', marginTop: 4, wordBreak: 'break-all' }}>{exampleRoot}</code>
        </li>
      </ul>
      <p className="muted" style={{ margin: '0 0 0.5rem' }}>
        路径里的 <code>{'{partnerSlug}'}</code> 必须与 Key 绑定的合作方 slug 完全一致，否则 <code>403 partner_mismatch</code>。
      </p>
      <div style={{ overflowX: 'auto', marginBottom: '0.5rem' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr>
              <th align="left">方法</th>
              <th align="left">路径</th>
              <th align="left">所需 scope</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>GET</td>
              <td>
                <code>/</code> · <code>/modules</code> · <code>/audit</code>
              </td>
              <td>任意有效 Key</td>
            </tr>
            <tr>
              <td>GET</td>
              <td>
                <code>/shop/products</code> · <code>/shop/storefront</code>
              </td>
              <td>
                <code>module:shop</code>
              </td>
            </tr>
            <tr>
              <td>PUT</td>
              <td>
                <code>/shop/storefront</code>
              </td>
              <td>
                <code>module:shop</code> + <code>config:write</code>
              </td>
            </tr>
            <tr>
              <td>GET</td>
              <td>
                <code>/billing/slots</code>
              </td>
              <td>
                <code>module:billing</code>
              </td>
            </tr>
            <tr>
              <td>GET</td>
              <td>
                <code>/apps/bazi|ziwei|tarot</code>
              </td>
              <td>
                <code>module:app.*</code>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4 style={{ fontSize: '0.85rem', margin: '0.75rem 0 0.35rem' }}>三、鉴权与安全规则</h4>
      <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
        <li>
          Header：<code>Authorization: Bearer &lt;api_key&gt;</code> 或 <code>X-Api-Key: &lt;api_key&gt;</code>
        </li>
        <li>
          有效权限 = Key 的 scopes ∩ 该合作方已开通模块；未开通模块即使 Key 写了 scope 也访问不了。
        </li>
        <li>
          <strong>禁止</strong>：finance / wallets、L3 密钥明文、Payload Admin、跨租户 slug、用员工 Cookie 冒充 Module API。
        </li>
        <li>
          配置写入会记入审计日志；对接方可用 <code>GET /audit</code> 查看本租户摘要。
        </li>
        <li>
          错误码：<code>401</code> 缺/无效 Key；<code>403</code> 跨租户 / scope 不足 / 合作方停用；
          <code>404</code> 无此路径；<code>422</code> 参数错误。
        </li>
      </ul>

      <h4 style={{ fontSize: '0.85rem', margin: '0.75rem 0 0.35rem' }}>四、交给对接方的最小信息包</h4>
      <ol style={{ margin: 0, paddingLeft: '1.25rem' }}>
        <li>
          Base URL：<code>{baseUrl.replace(/\/$/, '')}</code>
        </li>
        <li>
          partnerSlug：创建时填写的 slug
        </li>
        <li>API Key 明文（仅此一次）</li>
        <li>已开通模板 / 模块清单</li>
        <li>
          示例：
          <code style={{ display: 'block', marginTop: 4, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {`curl -H "Authorization: Bearer mk_live_…" \\\n  ${exampleRoot}/modules`}
          </code>
        </li>
      </ol>
    </aside>
  );
}
