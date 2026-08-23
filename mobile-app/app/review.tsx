import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Send } from 'lucide-react-native';
import { colors } from '../src/theme/colors';
import { SizeEstimate, SizeEstimatePicker } from '../src/components/complaint/SizeEstimatePicker';
import { ComplaintService } from '../src/services/complaint.service';
import { LinearGradient } from 'expo-linear-gradient';

export default function ReviewScreen() {
  const { photoUri, latitude, longitude, heading, focalLength, sensorWidth, sensorHeight, zoomRatio } = useLocalSearchParams<{ 
    photoUri: string; 
    latitude: string; 
    longitude: string; 
    heading: string;
    focalLength?: string;
    sensorWidth?: string;
    sensorHeight?: string;
    zoomRatio?: string;
  }>();
  
  const router = useRouter();
  const [size, setSize] = useState<SizeEstimate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!photoUri || !latitude || !longitude) {
      Alert.alert('Error', 'Missing required data (photo or location).');
      return;
    }

    try {
      setIsSubmitting(true);
      await ComplaintService.submitComplaint({
        photoUri,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        compassHeading: parseFloat(heading || '0'),
        sizeEstimate: size ? size.toUpperCase() : undefined,
        focalLength: focalLength ? parseFloat(focalLength) : undefined,
        sensorWidth: sensorWidth ? parseFloat(sensorWidth) : undefined,
        sensorHeight: sensorHeight ? parseFloat(sensorHeight) : undefined,
        zoomRatio: zoomRatio ? parseFloat(zoomRatio) : undefined,
      });
      
      // Success! Navigate to success screen
      router.replace('/success');
    } catch (error: any) {
      console.error('Submit error:', error);
      const status = error.response?.status;
      
      if (status === 429) {
        Alert.alert('Rate Limit Exceeded', 'You have submitted too many reports recently. Please wait a few minutes before trying again.');
      } else if (status === 409) {
        // Technically dedup might return 409, or success with a parent_id
        Alert.alert('Duplicate Detected', 'This issue has already been reported recently. We have added your photo to the existing report.');
        router.replace('/(tabs)');
      } else {
        Alert.alert('Submission Failed', error.response?.data?.message || 'We could not submit your report. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} disabled={isSubmitting}>
          <ArrowLeft color={colors.white} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Report</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: photoUri }} style={styles.image} />
          <View style={styles.locationBadge}>
            <MapPin color={colors.midnight} size={16} />
            <Text style={styles.locationText}>
              {parseFloat(latitude).toFixed(4)}, {parseFloat(longitude).toFixed(4)}
            </Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <SizeEstimatePicker value={size} onChange={setSize} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.submitButtonContainer}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <LinearGradient
            colors={[colors.lime, colors.limeMuted]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.submitButton}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.forest} />
            ) : (
              <>
                <Text style={styles.submitText}>SUBMIT REPORT</Text>
                <Send color={colors.forest} size={20} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.midnight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: colors.forest,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    fontFamily: 'Philosopher-Bold',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 350,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  locationBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: colors.lime,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    color: colors.midnight,
    fontSize: 14,
    fontWeight: 'bold',
  },
  formContainer: {
    padding: 24,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: colors.forest,
  },
  submitButtonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  submitButton: {
    flexDirection: 'row',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  submitText: {
    color: colors.forest,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Philosopher-Bold',
    letterSpacing: 0.5,
  },
});
