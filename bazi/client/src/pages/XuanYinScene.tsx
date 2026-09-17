import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { XuanYinCharacter } from '@/components/xuanyin/XuanYinCharacter';
import { SceneAtmosphere, Waveform, useTypewriter } from '@/components/xuanyin/SceneChrome';
import {
  OPENING_LINES,
  advanceDialogue,
  INITIAL_COLLECTED,
  type CharacterMood,
  type CollectedBirth,
  type DialogueStepId,
  type Line,
} from '@/components/xuanyin/dialogueScript';
import { cancelSpeech, speakText, warmVoices } from '@/components/xuanyin/browserTts';
import '@/components/xuanyin/xuanyin-scene.css';

type Phase = 'dialogue' | 'ink' | 'result';
type ResultTab = 'assistant' | 'chart' | 'dayun' | 'report' | 'member';

type LogItem = Line & { id: string; typed?: boolean };

const THINK_MS = 900;
const TYPE_MS = 36;
const RESULT_TABS = [
  ['assistant', '对话'],
  ['chart', '命盘'],
  ['dayun', '大运'],
  ['report', '报告'],
  ['member', '会员'],
] as const;
const DEMO_PILLARS = [
  { label: '年', ganZhi: '乙亥' },
  { label: '月', ganZhi: '庚辰' },
  { label: '日', ganZhi: '丙午' },
  { label: '时', ganZhi: '丙申' },
];

function MicIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="9" y="2" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 11a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 18v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function XuanYinScenePage() {
  const [phase, setPhase] = useState<Phase>('dialogue');
  const [step, setStep] = useState<DialogueStepId>('greet_gender');
  const [collected, setCollected] = useState<CollectedBirth>(INITIAL_COLLECTED);
  const [mood, setMood] = useState<CharacterMood>('speaking');
  const [log, setLog] = useState<LogItem[]>([]);
  const [currentLine, setCurrentLine] = useState<Line>(OPENING_LINES[0]);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<ResultTab>('chart');
  const [inkOn, setInkOn] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);
  const idRef = useRef(1);
  const openedRef = useRef(false);
  const speakGenRef = useRef(0);
  const [lipPulse, setLipPulse] = useState(0);

  const { shown, done: typeDone } = useTypewriter(
    currentLine.text,
    phase === 'dialogue' && mood === 'speaking',
    TYPE_MS,
  );

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log, shown, phase]);

  useEffect(() => {
    void warmVoices();
    return () => {
      speakGenRef.current += 1;
      cancelSpeech();
    };
  }, []);

  const speakAsXuan = useCallback((lines: Line[], then?: () => void) => {
    if (!lines.length) {
      then?.();
      return;
    }
    const gen = ++speakGenRef.current;
    cancelSpeech();
    const [first, ...rest] = lines;
    setMood('speaking');
    setCurrentLine(first);
    setLog((prev) => [...prev, { ...first, id: `x${idRef.current++}`, typed: true }]);

    const typeMs = Math.max(700, first.text.length * TYPE_MS + 240);
    const typeWait = new Promise<void>((r) => window.setTimeout(r, typeMs));
    const voiceWait = speakText(first.text, {
      onBoundary: () => {
        if (speakGenRef.current === gen) setLipPulse((n) => n + 1);
      },
    });

    void Promise.all([typeWait, voiceWait]).then(() => {
      if (speakGenRef.current !== gen) return;
      setMood('idle');
      if (rest.length) speakAsXuan(rest, then);
      else then?.();
    });
  }, []);

  /** 出场：先自我介绍，再问性别 */
  useEffect(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    setBusy(true);
    speakAsXuan(OPENING_LINES, () => setBusy(false));
  }, [speakAsXuan]);

  const canTalk = phase === 'dialogue' || (phase === 'result' && tab === 'assistant');

  const submitUser = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text || busy || !canTalk) return;
      speakGenRef.current += 1;
      cancelSpeech();
      setBusy(true);
      setListening(false);
      setInput('');
      setLog((prev) => [...prev, { role: 'user', text, id: `u${idRef.current++}` }]);
      setMood('thinking');

      window.setTimeout(() => {
        const result = advanceDialogue(step, text, collected);
        setStep(result.nextStep);
        setCollected(result.collected);

        speakAsXuan(result.xuanLines, () => {
          setBusy(false);
          if (result.openChart) {
            setInkOn(true);
            setPhase('ink');
            window.setTimeout(() => {
              setPhase('result');
              setTab('chart');
              setInkOn(false);
            }, 1200);
          }
        });
      }, THINK_MS);
    },
    [busy, canTalk, step, collected, speakAsXuan],
  );

  const onChoice = (id: string) => {
    if (id === 'confirm') submitUser('可是如此');
    else if (id === 'edit') submitUser('不对');
    else submitUser(id);
  };

  const toggleMic = () => {
    if (busy || !canTalk) return;
    const SR =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : undefined;
    if (!SR) {
      // 无 Web Speech 时：模拟聆听态，提示用文字
      setListening((v) => !v);
      if (!listening) {
        setMood('listening');
        window.setTimeout(() => {
          setListening(false);
          setMood('idle');
          setInput((prev) => prev || '（请改用下方文字输入；本环境未启用语音识别）');
        }, 1600);
      } else {
        setMood('idle');
      }
      return;
    }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      setMood('idle');
      return;
    }

    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = 'zh-CN';
    rec.interimResults = true;
    rec.continuous = false;
    rec.onstart = () => {
      setListening(true);
      setMood('listening');
    };
    rec.onresult = (ev: { resultIndex: number; results: { length: number; [i: number]: { 0: { transcript: string }; isFinal: boolean } } }) => {
      let transcript = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        transcript += ev.results[i][0].transcript;
      }
      setInput(transcript);
      if (ev.results[ev.results.length - 1].isFinal) {
        submitUser(transcript);
      }
    };
    rec.onerror = () => {
      setListening(false);
      setMood('idle');
    };
    rec.onend = () => {
      setListening(false);
      if (mood === 'listening') setMood('idle');
    };
    rec.start();
  };

  const backToAssistant = () => {
    // 保持 result 相位，底部 5 Tab 不消失；助手 Tab 内继续与沈知微对话
    setPhase('result');
    const switching = tab !== 'assistant';
    setTab('assistant');
    setStep((s) => (s === 'closing_chart' ? 'done' : s));
    if (!switching) return;
    const line: Line = {
      role: 'xuan',
      text: '命盘已经排好。您还想问哪一件事？大运、流年，或心里的事，都可以说。',
    };
    setBusy(true);
    speakAsXuan([line], () => setBusy(false));
  };

  const showDialogueStage = phase !== 'result' || tab === 'assistant';

  return (
    <div className="xy-scene" data-phase={phase}>
      <SceneAtmosphere />
      <div className={`xy-ink-veil ${inkOn ? 'xy-ink-veil--on' : ''}`} />

      {showDialogueStage ? (
        <div className={`xy-stage ${phase === 'result' ? 'xy-stage--with-tabs' : ''}`}>
          <div className="xy-topbar">
            <Link href="/">返回填写页</Link>
            <span className="xy-brand">{phase === 'result' ? '继续对话' : '沈知微'}</span>
            <span />
          </div>

          <XuanYinCharacter mood={mood} lipPulse={lipPulse} />

          <div className="xy-log" ref={logRef} aria-live="polite" aria-relevant="additions">
            {(mood === 'speaking' && !typeDone ? log.slice(0, -1) : log).map((item) => (
              <div key={item.id} className={`xy-log-item xy-log-item--${item.role === 'xuan' ? 'xuan' : 'user'}`}>
                <span className="xy-log-name">{item.role === 'xuan' ? '沈知微' : '您'}</span>
                <div className="xy-log-bubble">{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <ResultShell tab={tab} setTab={setTab} collected={collected} onAssistant={backToAssistant} />
      )}

      {canTalk ? (
        <div className={`xy-dock ${phase === 'result' ? 'xy-dock--with-tabs' : ''}`}>
          <div className="xy-line-box">
            <div className="xy-line-head">
              <span className="xy-seal">沈知微</span>
              <Waveform variant="xuan" active={mood === 'speaking'} />
              <Waveform variant="user" active={listening} />
            </div>
            <p className="xy-line-text">
              {mood === 'speaking' ? shown : currentLine.text}
              {mood === 'speaking' && !typeDone ? <span className="xy-caret" /> : null}
            </p>
            {currentLine.choices && typeDone && mood !== 'speaking' ? (
              <div className="xy-choices" role="group" aria-label="确认选项">
                {currentLine.choices.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`xy-choice ${c.id === 'edit' ? '' : 'xy-choice--primary'}`}
                    onClick={() => onChoice(c.id)}
                    disabled={busy}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <form
            className="xy-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              submitUser(input);
            }}
          >
            <button
              type="button"
              className="xy-mic"
              aria-label={listening ? '停止聆听' : '语音输入'}
              aria-pressed={listening}
              disabled={busy}
              onClick={toggleMic}
            >
              <MicIcon />
              <span className="xy-mic-label">{listening ? '停止' : '说话'}</span>
            </button>
            <input
              className="xy-text-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="请在这里打字"
              aria-label="对话输入"
              disabled={busy}
              autoComplete="off"
            />
            <button type="submit" className="xy-send" disabled={busy || !input.trim()}>
              发送
            </button>
          </form>
          <p className="xy-hint">可以说话，也可以打字。确认生日时请点「对，就是这样」。</p>
        </div>
      ) : null}

      {phase === 'result' && tab === 'assistant' ? (
        <nav className="xy-tabs" aria-label="结果导航">
          {(RESULT_TABS).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className="xy-tab"
              aria-selected={tab === id}
              onClick={() => {
                if (id === 'assistant') {
                  if (tab !== 'assistant') backToAssistant();
                } else setTab(id);
              }}
            >
              {label}
            </button>
          ))}
        </nav>
      ) : null}
    </div>
  );
}

function ResultShell({
  tab,
  setTab,
  collected,
  onAssistant,
}: {
  tab: ResultTab;
  setTab: (t: ResultTab) => void;
  collected: CollectedBirth;
  onAssistant: () => void;
}) {
  return (
    <div className="xy-result">
      <div className="xy-topbar" style={{ padding: '12px 16px 0' }}>
        <Link href="/">返回填写页</Link>
        <span className="xy-brand">命盘已排好</span>
        <span />
      </div>
      <div className="xy-result-body">
        {tab === 'chart' ? (
          <section className="xy-result-panel" aria-label="命盘">
            <h2>命盘</h2>
            <p>
              {collected.gender === 'female' ? '女士' : collected.gender === 'male' ? '男士' : ''}
              {collected.birthSummary ? ` · ${collected.birthSummary}` : ''}
              {collected.place ? ` · ${collected.place}` : ''}
            </p>
            <p>下面是示意命盘，方便您先看版式。正式版会接入真实排盘。</p>
            <div className="xy-pillars">
              {DEMO_PILLARS.map((p) => (
                <div key={p.label} className="xy-pillar">
                  <span>{p.label}</span>
                  <strong>{p.ganZhi}</strong>
                </div>
              ))}
            </div>
          </section>
        ) : null}
        {tab === 'dayun' ? (
          <section className="xy-result-panel">
            <h2>大运 · 流年</h2>
            <p>这里稍后会显示大运格子。现在先占位。</p>
          </section>
        ) : null}
        {tab === 'report' ? (
          <section className="xy-result-panel">
            <h2>命理分析报告</h2>
            <p>完整报告仍走现有分析。这里先由沈知微帮您采集生辰、回答追问。</p>
          </section>
        ) : null}
        {tab === 'member' ? (
          <section className="xy-result-panel">
            <h2>会员</h2>
            <p>可在经典填写页查看会员方案。</p>
            <Link href="/">前往填写页查看会员方案</Link>
          </section>
        ) : null}
      </div>
      <nav className="xy-tabs" aria-label="结果导航">
          {(RESULT_TABS).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className="xy-tab"
            aria-selected={tab === id}
            onClick={() => {
              if (id === 'assistant') onAssistant();
              else setTab(id);
            }}
          >
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}

declare global {
  // Web Speech API（部分浏览器仅提供 webkit 前缀）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}
