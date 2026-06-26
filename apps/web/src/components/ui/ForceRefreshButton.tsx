'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  href: string;
}

export function ForceRefreshButton({ href }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      onClick={() => startTransition(() => router.push(href))}
      disabled={isPending}
      className="text-xs text-gray-400 hover:text-blue-600 flex items-center gap-1 transition-colors disabled:opacity-50"
      title="Cache umgehen und neue Analyse erzwingen"
    >
      {isPending ? '⟳ Lädt...' : '↻ Analyse aktualisieren'}
    </button>
  );
}
