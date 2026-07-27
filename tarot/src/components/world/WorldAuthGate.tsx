'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useMiniKit } from '@worldcoin/minikit-js/minikit-provider';
import {
  isWorldAuthRequired,
  isWorldIdkitEnabled,
  signInWithWorldWallet,
} from '@/lib/world-minikit';
import { WorldIdkitButton } from './WorldIdkitButton';

type GateState = 'checking' | 'need_login' | 'ready';

/**
 * When WORLD_AUTH_REQUIRED is on, block the app until World login succeeds
 * (IDKit World ID and/or MiniKit SIWE walletAuth → orasage_token).
 */
export function WorldAuthGate({ children }: { children: ReactNode }) {
  const required = isWorldAuthRequired();
  const idkitEnabled = isWorldIdkitEnabled();
  const { isInstalled } = useMiniKit();
  const [state, setState] = useState<GateState>(required ? 'checking' : 'ready');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const autoStarted = useRef(false);

  const finishLogin = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete('world_login');
    const after = url.searchParams.get('redirect');
    if (after) {
      try {
        const u = new URL(after, window.location.origin);
        if (u.origin === window.location.origin) {
          window.location.href = u.toString();
          return;
        }
      } catch {
        /* fall through */
      }
    }
    window.location.replace(`${url.pathname}${url.search}${url.hash}` || '/');
  }, []);

  useEffect(() => {
    if (!required) {
      setState('ready');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/world/session', { credentials: 'include', cache: 'no-store' });
        const data = (await res.json()) as { loggedIn?: boolean };
        if (!cancelled) setState(data.loggedIn ? 'ready' : 'need_login');
      } catch {
        if (!cancelled) setState('need_login');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [required]);

  const onWalletSignIn = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      await signInWithWorldWallet({
        statement: 'Sign in to OriCosmos with your World wallet',
      });
      finishLogin();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'World login failed';
      setError(
        msg === 'WORLD_APP_REQUIRED'
          ? 'Please open OriCosmos inside World App to sign in.'
          : msg,
      );
    } finally {
      setBusy(false);
    }
  }, [finishLogin]);

  // Auto-start walletAuth when redirected with ?world_login=1 (legacy path).
  // Prefer IDKit when configured — user taps Verify with World ID.
  useEffect(() => {
    if (state !== 'need_login' || busy || autoStarted.current) return;
    if (typeof window === 'undefined') return;
    if (idkitEnabled) return;
    if (isInstalled !== true) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('world_login') !== '1') return;
    autoStarted.current = true;
    void onWalletSignIn();
  }, [state, busy, onWalletSignIn, isInstalled, idkitEnabled]);

  if (!required || state === 'ready') {
    return <>{children}</>;
  }

  if (state === 'checking' || (!idkitEnabled && isInstalled === undefined)) {
    return (
      <div className="world-auth-gate">
        <p className="world-auth-gate-title">Connecting…</p>
        <p className="world-auth-gate-hint">
          {!idkitEnabled && isInstalled === undefined
            ? 'Initializing World App…'
            : 'Checking World session'}
        </p>
      </div>
    );
  }

  const miniKitReady = isInstalled === true;

  return (
    <div className="world-auth-gate">
      <p className="world-auth-gate-brand">OriCosmos</p>
      <h1 className="world-auth-gate-title">Sign in with World</h1>
      <p className="world-auth-gate-hint">
        Verify with World ID to enter. Payments use your World wallet (WLD).
      </p>
      {!idkitEnabled && !miniKitReady ? (
        <p className="world-auth-gate-warn">
          MiniKit not detected. Open this URL inside World App to continue.
        </p>
      ) : null}
      {error ? <p className="world-auth-gate-error">{error}</p> : null}

      {idkitEnabled ? (
        <WorldIdkitButton
          disabled={busy}
          onSuccessLogin={finishLogin}
          onError={(msg) => setError(msg)}
        />
      ) : null}

      <button
        type="button"
        className={
          idkitEnabled
            ? 'world-auth-gate-cta world-auth-gate-cta-secondary'
            : 'world-auth-gate-cta os-solid-cta'
        }
        disabled={busy || !miniKitReady}
        onClick={() => void onWalletSignIn()}
      >
        {busy ? 'Waiting for World…' : 'Continue with World Wallet'}
      </button>
    </div>
  );
}
