'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { useHomeCopy } from '@/lib/i18n/reading-copy';
import { useUser } from '@/lib/user';

const MANTO_PORTRAIT = '/images/manto-mentor.png';

export function TarotHomeGreeting() {
  const { user } = useUser();
  const home = useHomeCopy();

  const displayName = useMemo(() => {
    const name = user?.nickname?.trim();
    if (name && name !== home.traveler) return name;
    return null;
  }, [user?.nickname, home.traveler]);

  return (
    <header className="tarot-home-greeting animate-fade-in-up">
      <Image
        src={MANTO_PORTRAIT}
        alt=""
        width={40}
        height={40}
        className="tarot-home-greeting-avatar"
        aria-hidden
      />
      <div className="tarot-home-greeting-copy">
        <p className="tarot-home-greeting-text">
          {home.greeting()}
          {displayName ? `，${displayName}` : ''}
        </p>
        <p className="tarot-home-greeting-sub">{home.mentorFallback}</p>
      </div>
    </header>
  );
}
