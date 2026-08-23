import React, { useRef, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Camera as CameraIcon, X, MapPin, Image as ImageIcon } from 'lucide-react-native';
import { colors } from '../src/theme/colors';
import { useLocation } from '../src/hooks/useLocation';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const { location, isGettingLocation } = useLocation();
  const cameraRef = useRef<CameraView>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current && !isProcessing) {
      setIsProcessing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
          exif: true,
        });
        
        // Ensure we have a location before proceeding
        if (!location) {
          alert('GPS location is required to submit a report. Please wait for GPS lock.');
          setIsProcessing(false);
          return;
        }

        // Extract EXIF data if available
        const exif = photo.exif || {};
        const focalLength = exif.FocalLength || 26.0; // Default wide angle equivalent
        // Most smartphones have ~1/2.55" sensor -> roughly 5.76mm x 4.29mm
        const sensorWidth = 5.76;
        const sensorHeight = 4.29;
        const zoomRatio = 1.0; // Since pinch-to-zoom is not currently implemented in UI

        // Navigate to review screen with photo, location, and EXIF
        router.push({
          pathname: '/review',
          params: { 
            photoUri: photo?.uri,
            latitude: location.latitude.toString(),
            longitude: location.longitude.toString(),
            heading: location.heading?.toString() || '0',
            focalLength: focalLength.toString(),
            sensorWidth: sensorWidth.toString(),
            sensorHeight: sensorHeight.toString(),
            zoomRatio: zoomRatio.toString()
          }
        });
      } catch (error) {
        console.error('Failed to take picture', error);
        alert('Failed to capture photo. Try again.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const pickImage = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (!location) {
          alert('GPS location is required. Please wait for GPS lock.');
          setIsProcessing(false);
          return;
        }

        router.push({
          pathname: '/review',
          params: { 
            photoUri: result.assets[0].uri,
            latitude: location.latitude.toString(),
            longitude: location.longitude.toString(),
            heading: location.heading?.toString() || '0'
          }
        });
      }
    } catch (error) {
      console.error('Failed to pick image', error);
      alert('Failed to pick image. Try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing="back"
        ref={cameraRef}
        animateShutter={false}
      >
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
              <X color={colors.white} size={24} />
            </TouchableOpacity>
            
            <View style={[styles.gpsBadge, location ? styles.gpsActive : styles.gpsSearching]}>
              <MapPin color={colors.white} size={16} />
              <Text style={styles.gpsText}>
                {isGettingLocation ? 'Acquiring GPS...' : location ? 'GPS Locked' : 'No GPS'}
              </Text>
            </View>
          </View>

          {/* Footer controls */}
          <View style={styles.footer}>
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>Ensure the waste is clearly visible</Text>
            </View>
            
            <View style={styles.captureContainer}>
              <View style={styles.captureSpacer}>
                <TouchableOpacity style={styles.uploadButton} onPress={pickImage} disabled={isProcessing}>
                  <ImageIcon color={colors.white} size={24} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={[styles.captureButton, (!location || isProcessing) && styles.captureButtonDisabled]} 
                onPress={takePicture}
                disabled={!location || isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color={colors.forest} size="large" />
                ) : (
                  <View style={styles.captureInner} />
                )}
              </TouchableOpacity>
              <View style={styles.captureSpacer} />
            </View>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.midnight,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: colors.white,
    fontFamily: 'Philosopher-Regular',
  },
  permissionButton: {
    backgroundColor: colors.lime,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 32,
  },
  permissionText: {
    color: colors.forest,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  gpsActive: {
    backgroundColor: 'rgba(7, 102, 83, 0.8)', // teal
  },
  gpsSearching: {
    backgroundColor: 'rgba(255, 77, 77, 0.8)', // critical
  },
  gpsText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  warningContainer: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  warningText: {
    color: colors.white,
    fontSize: 14,
  },
  captureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 40,
  },
  captureSpacer: {
    width: 60, // Balance the capture button
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.white,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
  },
  uploadButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
