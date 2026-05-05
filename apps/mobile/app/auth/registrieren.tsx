import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { saveTokens } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';
import { initRevenueCat } from '@/lib/revenueCat';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const router = useRouter();

  async function handleRegister() {
    if (!email) { setError('E-Mail eingeben'); return; }
    if (password.length < 8) { setError('Passwort muss mindestens 8 Zeichen lang sein'); return; }
    setError('');
    setLoading(true);
    try {
      const data = await api.auth.register(email.trim(), password);
      await saveTokens(data.token, data.refreshToken);
      setUser(data.user);
      await initRevenueCat(data.user.id);
      router.replace('/(tabs)/beobachtungsliste');
    } catch (err: any) {
      setError(err.message || 'Registrierung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Konto erstellen</Text>
        <Text style={styles.subtitle}>Kostenlos starten bei WorldPoliticsNews</Text>

        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

        <View style={styles.form}>
          <Text style={styles.label}>E-Mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            placeholder="name@beispiel.de"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>
            Passwort <Text style={styles.labelHint}>(min. 8 Zeichen)</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="newPassword"
            placeholder="••••••••"
            placeholderTextColor="#9ca3af"
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.btnText}>{loading ? 'Registrieren...' : 'Kostenlos registrieren'}</Text>
          </TouchableOpacity>

          <Text style={styles.legal}>
            Mit der Registrierung stimmst du den Nutzungsbedingungen zu.
          </Text>

          <TouchableOpacity onPress={() => router.push('/auth/login')} style={styles.switchLink}>
            <Text style={styles.switchText}>
              Bereits ein Konto?{' '}
              <Text style={styles.switchTextBold}>Anmelden</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center', backgroundColor: '#f9fafb' },
  title: { fontSize: 26, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  errorBox: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: '#dc2626', fontSize: 14 },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
  labelHint: { color: '#9ca3af', fontWeight: '400' },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#fff',
  },
  btn: {
    backgroundColor: '#1a56db',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  legal: { fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 12 },
  switchLink: { marginTop: 14, alignItems: 'center' },
  switchText: { fontSize: 14, color: '#6b7280' },
  switchTextBold: { color: '#1a56db', fontWeight: '700' },
});
