import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import type { ArticleSnippet, SentimentLabel } from '@wpn/shared-types';

interface Props {
  article: ArticleSnippet;
  index: number;
}

function toLabel(score: number): SentimentLabel {
  if (score <= -0.6) return 'sehr negativ';
  if (score <= -0.2) return 'negativ';
  if (score < 0.2) return 'neutral';
  if (score < 0.6) return 'positiv';
  return 'sehr positiv';
}

const BADGE_COLORS: Record<SentimentLabel, { bg: string; text: string }> = {
  'sehr negativ': { bg: '#fee2e2', text: '#dc2626' },
  negativ: { bg: '#ffedd5', text: '#ea580c' },
  neutral: { bg: '#fef9c3', text: '#ca8a04' },
  positiv: { bg: '#dcfce7', text: '#16a34a' },
  'sehr positiv': { bg: '#d1fae5', text: '#059669' },
};

export function ArticleCard({ article, index }: Props) {
  const label = toLabel(article.sentiment);
  const badge = BADGE_COLORS[label];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => Linking.openURL(article.url).catch(() => {})}
      activeOpacity={0.7}
    >
      <View style={styles.meta}>
        <Text style={styles.metaNum}>#{index + 1}</Text>
        <Text style={styles.metaSource}>{article.source}</Text>
        <Text style={styles.metaDate}>{article.date}</Text>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.text }]}>{label}</Text>
        </View>
      </View>
      <Text style={styles.title} numberOfLines={2}>{article.title}</Text>
      <Text style={styles.snippet} numberOfLines={3}>{article.snippet}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fafafa',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  metaNum: { fontSize: 11, color: '#9ca3af' },
  metaSource: { fontSize: 11, color: '#3b82f6', fontWeight: '600' },
  metaDate: { fontSize: 11, color: '#9ca3af' },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
    marginLeft: 'auto',
  },
  badgeText: { fontSize: 10, fontWeight: '700' },
  title: { fontSize: 14, fontWeight: '600', color: '#111827', lineHeight: 20 },
  snippet: { fontSize: 13, color: '#6b7280', marginTop: 4, lineHeight: 18 },
});
