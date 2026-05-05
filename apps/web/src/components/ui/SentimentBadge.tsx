import type { SentimentLabel } from '@wpn/shared-types';

interface Props {
  label: SentimentLabel;
}

const STYLES: Record<SentimentLabel, string> = {
  'sehr negativ': 'bg-red-100 text-red-800',
  negativ: 'bg-orange-100 text-orange-800',
  neutral: 'bg-yellow-100 text-yellow-800',
  positiv: 'bg-green-100 text-green-800',
  'sehr positiv': 'bg-emerald-100 text-emerald-800',
};

export function SentimentBadge({ label }: Props) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STYLES[label]}`}>
      {label}
    </span>
  );
}
