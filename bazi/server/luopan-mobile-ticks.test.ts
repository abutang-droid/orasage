/**
 * 回归：手机浏览器上罗盘数字飞出环外。
 * 禁止 CSS 整环/刻度 rotate，禁止窄屏写死 dial 高度。
 */
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../client/src/pages/luopan");
const css = fs.readFileSync(path.join(root, "luopan.css"), "utf8");
const engine = fs.readFileSync(path.join(root, "engine.js"), "utf8");

describe("luopan mobile tick invariants", () => {
  it("does not lock dial height on narrow screens", () => {
    expect(css).not.toMatch(/\.dial\s*\{[^}]*height\s*:\s*340px/);
    expect(css).toMatch(/max-width:\s*340px/);
    expect(css).toMatch(/aspect-ratio:\s*1\/1/);
  });

  it("does not CSS-rotate ring groups or tick labels", () => {
    // 曾用 transform-origin:210px + will-change 配合 CSS rotate，窄屏必炸
    expect(css).not.toMatch(/\.ring-g\s*\{[^}]*will-change:\s*transform/);
    expect(css).not.toMatch(/\.ring-g\s*\{[^}]*transform-origin:\s*210px/);
    expect(css).not.toMatch(/\.tick-t\{[^}]*transform-box:\s*fill-box/);
    expect(css).not.toMatch(/\.hour-t\{[^}]*transform-box:\s*fill-box/);
    expect(css).not.toMatch(/\.min-t\{[^}]*transform-box:\s*fill-box/);
  });

  it("spins rings and uprights labels in SVG user space", () => {
    expect(engine).toContain("function spinRing");
    expect(engine).toContain("function uprightLabel");
    expect(engine).toMatch(/setAttribute\(\s*["']transform["']\s*,\s*`rotate\(\$\{R\.th\} \$\{C\} \$\{C\}\)`/);
    expect(engine).not.toMatch(/R\.g\.style\.transform\s*=\s*`rotate\(\$\{R\.th\}deg\)`/);
    expect(engine).not.toMatch(/t\.style\.transform\s*=\s*`rotate\(/);
  });
});
