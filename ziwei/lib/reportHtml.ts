/** 轻量 Markdown → HTML（与 bazi/server/reportHtml.ts 保持一致） */
export function renderMarkdown(md: string): string {
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>');

  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  const lines = html.split('\n');
  const result: string[] = [];
  let pendingLi: string[] = [];

  function flushLi() {
    if (pendingLi.length > 0) {
      result.push('<ul>' + pendingLi.join('') + '</ul>');
      pendingLi = [];
    }
  }

  for (const line of lines) {
    if (/^<li>/.test(line)) {
      pendingLi.push(line);
    } else {
      flushLi();
      result.push(line.trim() === '' ? '' : line);
    }
  }
  flushLi();

  html = result.join('\n');
  const blocks = html.split(/\n{2,}/);
  const wrapped: string[] = [];
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    if (/^<(h[1-3]|ul|ol|table|blockquote|pre|div)/.test(trimmed)) {
      wrapped.push(trimmed);
    } else {
      wrapped.push('<p>' + trimmed.replace(/\n/g, '<br>') + '</p>');
    }
  }
  return wrapped.join('\n');
}
