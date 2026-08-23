import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useAuthStore } from '../../src/stores/auth.store';
import { colors } from '../../src/theme/colors';
import { LogOut, User as UserIcon, Settings, Award } from 'lucide-react-native';
import { api } from '../../src/services/api';

export default function ProfileScreen() {
  const { user: authUser, logout, setUser } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      setProfile(response.data);
      // Update global store so the rest of the app knows the role changed
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch profile', error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile().finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    fetchProfile();
  }, []);

  const displayUser = profile || authUser;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.lime} />}
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <UserIcon color={colors.forest} size={40} />
        </View>
        <Text style={styles.name}>{displayUser?.fullName || 'Citizen'}</Text>
        <Text style={styles.phone}>{displayUser?.phone || displayUser?.email || ''}</Text>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statsIcon}>
          <Award color={colors.lime} size={32} />
        </View>
        <View style={styles.statsInfo}>
          <Text style={styles.statsLabel}>Clean City Credits</Text>
          <Text style={styles.statsValue}>{displayUser?.cleanCityCredits || 0}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        


        {/* Developer Testing Toggle */}
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={async () => {
            try {
              const newRole = displayUser?.role === 'FIELD_CREW' ? 'CITIZEN' : 'FIELD_CREW';
              await api.patch('/auth/me/role', { role: newRole });
              fetchProfile(); // refresh local state
            } catch (error) {
              console.error('Failed to switch role', error);
            }
          }}
        >
          <Settings color={colors.lime} size={24} />
          <Text style={[styles.menuText, { color: colors.lime }]}>
            Switch to {displayUser?.role === 'FIELD_CREW' ? 'CITIZEN' : 'FIELD_CREW'} Mode
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={logout}>
          <LogOut color={colors.severityCritical} size={24} />
          <Text style={[styles.menuText, { color: colors.severityCritical }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.forest,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: colors.surfaceElevated,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.lime,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    color: colors.white,
    fontSize: 24,
    fontFamily: 'Philosopher-Bold',
    marginBottom: 4,
  },
  phone: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
  },
  statsCard: {
    marginHorizontal: 20,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  statsIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(216, 255, 115, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statsInfo: {
    flex: 1,
  },
  statsLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginBottom: 4,
  },
  statsValue: {
    color: colors.lime,
    fontSize: 32,
    fontFamily: 'Philosopher-Bold',
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 18,
    fontFamily: 'Philosopher-Bold',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  menuText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 16,
  },
});
