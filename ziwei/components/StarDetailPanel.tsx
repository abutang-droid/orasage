'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Briefcase, Gem, Heart, type LucideIcon } from 'lucide-react';
import { useT } from '@/lib/i18n';
import type { Star } from '@/lib/ziwei/types';
import { STAR_DESCRIPTIONS } from '@/lib/ziwei/constants';

interface StarDetailPanelProps { star: Star | null; palaceName?: string; onClose: () => void; }

const STAR_DETAIL: Record<string, any> = {};

const levelConfig = {
  major: { label: '主星', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  lucky: { label: '吉星', color: 'text-sky-400 border-sky-500/30 bg-sky-500/10' },
  sha:   { label: '煞星', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
  minor: { label: '杂星', color: 'text-slate-400 border-slate-500/25 bg-slate-500/10' },
};

const siHuaColors: Record<string, string> = {
  '禄': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  '权': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  '科': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  '忌': 'text-red-400 bg-red-500/10 border-red-500/30',
};

export default function StarDetailPanel({ star, palaceName, onClose }: StarDetailPanelProps) {
  const t = useT();
  const desc = star ? STAR_DESCRIPTIONS[star.name] : null;
  const typeConfig = star ? levelConfig[star.type] : null;
  const levelLabel = star ? ({ major: t('star.tag.element'), lucky: t('star.tag.nature'), sha: t('star.tag.location'), minor: '杂星' })[star.type] : '';

  return (<AnimatePresence>{star && (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="card-glass rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--t-border)' }}>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold" style={{ color: 'var(--t-gold)' }}>{star.name}</span>
          {typeConfig && <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${typeConfig.color}`}>{levelLabel}</span>}
          {star.siHua && <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${siHuaColors[star.siHua] || ''}`}>化{star.siHua}</span>}
        </div>
        <button onClick={onClose} className="transition-colors text-lg leading-none" style={{ color: 'var(--t-faint)' }}>×</button>
      </div>
      <div className="p-4 space-y-4 overflow-y-auto max-h-[560px]">
        {desc && <div className="flex flex-wrap gap-1.5">{
          (() => {
            const tags: string[] = [`${t('star.tag.element')} · ${desc.element}`, `${t('star.tag.nature')} · ${desc.nature}`];
            if (palaceName) tags.push(`${t('star.tag.location')} · ${palaceName}`);
            if (star?.brightness) tags.push(star.brightness === 'bright' ? t('star.brightness.bright') : star.brightness === 'dim' ? t('star.brightness.dim') : t('star.brightness.neutral'));
            return tags.map(tag => (<div key={tag} className="text-[10px] px-2 py-1 rounded-full" style={{ border: '1px solid var(--t-border)', color: tag.includes(t('star.brightness.bright')) ? '#eab308' : tag.includes(t('star.brightness.dim')) ? '#ef4444' : 'var(--t-text2)' }}>{tag}</div>));
          })()
        }</div>}
        {desc && <div><div className="text-[10px] tracking-widest mb-1.5" style={{ color: 'var(--t-faint)' }}>{t('star.traits')}</div>
          <div className="flex flex-wrap gap-1.5">{desc.keywords.split('·').map(k => (<span key={k} className="text-[11px] px-2 py-0.5 rounded-full" style={{ color: 'var(--t-gold)', border: '1px solid rgba(212,168,67,0.2)', background: 'rgba(212,168,67,0.06)' }}>{k.trim()}</span>))}</div></div>}
        <div className="grid grid-cols-1 gap-2">
          {([
            { label: t('star.career'), value: '事业方向描述', icon: Briefcase },
            { label: t('star.relationship'), value: '感情特质描述', icon: Heart },
            { label: t('star.wealth'), value: '财运分析描述', icon: Gem },
            { label: t('star.health'), value: '健康提示描述', icon: Activity },
          ] as { label: string; value: string; icon: LucideIcon }[]).map((item) => {
            const Icon = item.icon;
            return (
            <div key={item.label} className="card-inner rounded-lg p-3">
              <div className="text-[10px] mb-1 flex items-center gap-1" style={{ color: 'var(--t-faint)' }}>
                <Icon size={12} strokeWidth={2} aria-hidden />
                <span>{item.label}</span>
              </div>
            </div>
          );
          })}
        </div>
      </div>
    </motion.div>
  )}</AnimatePresence>);
}
