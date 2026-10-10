import type { SingleBaziResult, DoubleBaziResult } from '@/lib/bazi';

export type CheckoutResultSnapshot =
  | { type: 'single'; data: SingleBaziResult }
  | { type: 'double'; data: DoubleBaziResult };

const RESULT_KEY = 'bazi:checkoutResult';
const MODE_KEY = 'bazi:checkoutMode';

function eachStore(fn: (store: Storage) => void) {
  for (const store of [sessionStorage, localStorage]) {
    try {
      fn(store);
    } catch {
      /* ignore quota / private mode */
    }
  }
}

export function saveCheckoutSnapshot(result: CheckoutResultSnapshot, mode: 'single' | 'couple') {
  const raw = JSON.stringify(result);
  eachStore((store) => {
    store.setItem(RESULT_KEY, raw);
    store.setItem(MODE_KEY, mode);
  });
}

export function loadCheckoutSnapshot(): { result: CheckoutResultSnapshot; mode: 'single' | 'couple' } | null {
  try {
    const raw = sessionStorage.getItem(RESULT_KEY) || localStorage.getItem(RESULT_KEY);
    const mode = sessionStorage.getItem(MODE_KEY) || localStorage.getItem(MODE_KEY);
    if (!raw || (mode !== 'single' && mode !== 'couple')) return null;
    return { result: JSON.parse(raw) as CheckoutResultSnapshot, mode };
  } catch {
    return null;
  }
}

export function clearCheckoutSnapshot() {
  eachStore((store) => {
    store.removeItem(RESULT_KEY);
    store.removeItem(MODE_KEY);
  });
}
