import { Tabs } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { Map, Trophy, User, FileText, ClipboardList } from 'lucide-react-native';
import { useAuthStore } from '../../src/stores/auth.store';

export default function TabLayout() {
  const { user } = useAuthStore();
  const isCrew = user?.role === 'FIELD_CREW';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surfaceElevated,
          borderTopColor: colors.teal,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.lime,
        tabBarInactiveTintColor: colors.teal,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: isCrew ? 'Tasks' : 'Map',
          tabBarIcon: ({ color, size }) => isCrew ? <ClipboardList color={color} size={size} /> : <Map color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Leaderboard',
          href: isCrew ? null : undefined,
          tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="my-reports"
        options={{
          title: 'My Reports',
          href: isCrew ? null : undefined,
          tabBarIcon: ({ color, size }) => <FileText color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
