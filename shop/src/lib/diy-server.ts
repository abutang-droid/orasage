import { ENV } from './env';
import { FALLBACK_DIY_CONFIG, type DiyCatalog } from './diy';

export async function fetchDiyCatalog(): Promise<DiyCatalog> {
  try {
    const res = await fetch(`${ENV.authInternalUrl}/api/diy/catalog`, {
      next: { revalidate: 60 },
    } as RequestInit);
    if (!res.ok) throw new Error(`diy catalog ${res.status}`);
    const data = await res.json() as DiyCatalog;
    return {
      beads: (data.beads ?? []).filter((b) => b && b.code),
      config: data.config ?? FALLBACK_DIY_CONFIG,
    };
  } catch (err) {
    console.warn('[shop] fetchDiyCatalog failed:', err);
    return { beads: [], config: FALLBACK_DIY_CONFIG };
  }
}
