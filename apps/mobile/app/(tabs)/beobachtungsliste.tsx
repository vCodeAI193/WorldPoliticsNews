import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import type { WatchlistItem } from '@wpn/shared-types';
import { AdBanner } from '@/components/AdBanner';

export default function WatchlistScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function load() {
    if (!user) return;
    try {
      const data = await api.watchlist.get();
      setItems(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      if (!user) { setLoading(false); return; }
      load();
    }, [user])
  );

  async function handleRemove(id: string) {
    setRemovingId(id);
    await api.watchlist.remove(id).catch(() => {});
    setItems((prev) => prev.filter((i) => i.id !== id));
    setRemovingId(null);
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.guestText}>Bitte anmelden, um die Beobachtungsliste zu nutzen.</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/auth/login')}>
          <Text style={styles.loginBtnText}>Jetzt anmelden</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return <ActivityIndicator size="large" color="#1a56db" style={{ marginTop: 60 }} />;
  }

  return (
    <View style={styles.container}>
      <AdBanner />

      {user.subscriptionTier === 'free' && items.length >= 5 && (
        <TouchableOpacity
          style={styles.upgradeBanner}
          onPress={() => router.push('/konto')}
        >
          <Text style={styles.upgradeText}>
            ⭐ Beobachtungsliste voll (5/5) – Auf Plus upgraden für unbegrenzte Einträge
          </Text>
        </TouchableOpacity>
      )}

      {items.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Noch keine Einträge</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/')}>
            <Text style={styles.addBtnText}>Politiker suchen</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() =>
                router.push(
                  `/${item.entityType === 'party' ? 'partei' : 'politiker'}/${item.entityId}?name=${encodeURIComponent(item.entityName)}`
                )
              }
            >
              <Text style={styles.itemEmoji}>
                {item.entityType === 'party' ? '🏛️' : '👤'}
              </Text>
              <View style={styles.itemText}>
                <Text style={styles.itemName}>{item.entityName}</Text>
                <Text style={styles.itemMeta}>
                  {item.entityType === 'party' ? 'Partei' : 'Politiker'}
                  {item.entityCountry ? ` · ${item.entityCountry}` : ''}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleRemove(item.id)}
                disabled={removingId === item.id}
                style={styles.removeBtn}
              >
                <Text style={styles.removeText}>
                  {removingId === item.id ? '...' : '✕'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  guestText: { fontSize: 15, color: '#6b7280', textAlign: 'center', marginBottom: 16 },
  loginBtn: {
    backgroundColor: '#1a56db',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  loginBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  upgradeBanner: {
    margin: 16,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 10,
    padding: 12,
  },
  upgradeText: { color: '#1d4ed8', fontSize: 13, fontWeight: '600' },
  emptyText: { fontSize: 16, color: '#6b7280', marginBottom: 16 },
  addBtn: { backgroundColor: '#1a56db', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  addBtnText: { color: '#fff', fontWeight: '700' },
  item: {
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
  itemEmoji: { fontSize: 22, marginRight: 12 },
  itemText: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  itemMeta: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  removeBtn: { padding: 8 },
  removeText: { color: '#ef4444', fontSize: 16, fontWeight: '700' },
});
