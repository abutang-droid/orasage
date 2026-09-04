/** 浏览器 SpeechSynthesis TTS（沈知微场景） */

export type SpeakOptions = {
  lang?: string;
  rate?: number;
  pitch?: number;
  onBoundary?: () => void;
};

function pickZhVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const prefer = [
    (v: SpeechSynthesisVoice) => /zh(-|_)CN/i.test(v.lang) && /female|女|ting|xiaoxiao|xiaoyi|yaoyao/i.test(v.name),
    (v: SpeechSynthesisVoice) => /zh(-|_)CN/i.test(v.lang),
    (v: SpeechSynthesisVoice) => /^zh/i.test(v.lang),
  ];
  for (const pred of prefer) {
    const hit = voices.find(pred);
    if (hit) return hit;
  }
  return null;
}

/** 确保 voices 列表已加载（Chrome 首次为空） */
export function warmVoices(): Promise<void> {
  if (typeof window === 'undefined' || !window.speechSynthesis) return Promise.resolve();
  const syn = window.speechSynthesis;
  if (syn.getVoices().length) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      syn.removeEventListener('voiceschanged', done);
      resolve();
    };
    syn.addEventListener('voiceschanged', done);
    // 兜底
    window.setTimeout(done, 800);
  });
}

export function cancelSpeech(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

/**
 * 朗读文本；无 SpeechSynthesis 时按字数估算时长后 resolve。
 */
export function speakText(text: string, opts: SpeakOptions = {}): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return Promise.resolve();

  if (typeof window === 'undefined' || !window.speechSynthesis) {
    const ms = Math.max(800, trimmed.length * 90);
    return new Promise((r) => window.setTimeout(r, ms));
  }

  const syn = window.speechSynthesis;
  syn.cancel();

  return warmVoices().then(
    () =>
      new Promise<void>((resolve) => {
        const u = new SpeechSynthesisUtterance(trimmed);
        u.lang = opts.lang || 'zh-CN';
        u.rate = opts.rate ?? 0.95;
        u.pitch = opts.pitch ?? 1.05;
        const voice = pickZhVoice();
        if (voice) u.voice = voice;

        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          resolve();
        };

        u.onend = finish;
        u.onerror = finish;
        u.onboundary = () => opts.onBoundary?.();

        // 部分浏览器长暂停会卡住，加硬超时
        const hardMs = Math.max(4000, trimmed.length * 220 + 1500);
        const timer = window.setTimeout(() => {
          syn.cancel();
          finish();
        }, hardMs);

        const origEnd = finish;
        u.onend = () => {
          window.clearTimeout(timer);
          origEnd();
        };
        u.onerror = () => {
          window.clearTimeout(timer);
          origEnd();
        };

        syn.speak(u);
      }),
  );
}
