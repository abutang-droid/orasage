/**
 * 播种全站法律协议（privacy / service / product × 多语言）。
 * 已存在同 kind+locale 则跳过（不覆盖运营手改）。
 *
 * Usage (from cms/):
 *   DATABASE_URL=... PAYLOAD_SECRET=... npm run seed:legal
 */
import { getPayload } from 'payload';
import config from '../src/payload.config';

type SeedDoc = {
  kind: 'privacy' | 'service' | 'product';
  locale: 'zh-CN' | 'zh-TW' | 'en' | 'pt-BR';
  version: string;
  title: string;
  summary: string;
  bodyHtml: string;
};

const VERSION = '2026.07';

const SEEDS: SeedDoc[] = [
  {
    kind: 'privacy',
    locale: 'zh-CN',
    version: VERSION,
    title: '隐私政策',
    summary: '说明我们如何收集、使用与保存您的个人信息。',
    bodyHtml: `
<h2>1. 我们收集的信息</h2>
<p>为提供命理测算、账号同步与商城订单服务，我们可能收集：邮箱、昵称、出生信息（您主动填写时）、订单与支付相关信息、设备与日志信息。</p>
<h2>2. 信息如何使用</h2>
<p>用于账号登录、订单履约、客服沟通、服务改进与安全风控。我们不会出售您的个人信息。</p>
<h2>3. 保存与安全</h2>
<p>信息保存在受访问控制的服务器中，采用加密传输。我们仅在提供服务及法律要求的必要期限内保存。</p>
<h2>4. 您的权利</h2>
<p>您可申请查询、更正或删除账号相关信息；可通过用户中心联系表单提交请求。</p>
<h2>5. 政策更新</h2>
<p>本政策可能更新。重大变更将以显著方式提示；继续使用服务即表示知悉更新后的版本。</p>
`.trim(),
  },
  {
    kind: 'service',
    locale: 'zh-CN',
    version: VERSION,
    title: '服务协议',
    summary: '注册即表示同意服务内容、账号规则与隐私信息保存说明。',
    bodyHtml: `
<h2>1. 服务内容</h2>
<p>OraSage 提供八字、紫微、塔罗等命理工具，以及相关内容浏览、用户中心与商城能力。命理解读仅供参考，不构成医疗、法律、投资等专业建议。</p>
<h2>2. 账号注册与使用</h2>
<p>您应提供真实可用的邮箱，并妥善保管密码。禁止利用本服务从事违法、侵权或干扰平台秩序的行为。</p>
<h2>3. 隐私信息保存说明</h2>
<p>我们按《隐私政策》收集与保存账号、订单及您主动填写的测算资料，用于提供与改进服务。详见隐私政策全文。</p>
<h2>4. 服务变更与中止</h2>
<p>我们可能调整功能或暂停服务；涉及付费权益将按商品服务协议与订单约定处理。</p>
<h2>5. 协议生效</h2>
<p>您勾选同意并完成注册后，本协议即对双方生效。</p>
`.trim(),
  },
  {
    kind: 'product',
    locale: 'zh-CN',
    version: VERSION,
    title: '商品服务协议',
    summary: '约定商品交付、售后退换货与数字商品规则。',
    bodyHtml: `
<h2>1. 适用范围</h2>
<p>本协议适用于通过 OraSage 商城及各命理 App 付费购买的实体商品、数字报告、服务与组合商品。</p>
<h2>2. 下单与支付</h2>
<p>订单在支付成功后生效。价格、币种与税费以结算页展示为准。</p>
<h2>3. 交付</h2>
<p>实体商品按物流信息发货；数字商品/报告在支付成功后按约定解锁；服务类商品按页面说明提供。</p>
<h2>4. 售后退换货</h2>
<ul>
<li>未开封、不影响二次销售的实体商品，可在签收后 7 日内申请退换（运费约定以客服确认为准）。</li>
<li>定制类（含 DIY/刻字/按出生信息定制）及已开封佩戴商品，除质量问题外原则上不支持无理由退货。</li>
<li>数字商品、已解锁报告、已消耗的服务权益，因其一经交付即可复制使用，除重大瑕疵外不支持退款。</li>
<li>质量问题请通过「我的 → 联系我们」提交订单号与凭证，我们将在核实后处理。</li>
</ul>
<h2>5. 协议确认</h2>
<p>您在结账页勾选同意本协议后完成支付，即表示已阅读并接受上述条款。</p>
`.trim(),
  },
  {
    kind: 'privacy',
    locale: 'en',
    version: VERSION,
    title: 'Privacy Policy',
    summary: 'How we collect, use, and store your personal information.',
    bodyHtml: `
<h2>1. Information we collect</h2>
<p>To provide readings, account sync, and shop orders we may collect email, nickname, birth details you provide, order/payment data, and device/log data.</p>
<h2>2. How we use it</h2>
<p>For login, fulfillment, support, product improvement, and security. We do not sell your personal information.</p>
<h2>3. Retention and security</h2>
<p>Data is stored on access-controlled servers with encrypted transport, and kept only as long as needed for service and legal requirements.</p>
<h2>4. Your rights</h2>
<p>You may request access, correction, or deletion via the contact form in your profile.</p>
<h2>5. Updates</h2>
<p>We may update this policy. Material changes will be highlighted; continued use means you acknowledge the updated version.</p>
`.trim(),
  },
  {
    kind: 'service',
    locale: 'en',
    version: VERSION,
    title: 'Terms of Service',
    summary: 'Service scope, account rules, and privacy retention notice for registration.',
    bodyHtml: `
<h2>1. Services</h2>
<p>OraSage provides BaZi, Zi Wei, Tarot tools, content, account center, and shop features. Readings are for reference only and are not professional advice.</p>
<h2>2. Accounts</h2>
<p>Provide a valid email and keep your password safe. Do not use the service for illegal or abusive activity.</p>
<h2>3. Privacy retention</h2>
<p>We process account, order, and reading data you provide under the Privacy Policy.</p>
<h2>4. Changes</h2>
<p>Features may change. Paid benefits follow the Product Service Agreement and your order terms.</p>
<h2>5. Acceptance</h2>
<p>By checking the box and registering, you accept this agreement.</p>
`.trim(),
  },
  {
    kind: 'product',
    locale: 'en',
    version: VERSION,
    title: 'Product Service Agreement',
    summary: 'Delivery, returns/exchanges, and digital goods rules.',
    bodyHtml: `
<h2>1. Scope</h2>
<p>Applies to physical goods, digital reports, services, and bundles purchased via OraSage shop or apps.</p>
<h2>2. Orders and payment</h2>
<p>Orders take effect after successful payment. Price and currency are shown at checkout.</p>
<h2>3. Delivery</h2>
<p>Physical goods ship by carrier; digital reports unlock after payment; services follow the product page.</p>
<h2>4. Returns and after-sales</h2>
<ul>
<li>Unopened physical goods may be returned within 7 days of delivery if resalable.</li>
<li>Custom / DIY / opened items are generally non-returnable except for quality defects.</li>
<li>Digital goods and unlocked reports are generally non-refundable once delivered.</li>
<li>Contact us with your order number for quality issues.</li>
</ul>
<h2>5. Acceptance</h2>
<p>Checking the box at checkout and paying means you accept these terms.</p>
`.trim(),
  },
];

