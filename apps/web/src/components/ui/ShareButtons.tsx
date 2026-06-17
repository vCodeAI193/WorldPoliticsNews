'use client';

import { useState } from 'react';

interface Props {
  entityName: string;
  sentimentLabel: string;
}

export function ShareButtons({ entityName, sentimentLabel }: Props) {
  const [copied, setCopied] = useState(false);

  const url = typeof window !== 'undefined' ? window.location.href : '';
  const text = `KI-Analyse zu ${entityName}: Sentiment "${sentimentLabel}" – WorldPoliticsNews`;

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  function shareTwitter() {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank',
      'noopener,noreferrer'
    );
  }

  function shareWhatsApp() {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
      '_blank',
      'noopener,noreferrer'
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-gray-400 font-medium">Teilen:</span>
      <button
        onClick={shareTwitter}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors"
      >
        𝕏 Twitter
      </button>
      <button
        onClick={shareWhatsApp}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-medium hover:bg-green-600 transition-colors"
      >
        WhatsApp
      </button>
      <button
        onClick={copyLink}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 transition-colors"
      >
        {copied ? '✓ Kopiert!' : '🔗 Link'}
      </button>
    </div>
  );
}
