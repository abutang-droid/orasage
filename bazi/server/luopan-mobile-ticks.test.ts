/**
 * 回归：手机浏览器上罗盘数字飞出环外。
 * 禁止 CSS 整环/刻度 rotate，禁止窄屏写死 dial 高度。
 *
 * 必须同时扫源码和 dist：只扫源码挡不住「overlay 一份旧 bazi/dist」把生产盖坏。
 */
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../client/src/pages/luopan");
const distAssets = path.resolve(here, "../dist/public/assets");
const cssRaw = fs.readFileSync(path.join(root, "luopan.css"), "utf8");
const css = cssRaw.replace(/\/\*[\s\S]*?\*\//g, "");
const engine = fs.readFileSync(path.join(root, "engine.js"), "utf8");

function readDistBundles() {
  if (!fs.existsSync(distAssets)) return null;
  const files = fs.readdirSync(distAssets);
  const cssName = files.find((f) => /^index-.*\.css$/.test(f));
  const jsName = files.find((f) => /^index-.*\.js$/.test(f));
  if (!cssName || !jsName) return null;
  return {
    css: fs.readFileSync(path.join(distAssets, cssName), "utf8"),
    js: fs.readFileSync(path.join(distAssets, jsName), "utf8"),
    cssName,
    jsName,
  };
}

describe("luopan mobile tick invariants", () => {
  it("does not lock dial height on narrow screens", () => {
    expect(css).not.toMatch(/\.dial\s*\{[^}]*height\s*:\s*340px/);
    expect(css).not.toMatch(/height:\s*340px/);
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
    expect(engine).toMatch(/R\.g\.style\.transform\s*=\s*[`'"]{2}/);
  });
});

const dist = readDistBundles();

describe.skipIf(!dist)("luopan mobile tick invariants (built dist)", () => {
  it("built CSS keeps a square dial and never locks height:340px", () => {
    const bundle = dist!.css.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(bundle).not.toMatch(/height:\s*340px/);
    expect(bundle).not.toMatch(/transform-origin:\s*210px/);
    expect(bundle).toMatch(/max-width:\s*340px/);
    expect(bundle).toMatch(/aspect-ratio:\s*1\/1/);
  });

  it("built JS rotates rings in SVG user space, not CSS deg", () => {
    const js = dist!.js;
    expect(js).toMatch(/setAttribute\("transform",`rotate\(/);
    expect(js).not.toMatch(/\.style\.transform=`rotate\(\$\{[^}]+\}deg\)`/);
  });
});
