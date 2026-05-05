import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { clearTokens, getRefreshToken } from '@/lib/auth';
import { purchasePlus, restorePurchases } from '@/lib/revenueCat';
import { useState } from 'react';

export default function KontoScreen() {
  const { user, setUser, isPlus } = useAuthStore();
  const router = useRouter();
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  async function handleLogout() {
    try {
      const rt = await getRefreshToken();
      if (rt) await api.auth.logout(rt).catch(() => {});
      await clearTokens();
      setUser(null);
    } catch {}
  }

  async function handleUpgrade() {
    if (!user) { router.push('/auth/registrieren'); return; }
    setPurchasing(true);
    try {
      const success = await purchasePlus();
      if (success) {
        const fresh = await api.users.me();
        setUser(fresh);
        Alert.alert('Danke!', 'Du hast WorldPoliticsNews Plus aktiviert. Genieße die werbefreie Erfahrung!');
      }
    } catch (err: any) {
      Alert.alert('Fehler', err.message || 'Kauf fehlgeschlagen');
    } finally {
      setPurchasing(false);
    }
  }

  async function handleRestore() {
    setRestoring(true);
    try {
      const ok = await restorePurchases();
      if (ok) {
        const fresh = await api.users.me();
        setUser(fresh);
        Alert.alert('Erledigt', 'Deine Käufe wurden wiederhergestellt.');
      } else {
        Alert.alert('Kein aktives Abo', 'Es wurden keine früheren Käufe gefunden.');
      }
    } catch {
      Alert.alert('Fehler', 'Wiederherstellung fehlgeschlagen');
    } finally {
      setRestoring(false);
    }
  }

  async function handleWebCheckout() {
    try {
      const { url } = await api.subscriptions.createCheckout();
      await Linking.openURL(url);
    } catch {
      Alert.alert('Fehler', 'Checkout konnte nicht geöffnet werden');
    }
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.emoji}>👤</Text>
        <Text style={styles.guestTitle}>Nicht angemeldet</Text>
        <Text style={styles.guestSub}>Melde dich an, um dein Konto zu verwalten.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/auth/login')}>
          <Text style={styles.primaryBtnText}>Anmelden</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/auth/registrieren')}>
          <Text style={styles.secondaryBtnText}>Kostenlos registrieren</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Profile */}
      <View style={styles.card}>
        <Text style={styles.label}>E-Mail</Text>
        <Text style={styles.value}>{user.email}</Text>
        <View style={styles.divider} />
        <Text style={styles.label}>Abonnement</Text>
        <View style={styles.tierRow}>
          <Text style={[styles.value, isPlus() && { color: '#1a56db', fontWeight: '700' }]}>
            {isPlus() ? '⭐ WorldPoliticsNews Plus' : 'Kostenlos'}
          </Text>
        </View>
      </View>

      {/* Upgrade / Manage */}
      {!isPlus() ? (
        <View style={styles.upgradeCard}>
          <Text style={styles.upgradeTitle}>Auf Plus upgraden</Text>
          <Text style={styles.upgradeDesc}>
            Werbefrei · Unbegrenzte Beobachtungsliste · Schnellere Updates
          </Text>
          <Text style={styles.upgradePrice}>3,99 € / Monat</Text>
          <TouchableOpacity
            style={[styles.primaryBtn, purchasing && styles.disabled]}
            onPress={handleUpgrade}
            disabled={purchasing}
          >
            <Text style={styles.primaryBtnText}>
              {purchasing ? 'Verarbeitung...' : 'In-App kaufen'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={handleWebCheckout}>
            <Text style={styles.secondaryBtnText}>Im Browser bezahlen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.restoreBtn}
            onPress={handleRestore}
            disabled={restoring}
          >
            <Text style={styles.restoreText}>
              {restoring ? 'Wiederherstellen...' : 'Käufe wiederherstellen'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.activeLabel}>✅ Plus aktiv – Danke für deine Unterstützung!</Text>
          <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore}>
            <Text style={styles.restoreText}>Käufe wiederherstellen</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Plus features list */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Was ist in Plus enthalten?</Text>
        {[
          '✅ Keine Werbung',
          '✅ Unbegrenzte Beobachtungsliste',
          '✅ Analyse-Updates alle 30 Minuten',
          '✅ Alle globalen Politiker & Parteien',
        ].map((f) => (
          <Text key={f} style={styles.featureItem}>{f}</Text>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Abmelden</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emoji: { fontSize: 48, marginBottom: 12 },
  guestTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 6 },
  guestSub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  label: { fontSize: 11, fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 15, color: '#111827', marginTop: 4, marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginBottom: 12 },
  tierRow: { flexDirection: 'row', alignItems: 'center' },
  upgradeCard: {
    backgroundColor: '#1a56db',
    margin: 16,
    marginBottom: 0,
    borderRadius: 14,
    padding: 20,
  },
  upgradeTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 6 },
  upgradeDesc: { fontSize: 13, color: '#bfdbfe', marginBottom: 8 },
  upgradePrice: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 16 },
  primaryBtn: {
    backgroundColor: '#fff',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#1a56db', fontWeight: '700', fontSize: 15 },
  secondaryBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  restoreBtn: { marginTop: 12, alignItems: 'center' },
  restoreText: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  disabled: { opacity: 0.6 },
  activeLabel: { fontSize: 14, color: '#15803d', fontWeight: '600', marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 10 },
  featureItem: { fontSize: 14, color: '#4b5563', marginBottom: 6 },
  logoutBtn: {
    margin: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  logoutText: { color: '#ef4444', fontWeight: '600', fontSize: 15 },
});
