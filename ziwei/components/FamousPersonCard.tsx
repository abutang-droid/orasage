'use client';
import { motion } from 'framer-motion';
import { Star, TriangleAlert } from 'lucide-react';
import { Card } from '@orasage/ui/card';
import type { FamousPerson } from '@/lib/ziwei/famous';

const CATEGORY_COLORS: Record<string, string> = {
  '商业': '#4ade80',
  '文艺': '#c084fc',
  '科技': '#60a5fa',
  '体育': '#fb923c',
  '历史': '#facc15',
};

export default function FamousPersonCard({ person }: { person: FamousPerson }) {
  const catColor = CATEGORY_COLORS[person.category] ?? '#d4a843';
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="mb-4"
    >
      <Card
        className="card-glass rounded-xl p-4 border-0 shadow-none"
        style={{
          border: `1px solid ${catColor}40`,
          background: `linear-gradient(135deg, ${catColor}06, transparent 60%)`,
        }}
      >
      <div className="text-[10px] tracking-widest mb-3 flex items-center gap-2" style={{ color: 'var(--t-faint)' }}>
        <Star size={12} strokeWidth={2} style={{ color: catColor, opacity: 0.9 }} aria-hidden />
        名人命盘
        <span className="text-[9px] px-2 py-0.5 rounded-full ml-auto"
          style={{ color: catColor, background: catColor + '18', border: `1px solid ${catColor}40` }}>
          {person.category}
        </span>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-base font-semibold" style={{ color: 'var(--t-text1)', letterSpacing: '0.02em' }}>
            {person.name}
          </span>
          <span className="text-[11px]" style={{ color: 'var(--t-faint)' }}>
            {person.year}年 · {person.gender === 'male' ? '男命' : '女命'}
          </span>
        </div>

        <div className="text-[11px]" style={{ color: 'var(--t-text2)', opacity: 0.85 }}>
          {person.description}
        </div>

        <div className="text-[11px] leading-relaxed px-3 py-2.5 rounded-md"
          style={{
            color: 'var(--t-text2)',
            background: catColor + '0c',
            border: `1px solid ${catColor}25`,
          }}>
          <span style={{ color: catColor, fontWeight: 600, marginRight: '4px' }}>命盘亮点：</span>
          {person.notable}
        </div>

        <div className="text-[10px] mt-2 flex items-start gap-1.5" style={{ color: 'var(--t-faint)', opacity: 0.6, lineHeight: 1.5 }}>
          <TriangleAlert size={12} strokeWidth={2} className="mt-0.5 shrink-0" aria-hidden />
          <span>出生时辰为公开文献估算值，仅供研究参考。下方 AI 解读基于此命盘自动生成，与本人无关。</span>
        </div>
      </div>
      </Card>
    </motion.div>
  );
}
