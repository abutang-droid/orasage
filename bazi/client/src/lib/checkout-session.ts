import type { SingleBaziResult, DoubleBaziResult } from '@/lib/bazi';

export type CheckoutResultSnapshot =
  | { type: 'single'; data: SingleBaziResult }
  | { type: 'double'; data: DoubleBaziResult };

const RESULT_KEY = 'bazi:checkoutResult';
const MODE_KEY = 'bazi:checkoutMode';

export function saveCheckoutSnapshot(result: CheckoutResultSnapshot, mode: 'single' | 'couple') {
  try {
    sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
    sessionStorage.setItem(MODE_KEY, mode);
  } catch { /* ignore quota */ }
}

export function loadCheckoutSnapshot(): { result: CheckoutResultSnapshot; mode: 'single' | 'couple' } | null {
  try {
    const raw = sessionStorage.getItem(RESULT_KEY);
    const mode = sessionStorage.getItem(MODE_KEY);
    if (!raw || (mode !== 'single' && mode !== 'couple')) return null;
    return { result: JSON.parse(raw) as CheckoutResultSnapshot, mode };
  } catch {
    return null;
  }
}

export function clearCheckoutSnapshot() {
  try {
    sessionStorage.removeItem(RESULT_KEY);
    sessionStorage.removeItem(MODE_KEY);
  } catch { /* ignore */ }
}
