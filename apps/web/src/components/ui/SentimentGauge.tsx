'use client';

import type { SentimentLabel } from '@wpn/shared-types';

interface Props {
  score: number;
  label: SentimentLabel;
  size?: 'sm' | 'md' | 'lg';
}

const LABEL_COLORS: Record<SentimentLabel, string> = {
  'sehr negativ': '#dc2626',
  negativ: '#f97316',
  neutral: '#eab308',
  positiv: '#22c55e',
  'sehr positiv': '#16a34a',
};

export function SentimentGauge({ score, label, size = 'md' }: Props) {
  const pct = ((score + 1) / 2) * 100;
  const color = LABEL_COLORS[label];
  const trackH = size === 'sm' ? 'h-2' : size === 'lg' ? 'h-5' : 'h-4';
  const dotSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  return (
    <div className="flex flex-col gap-2">
      <div className={`w-full ${trackH} bg-gradient-to-r from-red-600 via-yellow-400 to-green-500 rounded-full relative`}>
        <div
          className={`absolute top-1/2 -translate-y-1/2 ${dotSize} bg-white border-2 rounded-full shadow-md transition-all`}
          style={{ left: `calc(${pct}% - ${size === 'sm' ? 6 : size === 'lg' ? 12 : 10}px)`, borderColor: color }}
        />
      </div>
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400">Sehr negativ</span>
        <span className="text-sm font-semibold" style={{ color }}>
          {label} ({score > 0 ? '+' : ''}{score.toFixed(2)})
        </span>
        <span className="text-xs text-gray-400">Sehr positiv</span>
      </div>
    </div>
  );
}
