'use client';

import { Alert, AlertDescription, Badge, Card, CardContent } from '@orasage/ui';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { BlessingMeritDetail, MeritDetailRules, MeritRuleRow } from '@/lib/tarot-merit';
import { externalUrls } from '@/lib/urls';
import { ProfileListSkeleton } from './ProfileListSkeleton';

function formatUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function PathRulesCard({
  name,
  active,
  pausedNote,
  rules,
  interruptNote,
  activeLabel,
  pausedLabel,
}: {
  name: string;
  active: boolean;
  pausedNote?: string;
  rules: MeritRuleRow[];
  interruptNote?: string;
  activeLabel: string;
  pausedLabel: string;
}) {
  return (
    <Card className={active ? '' : 'opacity-80'}>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground">{name}</p>
          <Badge variant={active ? 'default' : 'secondary'} className="text-[10px]">
            {active ? activeLabel : pausedLabel}
          </Badge>
        </div>
        {!active && pausedNote ? (
          <p className="text-xs text-muted-foreground">{pausedNote}</p>
        ) : null}
        <ul className="divide-y divide-border">
          {rules.map((rule) => (
            <li key={rule.condition} className="flex justify-between gap-3 py-2 text-xs">
              <div className="min-w-0 flex-1 text-muted-foreground">
                <p>{rule.condition}</p>
                {rule.note ? <p className="mt-0.5 text-[10px] text-muted-foreground/80">{rule.note}</p> : null}
              </div>
              <span className="shrink-0 font-mono text-primary">{rule.amount}</span>
            </li>
          ))}
        </ul>
        {interruptNote ? <p className="text-[10px] text-muted-foreground">{interruptNote}</p> : null}
      </CardContent>
    </Card>
  );
}

const EMPTY_SUMMARY = {
  total: 0,
  level: 0,
  levelTitleZh: '朝圣者',
  levelTitleEn: 'Pilgrim',
  levelTitlePt: 'Peregrino',
  streak: 0,
  streakLongest: 0,
  totalCheckins: 0,
  totalSpentCents: 0,
  rank: '0/100',
  progressInLevel: 0,
  neededForNext: 100,
  meritTime: 0,
  meritShare: 0,
  meritOffer: 0,
  sharePathEnabled: false,
  prayedToday: false,
};

export function MeritDetail() {
  const t = useTranslations('profile.merit');
  const locale = useLocale();
  const [data, setData] = useState<BlessingMeritDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch('/api/profile/merit', { credentials: 'include', cache: 'no-store' })
      .then(async (res) => {
        if (res.status === 401) return { linked: false } as BlessingMeritDetail;
        if (!res.ok) throw new Error('load failed');
        return res.json() as Promise<BlessingMeritDetail>;
      })
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <ProfileListSkeleton rows={4} />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{t('loadError')}</AlertDescription>
      </Alert>
    );
  }

  if (!data?.linked || !data.summary) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">{t('notLinked')}</p>
        <a
          href={externalUrls.temple}
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          {t('goTemple')}
        </a>
      </div>
    );
  }

  const s = data.summary ?? EMPTY_SUMMARY;
  const rules = data.rules as MeritDetailRules | undefined;
  const recent = data.recentCheckins ?? [];
  const levelTitle = locale.startsWith('zh')
    ? s.levelTitleZh
    : s.levelTitleEn ?? s.levelTitleZh;
  const levelSubtitle = locale.startsWith('zh')
    ? `${s.levelTitleEn} · ${s.levelTitlePt}`
    : `${s.levelTitlePt}`;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div
          className="mx-auto mb-3 flex size-[4.5rem] items-center justify-center rounded-full text-3xl text-primary-foreground"
          style={{ background: 'linear-gradient(160deg, #a67c2a, #d4a853)' }}
          aria-hidden
        >
          ✦
        </div>
        <h2 className="font-serif text-xl font-bold text-foreground">{levelTitle}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{levelSubtitle}</p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground">{t('totalMerit')}</p>
          <p className="mt-1 font-mono text-3xl font-semibold text-primary">{s.total}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.round(s.progressInLevel * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {s.rank}
            {s.neededForNext != null
              ? t('neededForNext', { count: s.neededForNext })
              : t('maxLevel')}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="font-mono text-lg font-semibold text-primary">{s.meritTime}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t('timeMerit')}</p>
            <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
              {t('timeMeta', {
                checkins: s.totalCheckins,
                streak: s.streak,
                longest: s.streakLongest,
              })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="font-mono text-lg font-semibold text-primary">{s.meritOffer}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t('offerMerit')}</p>
            <p className="mt-2 text-[10px] text-muted-foreground">
              {t('spentTotal', { amount: formatUsd(s.totalSpentCents) })}
            </p>
          </CardContent>
        </Card>
      </div>

      {s.meritShare > 0 ? (
        <Card className="border-dashed opacity-75">
          <CardContent className="p-4">
            <p className="font-mono text-lg font-semibold text-primary">{s.meritShare}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t('shareMeritHistory')}</p>
            <p className="mt-2 text-[10px] text-muted-foreground">
              {s.sharePathEnabled ? t('shareActive') : t('sharePaused')}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {rules ? (
        <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          {t('sacredNote', { multiplier: rules.sacredDayMultiplier })}
        </p>
      ) : null}

      {rules ? (
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">{t('rulesTitle')}</h3>
          <PathRulesCard
            name={rules.time.label}
            active={rules.time.active}
            rules={rules.time.rules}
            interruptNote={rules.time.interruptNote}
            activeLabel={t('pathActive')}
            pausedLabel={t('pathPaused')}
          />
          <PathRulesCard
            name={rules.offer.label}
            active={rules.offer.active}
            rules={rules.offer.rules}
            activeLabel={t('pathActive')}
            pausedLabel={t('pathPaused')}
          />
          <PathRulesCard
            name={rules.share.label}
            active={rules.share.active}
            pausedNote={rules.share.pausedNote}
            rules={rules.share.rules}
            activeLabel={t('pathActive')}
            pausedLabel={t('pathPaused')}
          />
        </section>
      ) : null}

      {rules && rules.levels.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">{t('levelsTitle')}</h3>
          {rules.levels.map((lvl) => (
            <Card key={lvl.level} className={lvl.level === s.level ? 'border-primary/30' : ''}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">
                    {locale.startsWith('zh') ? lvl.titleZh : lvl.titleEn} · {lvl.titlePt}
                  </p>
                  {lvl.level === s.level ? (
                    <Badge variant="outline" className="text-[10px]">
                      {t('currentLevel')}
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {lvl.min}–{lvl.max ?? '∞'} {t('meritUnit')}
                  {lvl.privileges.leaderboard ? ` · ${t('leaderboardOn')}` : ` · ${t('leaderboardOff')}`}
                </p>
                <ul className="mt-2 list-disc space-y-0.5 pl-4 text-[11px] text-muted-foreground">
                  {lvl.privileges.unlocksZh.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : null}

      <section className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">{t('recentTitle')}</h3>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('recentEmpty')}{' '}
            <a href={externalUrls.temple} className="text-primary underline underline-offset-2">
              {t('goTemple')}
            </a>
          </p>
        ) : (
          <ul className="space-y-2">
            {recent.map((c) => (
              <li key={`${c.checkinDate}-${c.deityName}`}>
                <Card>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm text-foreground">{c.deityName}</p>
                      <p className="text-xs text-muted-foreground">{c.checkinDate}</p>
                    </div>
                    <span className="text-sm font-medium text-primary">+{c.meritEarned}</span>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
