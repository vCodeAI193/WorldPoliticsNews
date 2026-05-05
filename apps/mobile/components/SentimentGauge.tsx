import { View, Text, StyleSheet } from 'react-native';
import type { SentimentLabel } from '@wpn/shared-types';

interface Props {
  score: number;
  label: SentimentLabel;
}

const COLORS: Record<SentimentLabel, string> = {
  'sehr negativ': '#dc2626',
  negativ: '#f97316',
  neutral: '#eab308',
  positiv: '#22c55e',
  'sehr positiv': '#16a34a',
};

export function SentimentGauge({ score, label }: Props) {
  const pct = ((score + 1) / 2) * 100;
  const color = COLORS[label];
  // dot position: clamp between 5% and 95% to keep it visible
  const dotLeft = Math.max(5, Math.min(95, pct));

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.dot, { left: `${dotLeft}%` as any, borderColor: color }]} />
      </View>
      <View style={styles.labels}>
        <Text style={styles.labelSide}>Sehr negativ</Text>
        <Text style={[styles.labelCenter, { color }]}>
          {label} ({score > 0 ? '+' : ''}{score.toFixed(2)})
        </Text>
        <Text style={styles.labelSide}>Sehr positiv</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 4 },
  track: {
    height: 14,
    borderRadius: 7,
    backgroundColor: '#e5e7eb',
    overflow: 'visible',
    position: 'relative',
    // Gradient via multiple colored segments
    background: 'linear-gradient(to right, #dc2626, #eab308, #16a34a)' as any,
  },
  dot: {
    position: 'absolute',
    top: -3,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 2.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    marginLeft: -10,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  labelSide: { fontSize: 10, color: '#9ca3af' },
  labelCenter: { fontSize: 13, fontWeight: '700' },
});
