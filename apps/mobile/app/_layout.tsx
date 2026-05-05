import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { getAccessToken, getRefreshToken } from '@/lib/auth';
import { initRevenueCat } from '@/lib/revenueCat';

export default function RootLayout() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    async function bootstrap() {
      try {
        const token = await getAccessToken();
        if (token) {
          const user = await api.users.me();
          setUser(user);
          await initRevenueCat(user.id);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="politiker/[id]" options={{ headerShown: true, title: 'Analyse' }} />
        <Stack.Screen name="partei/[id]" options={{ headerShown: true, title: 'Analyse' }} />
        <Stack.Screen name="auth/login" options={{ headerShown: true, title: 'Anmelden' }} />
        <Stack.Screen name="auth/registrieren" options={{ headerShown: true, title: 'Registrieren' }} />
      </Stack>
    </>
  );
}
