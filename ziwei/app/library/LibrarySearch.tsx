'use client';

/**
 * 古籍库搜索框 — client component
 *
 * 输入 → 实时搜索 → 跳转 /library/search?q=xxx
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@orasage/ui/button';
import { Card } from '@orasage/ui/card';
import { Input } from '@orasage/ui/input';

export default function LibrarySearch() {
  const [q, setQ] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const submit = () => {
    const query = q.trim();
    if (!query) return;
    startTransition(() => {
      router.push(`/library/search?q=${encodeURIComponent(query)}`);
    });
  };

  return (
    <Card
      className="flex gap-2 rounded-xl border-[rgba(184,146,42,0.3)] p-1.5 shadow-[0_4px_16px_rgba(184,146,42,0.08)]"
      style={{ background: 'var(--bg-card)' }}
    >
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="搜索古籍原文，如：七杀朝斗 / 双禄朝垣 / 化忌"
        className="h-auto min-h-0 flex-1 border-0 bg-transparent px-3.5 py-2.5 text-sm text-[var(--tx-0)] shadow-none focus-visible:ring-0"
      />
      <Button
        type="button"
        onClick={submit}
        disabled={isPending || !q.trim()}
        loading={isPending}
        className="ziwei-calc-submit shrink-0 rounded-lg px-5 py-2.5 text-[13px] tracking-[0.15em]"
      >
        搜索
      </Button>
    </Card>
  );
}
