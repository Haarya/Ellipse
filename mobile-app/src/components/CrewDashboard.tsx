import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ComplaintService } from '../services/complaint.service';
import { colors } from '../theme/colors';
import { useRouter, useFocusEffect } from 'expo-router';
import { MapPin, CheckCircle, Navigation } from 'lucide-react-native';

export function CrewDashboard() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchComplaints = async () => {
    try {
      const data = await ComplaintService.getDispatchedComplaints();
      setComplaints(data);
    } catch (error) {
      console.error('Failed to fetch dispatched complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchComplaints();
    }, [])
  );

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => router.push(`/complaint/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.title}>
        {item.aiAnalysis?.microCategory || item.aiAnalysis?.macroCategory || item.aiAnalysis?.wasteClasses?.[0] || 'Unclassified Waste'}
      </Text>
      <View style={styles.cardFooter}>
        <View style={styles.locationContainer}>
          <MapPin color={colors.teal} size={16} />
          <Text style={styles.locationText}>View on map</Text>
        </View>
        <Navigation color={colors.lime} size={20} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Crew Tasks</Text>
        <Text style={styles.headerSubtitle}>Dispatched cleanups in your area</Text>
      </View>
      
      {loading ? (
        <ActivityIndicator color={colors.lime} size="large" style={{ marginTop: 40 }} />
      ) : complaints.length === 0 ? (
        <View style={styles.emptyState}>
          <CheckCircle color={colors.lime} size={48} />
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptySubtitle}>No pending dispatches right now.</Text>
        </View>
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.forest,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: colors.surfaceElevated,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 28,
    fontFamily: 'Philosopher-Bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: colors.gray100,
    fontSize: 16,
  },
  listContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    backgroundColor: 'rgba(255,159,67,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FF9F43',
    fontSize: 12,
    fontWeight: 'bold',
  },
  date: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  title: {
    color: colors.white,
    fontSize: 18,
    fontFamily: 'Philosopher-Bold',
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    paddingTop: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: colors.teal,
    marginLeft: 8,
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: colors.white,
    fontSize: 24,
    fontFamily: 'Philosopher-Bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    textAlign: 'center',
  }
});
