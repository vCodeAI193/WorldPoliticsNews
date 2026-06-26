interface HistoryPoint {
  sentiment: number;
  sentimentLabel: string;
  generatedAt: string;
}

interface Props {
  data: HistoryPoint[];
}

const STROKE_COLOR: Record<string, string> = {
  'sehr positiv': '#16a34a',
  'positiv':      '#65a30d',
  'neutral':      '#6b7280',
  'negativ':      '#ea580c',
  'sehr negativ': '#dc2626',
};

export function SentimentHistory({ data }: Props) {
  if (data.length < 2) {
    return (
      <p className="text-sm text-gray-400 italic">
        Noch nicht genug Verlaufsdaten vorhanden. Mehrere Analysen werden benötigt.
      </p>
    );
  }

  const W = 400, H = 80, PAD = 8;
  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;

  const coords = data.map((d, i) => {
    const x = PAD + (i / (data.length - 1)) * innerW;
    const y = PAD + (1 - (d.sentiment + 1) / 2) * innerH;
    return { x, y, ...d };
  });

  const polyline = coords.map((c) => `${c.x},${c.y}`).join(' ');
  const last = coords[coords.length - 1];
  const strokeColor = STROKE_COLOR[last.sentimentLabel] ?? '#6b7280';

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-20"
        aria-label="Sentiment-Verlauf"
      >
        {/* Zero line */}
        <line
          x1={PAD} y1={PAD + innerH / 2}
          x2={W - PAD} y2={PAD + innerH / 2}
          stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4"
        />
        <polyline
          points={polyline}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r="3" fill={strokeColor} />
        ))}
      </svg>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{new Date(data[0].generatedAt).toLocaleDateString('de-DE')}</span>
        <span>{new Date(data[data.length - 1].generatedAt).toLocaleDateString('de-DE')}</span>
      </div>
    </div>
  );
}
