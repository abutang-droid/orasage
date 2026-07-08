import fs from "fs";
import path from "path";

/**
 * 报告 HTML 持久化目录。
 *
 * 优先读 REPORTS_DIR 环境变量（生产部署应指向 dist 之外的持久目录，
 * 例如 /var/lib/orasage/bazi-reports）：dist/ 在每次部署时由 root 重建，
 * 既会清空历史报告，也会因属主变为 root 导致运行用户 EACCES 写入失败。
 * 未设置时退回旧行为（dist/public/reports）。
 */
export function resolveReportsDir(): string {
  const fromEnv = process.env.REPORTS_DIR?.trim();
  const dir = fromEnv
    ? fromEnv
    : process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public", "reports")
      : path.resolve(import.meta.dirname, "public", "reports");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}
