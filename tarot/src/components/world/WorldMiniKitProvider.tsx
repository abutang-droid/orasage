'use client';

import { MiniKitProvider } from '@worldcoin/minikit-js/minikit-provider';
import type { ReactNode } from 'react';
import { worldAppId } from '@/lib/world-minikit';

/** Initializes MiniKit for World App webview. */
export function WorldMiniKitProvider({ children }: { children: ReactNode }) {
  const appId = worldAppId();
  return (
    <MiniKitProvider props={appId ? { appId } : undefined}>{children}</MiniKitProvider>
  );
}
