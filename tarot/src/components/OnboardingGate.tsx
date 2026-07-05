'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/lib/user';

const BYPASS_PREFIXES = ['/onboarding', '/login', '/api'];

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useUser();

  useEffect(() => {
    if (loading) return;
    if (BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) return;
    if (user && user.onboardingCompleted !== true) {
      router.replace('/onboarding');
    }
  }, [loading, user, pathname, router]);

  return children;
}
