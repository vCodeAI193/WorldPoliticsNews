'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

interface Props {
  slot: string;
  format?: string;
  className?: string;
}

export function AdBanner({ slot, format = 'auto', className = '' }: Props) {
  const { user } = useAuthStore();

  // Plus-Abonnenten sehen keine Werbung
  if (user?.subscriptionTier === 'plus') return null;

  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {}
  }, []);

  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  if (!adsenseId) return null;

  return (
    <div className={`my-4 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adsenseId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
