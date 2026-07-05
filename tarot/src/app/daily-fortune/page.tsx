'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type DailyQuota = {
  allowance?: number;
  remaining?: number | null;
  drawsUsed?: number;
  templeBonusGranted?: boolean;
};

export default function DailyFortunePage() {
  const [quota, setQuota] = useState<DailyQuota | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch('/api/daily-fortune/quota', { credentials: 'include', cache: 'no-store' })
      .then((r) => r.json())
      .then((data: DailyQuota) => setQuota(data))
      .catch(() => setQuota(null))
      .finally(() => setLoading(false));
  }, []);

  const remaining = quota?.remaining ?? 1;

  return (
    <div className="daily-fortune-page">
      <div className="page-header animate-fade-in-up">
        <span className="label">每日运势</span>
        <h1>今日四维运势</h1>
        <p>工作 · 爱情 · 事业 · 财运，由 Manto 为你解读</p>
      </div>

      <div className="daily-fortune-quota card animate-fade-in-up delay-100">
        {loading ? (
          <div className="daily-fortune-quota-loading">
            <div className="spinner" />
          </div>
        ) : (
          <>
            <div className="daily-fortune-quota-row">
              <span>今日可抽</span>
              <strong>{quota?.allowance ?? 1} 次</strong>
            </div>
            <div className="daily-fortune-quota-row">
              <span>剩余次数</span>
              <strong>{remaining} 次</strong>
            </div>
            {!quota?.templeBonusGranted ? (
              <p className="daily-fortune-quota-hint">
                今日尚未祈福加成。
                <Link href="/temple">去神庙参拜</Link>
                可额外获得 1 次抽取机会。
              </p>
            ) : (
              <p className="daily-fortune-quota-hint">今日已获得祈福加成 +1</p>
            )}
          </>
        )}
      </div>

      <div className="daily-fortune-coming card animate-fade-in-up delay-200">
        <p className="daily-fortune-coming-title">完整运势流程即将开启</p>
        <p className="daily-fortune-coming-desc">
          下一步将支持 AI 引导问答 → 抽牌 → 四维报告 → 专属推荐。当前可先体验每日抽卡。
        </p>
        <Link href="/daily-card" className="btn-primary daily-fortune-coming-btn">
          先去每日抽卡
        </Link>
        <Link href="/" className="btn-ghost daily-fortune-coming-back">
          返回首页
        </Link>
      </div>
    </div>
  );
}
