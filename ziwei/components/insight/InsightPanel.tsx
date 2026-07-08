'use client';
import { useState, useRef, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@orasage/ui/button';
import { Card } from '@orasage/ui/card';
import { Input } from '@orasage/ui/input';
import { useT } from '@/lib/i18n';
import type { ZiweiChart, Palace } from '@/lib/ziwei/types';
import type { TimeView } from '../TimeNav';

interface Message { role: 'user' | 'assistant'; content: string; hidden?: boolean; }
interface SelectedSiHua { starName: string; siHua: string; view: TimeView; }
interface InsightPanelProps { chart: ZiweiChart; selectedPalace?: Palace | null; selectedSiHua?: SelectedSiHua | null; }

const TOPICS = [
  { key: 'overview', label: '命格' }, { key: 'love', label: '感情' }, { key: 'career', label: '事业' },
  { key: 'wealth', label: '财运' }, { key: 'health', label: '健康' }, { key: 'personality', label: '性格' },
] as const;

const TOPIC_PROMPTS: Record<string, string> = { overview: '...', love: '...', career: '...', wealth: '...', health: '...', personality: '...' };
const PALACE_ROLES: Record<string, string> = {};

function AiContent({ text, streaming }: { text: string; streaming?: boolean }) {
  const lines = text.split('\n');
  return (<div className="space-y-0.5">{lines.map((line, i) => {
    const sectionMatch = line.match(/^\*\*【(.+?)】\*\*$/);
    if (sectionMatch) return (<div key={i} className="pt-3 pb-0.5 first:pt-0"><span className="text-[11px] font-semibold tracking-wide" style={{ color: 'var(--t-gold)' }}>【{sectionMatch[1]}】</span></div>);
    if (line.trim() === '') return <div key={i} className="h-1" />;
    const parts = line.split(/\*\*(.+?)\*\*/);
    return (<div key={i} className="text-[11px] leading-relaxed" style={{ color: 'var(--t-text2)' }}>{parts.map((part, j) => j % 2 === 0 ? part : <strong key={j} className="font-medium" style={{ color: 'var(--t-text)' }}>{part}</strong>)}</div>);
  })}{streaming && <span className="inline-block w-1.5 h-3 ml-0.5 animate-pulse rounded-sm align-middle" style={{ background: 'var(--t-gold)', opacity: 0.6 }} />}</div>);
}

export default function InsightPanel({ chart, selectedPalace, selectedSiHua }: InsightPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTopic, setActiveTopic] = useState<string>('overview');
  const messagesRef = useRef<Message[]>([]);
  const loadingRef = useRef(false);
  const autoLoaded = useRef(false);
  const lastPalaceBranch = useRef<number | undefined>(undefined);
  const lastSiHuaKey = useRef<string | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = useT();

  const topics = TOPICS.map(topic => ({ ...topic, label: t(`insight.topics.${topic.key}`) }));

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { loadingRef.current = loading; }, [loading]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);
  useEffect(() => { if (autoLoaded.current) return; autoLoaded.current = true; sendMessage(TOPIC_PROMPTS.overview, true); }, []);
  useEffect(() => {
    if (!selectedPalace || selectedPalace.branch === lastPalaceBranch.current) return;
    lastPalaceBranch.current = selectedPalace.branch;
    const majorStars = selectedPalace.stars.filter(s => s.type === 'major');
    const starDesc = majorStars.length > 0 ? majorStars.map(s => `${s.name}${s.siHua ? '化' + s.siHua : ''}`).join('、') : '空宫（借对宫）';
    sendMessage(`请重点分析【${selectedPalace.name}】（主管：${PALACE_ROLES[selectedPalace.name] ?? ''}），该宫主星为${starDesc}`, true);
  }, [selectedPalace]);
  useEffect(() => {
    if (!selectedSiHua) return;
    const key = `${selectedSiHua.starName}-${selectedSiHua.siHua}-${selectedSiHua.view}`;
    if (key === lastSiHuaKey.current) return;
    lastSiHuaKey.current = key;
    const palaceOfStar = chart.palaces.find(p => p.stars.some(s => s.name === selectedSiHua.starName));
    const palaceName = palaceOfStar?.name ?? '未知宫位';
    sendMessage(`请分析【${selectedSiHua.view === 'daxian' ? '大限' : '流年'}${selectedSiHua.starName}化${selectedSiHua.siHua}】的飞化影响`, true);
  }, [selectedSiHua]);

  const streamResponse = async (apiMessages: any[]) => {
    try {
      const res = await fetch('/api/interpret', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chartData: chart, messages: apiMessages }) });
      if (!res.ok) throw new Error('请求失败');
      if (!res.body) throw new Error('无响应流');
      const reader = res.body.getReader(); const decoder = new TextDecoder();
      let assistantText = ''; setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue; const data = line.slice(6); if (data === '[DONE]') break;
          try { const parsed = JSON.parse(data); const delta = parsed.content ?? parsed.delta?.text ?? ''; assistantText += delta; setMessages(prev => { const updated = [...prev]; updated[updated.length - 1] = { role: 'assistant', content: assistantText }; return updated; }); } catch {}
        }
      }
    } catch { setMessages(prev => [...prev, { role: 'assistant', content: t('insight.error') }]); }
    finally { setLoading(false); loadingRef.current = false; }
  };

  const sendMessage = (text: string, hidden = false) => {
    if (!text.trim() || loadingRef.current) return;
    loadingRef.current = true; setLoading(true);
    const userMsg: Message = { role: 'user', content: text, hidden };
    const apiMessages = [...messagesRef.current, userMsg].map(m => ({ role: m.role, content: m.content }));
    setMessages(prev => [...prev, userMsg]); setInput(''); streamResponse(apiMessages);
  };

  const handleTopicClick = (topicKey: string) => { if (loadingRef.current) return; setActiveTopic(topicKey); sendMessage(TOPIC_PROMPTS[topicKey], true); };
  const handleSend = () => { sendMessage(input); };

  return (
    <Card className="flex flex-col h-full rounded-xl overflow-hidden card-glass border-0 shadow-none">
      <div className="flex-shrink-0 px-2 pt-2.5 pb-2" style={{ borderBottom: '1px solid var(--t-border)' }}>
        <div className="grid grid-cols-6 gap-1">{topics.map(topic => {
          const isActive = activeTopic === topic.key;
          return (
            <Button
              key={topic.key}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleTopicClick(topic.key)}
              disabled={loading}
              className="h-auto rounded-lg py-1.5 text-[10px] font-medium disabled:opacity-40"
              style={{
                background: isActive ? 'rgba(212,168,67,0.12)' : 'transparent',
                borderColor: isActive ? 'rgba(212,168,67,0.3)' : 'var(--t-border)',
                color: isActive ? 'var(--t-gold)' : 'var(--t-faint)',
              }}
            >
              {topic.label}
            </Button>
          );
        })}</div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && <div className="flex flex-col items-center justify-center h-full text-center"><Sparkles size={36} strokeWidth={1.5} className="mb-3" style={{ color: 'var(--t-gold)', opacity: 0.1 }} aria-hidden /><p className="text-[10px] animate-pulse" style={{ color: 'var(--t-faint)' }}>{t('insight.loading')}</p></div>}
        <AnimatePresence initial={false}>{messages.map((msg, i) => {
          if (msg.role === 'user' && msg.hidden) return null;
          if (msg.role === 'user') return (<motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end"><div className="max-w-[85%] rounded-xl px-3 py-2 text-[11px]" style={{ background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.18)', color: 'var(--t-gold)' }}>{msg.content}</div></motion.div>);
          const isLastMsg = i === messages.length - 1;
          return (<motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-[9px] tracking-widest mb-2 flex items-center gap-1.5" style={{ color: 'var(--t-faint)' }}><Sparkles size={10} strokeWidth={1.8} style={{ color: 'var(--t-gold)', opacity: 0.4 }} aria-hidden />{t('insight.label')}</div>
            <AiContent text={msg.content} streaming={loading && isLastMsg} />
          </motion.div>);
        })}</AnimatePresence>
      </div>
      <div className="flex-shrink-0 px-3 pb-3 pt-2" style={{ borderTop: '1px solid var(--t-border)' }}>
        <div className="flex gap-2">
          <Input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={t('insight.placeholder')}
            disabled={loading}
            className="h-auto flex-1 rounded-lg border-[var(--t-border)] bg-[var(--t-card)] px-3 py-2 text-[11px] text-[var(--t-text)] shadow-none focus-visible:ring-[var(--t-gold)]"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="h-auto rounded-lg px-3 py-2 text-[11px] font-medium disabled:cursor-not-allowed disabled:opacity-30"
            style={{
              background: 'rgba(212,168,67,0.15)',
              borderColor: 'rgba(212,168,67,0.25)',
              color: 'var(--t-gold)',
            }}
          >
            {loading ? '…' : t('insight.submit')}
          </Button>
        </div>
      </div>
    </Card>
  );
}
