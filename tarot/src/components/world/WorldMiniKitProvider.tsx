'use client';

import { MiniKitProvider } from '@worldcoin/minikit-js/minikit-provider';
import type { ReactNode } from 'react';

/** Initializes MiniKit for World App webview. */
export function WorldMiniKitProvider({ children }: { children: ReactNode }) {
  return <MiniKitProvider>{children}</MiniKitProvider>;
}