async function main() {
  const payload = await getPayload({ config });
  let created = 0;
  let skipped = 0;

  for (const seed of SEEDS) {
    const existing = await payload.find({
      collection: 'legal-agreements',
      where: {
        and: [{ kind: { equals: seed.kind } }, { locale: { equals: seed.locale } }],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    if (existing.docs.length > 0) {
      skipped += 1;
      continue;
    }

    // 若旧 Pages 有 legal/* 正文，优先迁移 HTML
    let bodyHtml = seed.bodyHtml;
    if (seed.kind === 'privacy' || seed.kind === 'service') {
      const legacySlug = seed.kind === 'privacy' ? 'legal/privacy' : 'legal/terms';
      try {
        const pages = await payload.find({
          collection: 'pages',
          where: { slug: { equals: legacySlug } },
          limit: 1,
          depth: 0,
          overrideAccess: true,
        });
        const html = (pages.docs[0] as { legacyHtml?: string | null } | undefined)?.legacyHtml?.trim();
        if (html) bodyHtml = html;
      } catch {
        // pages 查询失败时使用内置模板
      }
    }

    await payload.create({
      collection: 'legal-agreements',
      data: {
        kind: seed.kind,
        locale: seed.locale,
        status: 'published',
        version: seed.version,
        title: seed.title,
        summary: seed.summary,
        bodyHtml,
      },
      overrideAccess: true,
    });
    created += 1;
  }

  console.log(`[seed:legal] created=${created} skipped=${skipped}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('[seed:legal] failed', err);
  process.exit(1);
});
