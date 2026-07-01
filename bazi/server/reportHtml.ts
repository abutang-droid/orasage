/**
 * 轻量 Markdown → HTML 渲染器
 *
 * 仅处理 LLM 输出中常见的标记：
 * - ### / ## / # 标题
 * - **粗体**
 * - - 无序列表项
 * - 空行分隔段落
 *
 * 先转义 HTML，再应用 Markdown 规则，确保顺序安全。
 */

/** 将一段 Markdown 文本转为安全的 HTML 片段 */
export function renderMarkdown(md: string): string {
  // ① 先对原始 Markdown 转义 HTML 实体
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // ② 标题（在转义后的文本上匹配——正则 `^#` 匹配的是行首，不受转义影响）
  html = html
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // ③ 粗体
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // ④ 无序列表：收集连续的 <li>...</li> 行，包裹 <ul>
  const lines = html.split("\n");
  const result: string[] = [];
  let pendingLi: string[] = [];

  function flushLi() {
    if (pendingLi.length > 0) {
      result.push("<ul>" + pendingLi.join("") + "</ul>");
      pendingLi = [];
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const liMatch = line.match(/^<li>(.+)<\/li>$/);
    if (liMatch) {
      // 先转义 li 内容中的 `-` ← 已在 HTML 转义阶段处理，此处安全
      pendingLi.push(line);
    } else {
      flushLi();
      // 空行 → 段落分隔
      if (line.trim() === "") {
        // 跳过连续空行
        if (result.length > 0 && result[result.length - 1] !== "</p>") {
          // 不在这里插入，下面统一处理段落
        }
        result.push("");
      } else {
        result.push(line);
      }
    }
  }
  flushLi();

  html = result.join("\n");

  // ⑤ 段落：用空行分隔的连续文本块包裹 <p>
  const blocks = html.split(/\n{2,}/);
  const wrapped: string[] = [];
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    // 已经是块级元素，不包裹
    if (/^<(h[1-3]|ul|ol|table|blockquote|pre|div)/.test(trimmed)) {
      wrapped.push(trimmed);
    } else {
      // 纯文本或 inline 元素，包裹 <p>
      wrapped.push("<p>" + trimmed.replace(/\n/g, "<br>") + "</p>");
    }
  }

  return wrapped.join("\n");
}
