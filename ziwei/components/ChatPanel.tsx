'use client';
import { useState, useRef, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@orasage/ui/button';
import { useT } from '@/lib/i18n';
import type { ZiweiChart } from '@/lib/ziwei/types';

interface Message { role: 'user' | 'assistant'; content: string; }

interface ChatPanelProps {
  chart: ZiweiChart;
  mode?: 'single' | 'heming';
  chartData?: unknown;
}

export default function ChatPanel({ chart, mode = 'single', chartData }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = useT();

  const PRESET_QUESTIONS = [
    t('chat.preset.overview'), t('chat.preset.love'), t('chat.preset.career'),
    t('chat.preset.daxian'), t('chat.preset.health'), t('chat.preset.liunian'),
  ];

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setApiError('');
    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages); setInput(''); setLoading(true);
    try {
      const res = await fetch('/api/interpret', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, chartData: chartData ?? chart, mode }),
      });
      if (!res.ok) { const errData = await res.json().catch(() => ({})); throw new Error(errData.error || '请求失败，请稍后再试'); }
      if (!res.body) throw new Error('无响应流');
      const reader = res.body.getReader(); const decoder = new TextDecoder();
      let assistantText = ''; setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim(); if (data === '[DONE]') break;
          try { const parsed = JSON.parse(data); const delta = parsed.content ?? parsed.delta?.text ?? ''; if (delta) { assistantText += delta; setMessages(prev => { const updated = [...prev]; updated[updated.length - 1] = { role: 'assistant', content: assistantText }; return updated; }); } } catch {}
        }
      }
    } catch (e: unknown) { const msg = e instanceof Error ? e.message : 'AI 服务暂时不可用'; setApiError(msg); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-card)', borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1px solid var(--bdr)' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--bdr)', flexShrink: 0, background: 'var(--bg-0)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} strokeWidth={1.8} style={{ color: 'var(--gold)', opacity: 0.7 }} aria-hidden />
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--tx-0)', letterSpacing: '0.1em' }}>{t('chat.title')}</h3>
          <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--gold)', background: 'var(--gold-pale)', border: '1px solid var(--gold-border)', borderRadius: 'var(--r-pill)', padding: '2px 8px', fontWeight: 600 }}>{mode === 'heming' ? t('chat.label.heming') : t('chat.label.single')}</span>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--tx-3)', marginTop: '3px' }}>{t('chat.subtitle')}</p>
      </div>
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 }}>
        {messages.length === 0 && <div style={{ textAlign: 'center', padding: '32px 16px' }}><Sparkles size={32} strokeWidth={1.5} style={{ color: 'var(--gold)', opacity: 0.12, marginBottom: '12px' }} aria-hidden /><p style={{ fontSize: '12px', color: 'var(--tx-3)', lineHeight: 1.8 }}>{t('chat.empty')}</p></div>}
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={msg.role === 'user' ? { background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)', color: '#FFFFFF', borderRadius: '12px 12px 4px 12px', padding: '10px 14px', fontSize: '13px', lineHeight: 1.6, maxWidth: '82%' } : { background: 'var(--bg-0)', border: '1px solid var(--bdr)', color: 'var(--tx-1)', borderRadius: '12px 12px 12px 4px', padding: '10px 14px', fontSize: '13px', lineHeight: 1.7, maxWidth: '92%' }}>
              {msg.role === 'assistant' && <div style={{ fontSize: '10px', color: 'var(--gold)', marginBottom: '4px', fontWeight: 600 }}>命理师 ·</div>}
              <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}{loading && i === messages.length - 1 && msg.role === 'assistant' && <span style={{ display: 'inline-block', width: '6px', height: '14px', marginLeft: '2px', background: 'var(--gold)', opacity: 0.6, verticalAlign: 'middle' }} />}</div>
            </div>
          </div>
        ))}
        {apiError && <div style={{ padding: '10px 14px', background: 'rgba(168,50,40,0.06)', border: '1px solid rgba(168,50,40,0.2)', borderRadius: '8px', fontSize: '12px', color: '#c0392b', textAlign: 'center' }}>{apiError}</div>}
      </div>
      {messages.length === 0 && <div style={{ padding: '0 12px 8px', flexShrink: 0 }}><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>{PRESET_QUESTIONS.map((q, i) => (<button key={i} onClick={() => sendMessage(q)} disabled={loading} style={{ textAlign: 'left', fontSize: '11px', borderRadius: '8px', padding: '8px 10px', color: 'var(--tx-2)', border: '1px solid var(--bdr)', background: 'transparent', cursor: 'pointer', lineHeight: 1.5 }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--gold)'; (e.currentTarget as HTMLElement).style.background = 'var(--gold-pale)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--bdr)'; (e.currentTarget as HTMLElement).style.color = 'var(--tx-2)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>{q}</button>))}</div></div>}
      <div style={{ padding: '10px 12px 14px', borderTop: '1px solid var(--bdr)', flexShrink: 0, display: 'flex', gap: '8px' }}>
        <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)} placeholder={t('chat.placeholder')} disabled={loading}
          style={{ flex: 1, height: '40px', background: 'var(--bg-0)', border: '1.5px solid var(--bdr-med)', borderRadius: '8px', padding: '0 12px', fontSize: '13px', color: 'var(--tx-1)', outline: 'none' }}
          onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold)'; }} onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--bdr-med)'; }} />
        <Button
          type="button"
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="h-10 shrink-0 px-4"
        >
          {loading ? '…' : t('chat.submit')}
        </Button>
      </div>
    </div>
  );
}
