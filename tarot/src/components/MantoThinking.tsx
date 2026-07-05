'use client';

type MantoThinkingProps = {
  message?: string;
  hint?: string;
};

/** Manto 思考中过场 —— 拉取问题 / 抽牌 / 生成解读时展示 */
export function MantoThinking({
  message = 'Manto 正在思索…',
  hint = '请稍候，连接正常',
}: MantoThinkingProps) {
  return (
    <div className="manto-thinking card animate-fade-in-up">
      <div className="manto-thinking-visual" aria-hidden>
        <div className="manto-thinking-ring" />
        <div className="manto-thinking-core">✦</div>
      </div>
      <p className="manto-thinking-message">{message}</p>
      <p className="manto-thinking-hint">{hint}</p>
      <div className="manto-thinking-dots" aria-hidden>
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
