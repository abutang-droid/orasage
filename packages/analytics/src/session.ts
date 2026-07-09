const SESSION_STORAGE_KEY = "orasage_analytics_sid";

function randomHex(bytes: number): string {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buf = new Uint8Array(bytes);
    crypto.getRandomValues(buf);
    return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`.padEnd(bytes * 2, "0").slice(0, bytes * 2);
}

export function getOrCreateSessionKey(): string {
  if (typeof window === "undefined") return randomHex(16);
  try {
    const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (existing && /^[a-f0-9]{32,64}$/i.test(existing)) return existing;
    const next = randomHex(16);
    window.localStorage.setItem(SESSION_STORAGE_KEY, next);
    return next;
  } catch {
    return randomHex(16);
  }
}
