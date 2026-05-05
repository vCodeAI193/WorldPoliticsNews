import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  return <Text style={{ fontSize: 20, color }}>{emoji}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1a56db',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: { borderTopWidth: 1, borderTopColor: '#e5e7eb' },
        headerStyle: { backgroundColor: '#1a56db' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Suche',
          tabBarLabel: 'Suche',
          tabBarIcon: ({ color }) => <TabIcon emoji="🔍" color={color} />,
          headerTitle: '🌍 WorldPoliticsNews',
        }}
      />
      <Tabs.Screen
        name="beobachtungsliste"
        options={{
          title: 'Beobachtungsliste',
          tabBarLabel: 'Beobachtet',
          tabBarIcon: ({ color }) => <TabIcon emoji="★" color={color} />,
        }}
      />
      <Tabs.Screen
        name="konto"
        options={{
          title: 'Konto',
          tabBarLabel: 'Konto',
          tabBarIcon: ({ color }) => <TabIcon emoji="👤" color={color} />,
        }}
      />
    </Tabs>
  );
}
