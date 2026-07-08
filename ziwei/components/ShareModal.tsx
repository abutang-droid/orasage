'use client';

import { useState } from 'react';
import { Check, Download, Link2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@orasage/ui/button';
import type { ZiweiChart } from '@/lib/ziwei/types';
import ShareCardCanvas, { captureShareCard, downloadDataURL } from './ShareCardCanvas';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  shareUrl: string;
  chart: ZiweiChart | null;
  birth: { year: string; month: string; day: string; hour: string; minute: string; gender: 'male' | 'female'; city?: string };
  highlight?: string;
}

export default function ShareModal({ open, onClose, shareUrl, chart, birth, highlight }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('input');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadImage = async () => {
    setDownloading(true);
    try {
      const dataURL = await captureShareCard();
      if (!dataURL) {
        alert('图片生成失败，请截图保存或刷新重试');
        return;
      }
      downloadDataURL(dataURL, `紫微命盘_${Date.now()}.png`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={e => e.stopPropagation()}
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'white',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
            }}
          >
            {/* 顶部标题 */}
            <div style={{
              padding: '14px 18px',
              borderBottom: '1px solid rgba(184,146,42,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#3d2f10', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} strokeWidth={1.8} aria-hidden />
                分享命盘
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="size-7 min-h-0 min-w-7 rounded-full border-0 bg-black/5 text-base text-[#666]"
              >
                ×
              </Button>
            </div>

            {/* 卡片图预览（实际渲染） */}
            <div style={{ padding: '20px', background: '#fbf6e8', display: 'flex', justifyContent: 'center', overflowX: 'auto' }}>
              {chart && (
                <ShareCardCanvas chart={chart} birth={birth} highlight={highlight} />
              )}
            </div>

            <div style={{ padding: '0 20px 12px', textAlign: 'center', fontSize: '11px', color: '#a89b7c', letterSpacing: '0.05em' }}>
              ↑ 朋友圈 / 微信 / 抖音 / 小红书 都能用
            </div>

            {/* 操作区 */}
            <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Button
                type="button"
                onClick={downloadImage}
                disabled={downloading}
                loading={downloading}
                className="ziwei-calc-submit w-full rounded-[10px] py-3.5 text-sm tracking-[0.15em]"
              >
                <Download size={16} strokeWidth={2} aria-hidden />
                {downloading ? '生成中…' : '下载分享图'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={copyLink}
                className="w-full rounded-[10px] border-[rgba(184,146,42,0.4)] bg-white py-3.5 text-sm tracking-[0.12em] text-[#b8922a]"
              >
                {copied ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Check size={16} strokeWidth={2} aria-hidden />
                    已复制链接
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Link2 size={16} strokeWidth={2} aria-hidden />
                    复制命盘链接
                  </span>
                )}
              </Button>

              <div style={{
                fontSize: '11px', color: '#a89b7c', lineHeight: 1.7,
                padding: '10px 12px', background: 'rgba(184,146,42,0.05)',
                borderRadius: '8px', marginTop: '4px',
              }}>
                <div style={{ marginBottom: '4px', fontWeight: 600, color: '#8b6a14' }}>使用提示：</div>
                · 下载图片可发朋友圈 / 抖音 / 小红书<br />
                · 复制链接发给微信好友，对方点开看自己的盘起点
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
