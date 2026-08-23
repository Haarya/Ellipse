import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ComplaintService } from '../../src/services/complaint.service';
import { colors } from '../../src/theme/colors';
import { ArrowLeft, CheckCircle, AlertTriangle, AlertCircle, HelpCircle, Navigation } from 'lucide-react-native';
import { useAuthStore } from '../../src/stores/auth.store';

const STATUS_ORDER = ['LOGGED', 'AI_TRIAGED', 'DISPATCHED', 'RESOLVED'];

export default function ComplaintDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        let data;
        if (user?.role === 'FIELD_CREW') {
          data = await ComplaintService.getCrewComplaintById(id as string);
        } else {
          data = await ComplaintService.getComplaintById(id as string);
        }
        setComplaint(data);
      } catch (error) {
        console.error('Failed to fetch complaint:', error);
        Alert.alert('Error', 'Failed to fetch complaint details. The complaint may have been deleted or there is a network issue.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchComplaint();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.lime} />
      </View>
    );
  }

  if (!complaint) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Complaint not found.</Text>
      </View>
    );
  }

  const currentStatusIndex = STATUS_ORDER.indexOf(complaint.status);
  const ai = complaint.aiAnalysis;

  const renderTimeline = () => {
    return (
      <View style={styles.timelineContainer}>
        <Text style={styles.sectionTitle}>Status Timeline</Text>
        {STATUS_ORDER.map((status, index) => {
          const isCompleted = currentStatusIndex >= index;
          const isCurrent = currentStatusIndex === index;
          return (
            <View key={status} style={styles.timelineRow}>
              <View style={styles.timelineIconContainer}>
                {isCompleted ? (
                  <CheckCircle color={colors.lime} size={24} />
                ) : (
                  <View style={styles.timelineCircle} />
                )}
                {index < STATUS_ORDER.length - 1 && (
                  <View style={[styles.timelineLine, isCompleted && styles.timelineLineActive]} />
                )}
              </View>
              <View style={styles.timelineTextContainer}>
                <Text style={[styles.timelineStatus, isCurrent && styles.timelineStatusActive]}>
                  {status.replace('_', ' ')}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderAICard = () => {
    if (!ai) return null;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>AI Analysis</Text>
          <TouchableOpacity>
            <HelpCircle color={colors.teal} size={20} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Severity Score:</Text>
          <Text style={[styles.cardValue, { color: ai.severityScore >= 0.75 ? colors.severityCritical : colors.lime }]}>
            {(ai.severityScore * 100).toFixed(0)}%
          </Text>
        </View>

        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Category:</Text>
          <Text style={styles.cardValue}>{ai.macroCategory || ai.category || 'N/A'}</Text>
        </View>

        {ai.microCategory && (
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Specific Type:</Text>
            <Text style={styles.cardValue}>{ai.microCategory}</Text>
          </View>
        )}

        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Waste Types:</Text>
          <Text style={styles.cardValue}>{ai.wasteTypes?.length > 0 ? ai.wasteTypes.join(', ') : 'No garbage detected'}</Text>
        </View>

        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Estimated Size:</Text>
          <Text style={styles.cardValue}>{ai.sizeEstimate || 'N/A'}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={colors.white} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: complaint.photoUrl }} style={styles.image} />
        </View>

        {renderTimeline()}

        {renderAICard()}

        {complaint.status === 'RESOLVED' && (
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Verify & Rate Resolution</Text>
          </TouchableOpacity>
        )}

        {complaint.status === 'DUPLICATE' && (
          <TouchableOpacity style={[styles.actionButton, styles.disputeButton]}>
            <Text style={styles.actionButtonText}>Dispute Duplicate Status</Text>
          </TouchableOpacity>
        )}

        {user?.role === 'FIELD_CREW' && complaint.status === 'DISPATCHED' && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.teal }]}
            onPress={() => router.push(`/crew/resolve/${complaint.id}` as any)}
          >
            <Text style={[styles.actionButtonText, { color: colors.white }]}>Resolve Issue</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.forest,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.forest,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.severityCritical,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.forest,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontFamily: 'Philosopher-Bold',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 18,
    fontFamily: 'Philosopher-Bold',
    marginBottom: 16,
  },
  timelineContainer: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  timelineIconContainer: {
    alignItems: 'center',
    width: 24,
    marginRight: 16,
  },
  timelineCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 4,
  },
  timelineLineActive: {
    backgroundColor: colors.lime,
  },
  timelineTextContainer: {
    justifyContent: 'center',
    paddingTop: 2,
    paddingBottom: 36,
  },
  timelineStatus: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timelineStatusActive: {
    color: colors.white,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    color: colors.white,
    fontSize: 18,
    fontFamily: 'Philosopher-Bold',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  cardValue: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: colors.lime,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  disputeButton: {
    backgroundColor: colors.severityCritical,
  },
  actionButtonText: {
    color: colors.forest,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
