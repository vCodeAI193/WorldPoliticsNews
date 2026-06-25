import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { AdBanner } from '@/components/AdBanner';
import type { Entity, TrendingEntity } from '@wpn/shared-types';

const FEATURED: Entity[] = [
  { id: 'Q567', name: 'Friedrich Merz', type: 'politician', country: 'DE' },
  { id: 'Q3052772', name: 'Emmanuel Macron', type: 'politician', country: 'FR' },
  { id: 'Q22686', name: 'Donald Trump', type: 'politician', country: 'US' },
  { id: 'Q61053', name: 'Olaf Scholz', type: 'politician', country: 'DE' },
  { id: 'Q49762', name: 'CDU', type: 'party', country: 'DE' },
  { id: 'Q49750', name: 'SPD', type: 'party', country: 'DE' },
];

const SENTIMENT_COLORS: Record<string, string> = {
  'sehr positiv': '#15803d',
  'positiv': '#16a34a',
  'neutral': '#4b5563',
  'negativ': '#ea580c',
  'sehr negativ': '#dc2626',
};

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [trending, setTrending] = useState<TrendingEntity[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setTrendingLoading(true);
    api.trending.get()
      .then(setTrending)
      .catch(() => {})
      .finally(() => setTrendingLoading(false));
  }, []);

  async function handleSearch() {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    setLoading(true);
    setSearched(true);
    try {
      const [politicians, parties] = await Promise.allSettled([
        api.politicians.search(trimmed),
        api.parties.search(trimmed),
      ]);
      const all: Entity[] = [
        ...(politicians.status === 'fulfilled' ? politicians.value.entities : []),
        ...(parties.status === 'fulfilled' ? parties.value.entities : []),
      ];
      setResults(all);
    } finally {
      setLoading(false);
    }
  }

  function navigate(entity: Entity) {
    const route = entity.type === 'party' ? '/partei/' : '/politiker/';
    router.push(`${route}${entity.id}?name=${encodeURIComponent(entity.name)}`);
  }

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Politiker oder Partei suchen..."
          placeholderTextColor="#9ca3af"
          returnKeyType="search"
          onSubmitEditing={handleSearch}
          autoCorrect={false}
        />
        <TouchableOpacity
          style={[styles.searchBtn, query.trim().length < 2 && styles.searchBtnDisabled]}
          onPress={handleSearch}
          disabled={query.trim().length < 2}
        >
          <Text style={styles.searchBtnText}>🔍</Text>
        </TouchableOpacity>
      </View>

      <AdBanner />

      {loading ? (
        <ActivityIndicator size="large" color="#1a56db" style={{ marginTop: 40 }} />
      ) : searched && results.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Keine Ergebnisse gefunden</Text>
          <Text style={styles.emptyHint}>Versuche einen anderen Suchbegriff</Text>
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.resultItem} onPress={() => navigate(item)}>
              <Text style={styles.resultEmoji}>
                {item.type === 'party' ? '🏛️' : '👤'}
              </Text>
              <View style={styles.resultText}>
                <Text style={styles.resultName}>{item.name}</Text>
                {item.description && (
                  <Text style={styles.resultDesc} numberOfLines={1}>
                    {item.description}
                  </Text>
                )}
              </View>
              <Text style={styles.resultArrow}>›</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {/* Trending section */}
          {(trendingLoading || trending.length > 0) && (
            <>
              <Text style={styles.sectionTitle}>Zuletzt analysiert</Text>
              {trendingLoading ? (
                <ActivityIndicator size="small" color="#1a56db" style={{ marginVertical: 12 }} />
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 4 }}
                >
                  {trending.map((entity) => (
                    <TouchableOpacity
                      key={entity.entityId}
                      style={styles.trendingChip}
                      onPress={() => navigate({
                        id: entity.entityId,
                        name: entity.entityName,
                        type: entity.entityType as 'politician' | 'party',
                        country: '',
                      })}
                    >
                      <Text style={styles.trendingName} numberOfLines={1}>
                        {entity.entityName}
                      </Text>
                      <Text style={[
                        styles.trendingLabel,
                        { color: SENTIMENT_COLORS[entity.sentimentLabel] || '#4b5563' },
                      ]}>
                        {entity.sentimentLabel}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          )}

          <Text style={styles.sectionTitle}>Beliebte Suchen</Text>
          {FEATURED.map((entity) => (
            <TouchableOpacity
              key={entity.id}
              style={styles.resultItem}
              onPress={() => navigate(entity)}
            >
              <Text style={styles.resultEmoji}>
                {entity.type === 'party' ? '🏛️' : '👤'}
              </Text>
              <View style={styles.resultText}>
                <Text style={styles.resultName}>{entity.name}</Text>
                <Text style={styles.resultDesc}>
                  {entity.type === 'party' ? 'Partei' : 'Politiker'} · {entity.country}
                </Text>
              </View>
              <Text style={styles.resultArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
  searchBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#1a56db',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnDisabled: { opacity: 0.4 },
  searchBtnText: { fontSize: 18 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  trendingChip: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    minWidth: 120,
    maxWidth: 160,
  },
  trendingName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  trendingLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  resultEmoji: { fontSize: 24, marginRight: 12 },
  resultText: { flex: 1 },
  resultName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  resultDesc: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  resultArrow: { fontSize: 20, color: '#9ca3af' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, color: '#6b7280', fontWeight: '600' },
  emptyHint: { fontSize: 13, color: '#9ca3af', marginTop: 4 },
});
