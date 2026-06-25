import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { SentimentGauge } from '@/components/SentimentGauge';
import { ArticleCard } from '@/components/ArticleCard';
import { AdBanner } from '@/components/AdBanner';
import type { AnalysisResult } from '@wpn/shared-types';
import { useAuthStore } from '@/store/authStore';

export default function PoliticianDetailScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchlistItemId, setWatchlistItemId] = useState<string | null>(null);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const { user } = useAuthStore();
  const entityName = name || id;

  useEffect(() => {
    navigation.setOptions({ title: entityName });
    const fetchAnalysis = api.politicians
      .analysis(id, entityName)
      .then(setAnalysis)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    const fetchWatchlist = user
      ? api.watchlist.get().then((items) => {
          const found = items.find((i) => i.entityId === id);
          if (found) setWatchlistItemId(found.id);
        }).catch(() => {})
      : Promise.resolve();

    Promise.allSettled([fetchAnalysis, fetchWatchlist]);
  }, [id, entityName, navigation, user]);

  async function handleWatchlist() {
    if (!user) { router.push('/auth/login'); return; }
    setWatchlistLoading(true);
    try {
      if (watchlistItemId) {
        await api.watchlist.remove(watchlistItemId);
        setWatchlistItemId(null);
      } else {
        const item = await api.watchlist.add({
          entityId: id,
          entityName: entityName,
          entityType: 'politician',
        });
        setWatchlistItemId(item.id);
      }
    } catch (e: any) {
      Alert.alert('Fehler', e.message || 'Aktion fehlgeschlagen');
    } finally {
      setWatchlistLoading(false);
    }
  }

  async function handleShare() {
    if (!analysis) return;
    try {
      await Share.share({
        title: `KI-Analyse: ${analysis.entityName}`,
        message: `KI-Analyse zu ${analysis.entityName}: Sentiment „${analysis.sentimentLabel}" – WorldPoliticsNews\nhttps://worldpoliticsnews.de/politiker/${id}?name=${encodeURIComponent(analysis.entityName)}`,
      });
    } catch {}
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a56db" />
        <Text style={styles.loadingText}>KI analysiert Nachrichten...</Text>
      </View>
    );
  }

  if (error || !analysis) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Analyse nicht verfügbar'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Header */}
      <View style={styles.headerCard}>
        <Text style={styles.entityType}>👤 Politiker</Text>
        <Text style={styles.entityName}>{analysis.entityName}</Text>
        <Text style={styles.metaText}>
          Analyse vom{' '}
          {new Date(analysis.generatedAt).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
          {analysis.cached ? ' (Cache)' : ''}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.actionBtn, watchlistItemId && styles.actionBtnActive]}
            onPress={handleWatchlist}
            disabled={watchlistLoading}
          >
            <Text style={styles.actionBtnText}>
              {watchlistItemId ? '★ Beobachtet' : '☆ Beobachten'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <Text style={styles.actionBtnText}>↑ Teilen</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sentiment */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Gesamtbewertung</Text>
        <SentimentGauge score={analysis.sentiment} label={analysis.sentimentLabel} />
        <Text style={styles.summary}>{analysis.summary}</Text>
      </View>

      <AdBanner />

      {/* Keywords */}
      {analysis.keywords.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hauptthemen</Text>
          <View style={styles.keywordsRow}>
            {analysis.keywords.map((kw) => (
              <View key={kw} style={styles.keyword}>
                <Text style={styles.keywordText}>{kw}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Articles */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Analysierte Artikel ({analysis.articles.length})
        </Text>
        {analysis.articles.map((article, i) => (
          <ArticleCard key={article.url} article={article} index={i} />
        ))}
      </View>

      {user?.subscriptionTier !== 'plus' && (
        <View style={styles.upgradeBanner}>
          <Text style={styles.upgradeTitle}>⭐ Plus – Werbefrei & schnellere Updates</Text>
          <Text style={styles.upgradeHint}>3,99 € / Monat → Konto-Tab</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { color: '#6b7280', marginTop: 12, fontSize: 14 },
  errorText: { color: '#dc2626', textAlign: 'center', fontSize: 15 },
  headerCard: {
    backgroundColor: '#1a56db',
    padding: 20,
    paddingTop: 24,
  },
  entityType: { color: '#bfdbfe', fontSize: 13, marginBottom: 4 },
  entityName: { color: '#fff', fontSize: 26, fontWeight: '800' },
  metaText: { color: '#93c5fd', fontSize: 12, marginTop: 4 },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  actionBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 12 },
  summary: { fontSize: 14, color: '#374151', lineHeight: 22, marginTop: 12 },
  keywordsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  keyword: { backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  keywordText: { color: '#1d4ed8', fontSize: 13, fontWeight: '500' },
  upgradeBanner: {
    margin: 16,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  upgradeTitle: { color: '#1d4ed8', fontWeight: '700', fontSize: 14 },
  upgradeHint: { color: '#3b82f6', fontSize: 12, marginTop: 4 },
});
