import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
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

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleLogout() {
    try {
      const rt = await getRefreshToken();
      if (rt) await api.auth.logout(rt).catch(() => {});
      await clearTokens();
      setUser(null);
    } catch {}
  }

  async function refreshUser() {
    const fresh = await api.users.me();
    setUser(fresh);
  }

  async function handleUpgrade() {
    if (!user) { router.push('/auth/registrieren'); return; }
    setPurchasing(true);
    try {
      const success = await purchasePlus();
      if (success) {
        await refreshUser();
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
        await refreshUser();
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

  async function handleChangePassword() {
    if (pwForm.next !== pwForm.confirm) {
      Alert.alert('Fehler', 'Neue Passwörter stimmen nicht überein.');
      return;
    }
    if (pwForm.next.length < 8) {
      Alert.alert('Fehler', 'Neues Passwort muss mindestens 8 Zeichen haben.');
      return;
    }
    setPwLoading(true);
    try {
      await api.users.changePassword(pwForm.current, pwForm.next);
      Alert.alert('Erledigt', 'Passwort erfolgreich geändert.');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err: any) {
      Alert.alert('Fehler', err.message || 'Passwort konnte nicht geändert werden.');
    } finally {
      setPwLoading(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true);
    try {
      await api.users.deleteAccount(deletePassword);
      await clearTokens();
      setUser(null);
    } catch (err: any) {
      Alert.alert('Fehler', err.message || 'Konto konnte nicht gelöscht werden.');
    } finally {
      setDeleteLoading(false);
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

  const isPwDisabled = pwLoading || !pwForm.current || !pwForm.next || !pwForm.confirm;

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
        <View style={styles.divider} />
        <Text style={styles.label}>Registriert seit</Text>
        <Text style={styles.value}>
          {new Date(user.createdAt).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </Text>
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

      {/* Change Password */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Passwort ändern</Text>
        <TextInput
          style={styles.pwInput}
          placeholder="Aktuelles Passwort"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          value={pwForm.current}
          onChangeText={(v) => setPwForm({ ...pwForm, current: v })}
        />
        <TextInput
          style={styles.pwInput}
          placeholder="Neues Passwort (min. 8 Zeichen)"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          value={pwForm.next}
          onChangeText={(v) => setPwForm({ ...pwForm, next: v })}
        />
        <TextInput
          style={[styles.pwInput, { marginBottom: 12 }]}
          placeholder="Neues Passwort bestätigen"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          value={pwForm.confirm}
          onChangeText={(v) => setPwForm({ ...pwForm, confirm: v })}
        />
        <TouchableOpacity
          style={[styles.changePwBtn, isPwDisabled && styles.disabled]}
          onPress={handleChangePassword}
          disabled={isPwDisabled}
        >
          <Text style={styles.changePwBtnText}>
            {pwLoading ? 'Wird geändert...' : 'Passwort ändern'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Abmelden</Text>
      </TouchableOpacity>

      {/* Delete Account */}
      <View style={[styles.card, styles.deleteCard]}>
        <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>Konto löschen</Text>
        <Text style={styles.deleteHint}>
          Löscht dein Konto und alle Daten unwiderruflich.
        </Text>
        {!deleteConfirm ? (
          <TouchableOpacity onPress={() => setDeleteConfirm(true)}>
            <Text style={styles.deleteLinkText}>Konto löschen →</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TextInput
              style={[styles.pwInput, { borderColor: '#fca5a5' }]}
              placeholder="Passwort zur Bestätigung"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={deletePassword}
              onChangeText={setDeletePassword}
            />
            <View style={styles.deleteActionRow}>
              <TouchableOpacity
                style={[styles.cancelBtn, { flex: 1 }]}
                onPress={() => { setDeleteConfirm(false); setDeletePassword(''); }}
              >
                <Text style={styles.cancelBtnText}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteConfirmBtn, { flex: 1 }, (deleteLoading || !deletePassword) && styles.disabled]}
                onPress={handleDeleteAccount}
                disabled={deleteLoading || !deletePassword}
              >
                <Text style={styles.deleteConfirmBtnText}>
                  {deleteLoading ? '...' : 'Endgültig löschen'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
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
  disabled: { opacity: 0.5 },
  activeLabel: { fontSize: 14, color: '#15803d', fontWeight: '600', marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 10 },
  featureItem: { fontSize: 14, color: '#4b5563', marginBottom: 6 },
  pwInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  changePwBtn: {
    backgroundColor: '#1a56db',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  changePwBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
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
  deleteCard: { borderColor: '#fecaca', marginTop: 16 },
  deleteHint: { fontSize: 13, color: '#6b7280', marginBottom: 10 },
  deleteLinkText: { color: '#ef4444', fontSize: 14 },
  deleteActionRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#374151', fontSize: 14 },
  deleteConfirmBtn: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  deleteConfirmBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
