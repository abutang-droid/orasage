const DEVICE_KEY = "orasage:device-id";

/** 本机稳定设备号，绑定游客排盘记录。 */
export function getDeviceId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_KEY)?.trim();
    if (existing && existing.length >= 8) return existing.slice(0, 64);
    const created =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(DEVICE_KEY, created);
    return created;
  } catch {
    return `mem-${Date.now().toString(36)}`;
  }
}
