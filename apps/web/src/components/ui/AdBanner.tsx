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
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  const isPlus = user?.subscriptionTier === 'plus';

  useEffect(() => {
    if (isPlus || !adsenseId) return;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {}
  }, [isPlus, adsenseId]);

  if (isPlus || !adsenseId) return null;

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
