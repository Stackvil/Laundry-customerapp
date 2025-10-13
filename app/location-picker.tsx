import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import CustomLocationPicker from '@/components/CustomLocationPicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LocationPickerScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSelectLocation = async (location: any) => {
    setLoading(true);
    try {
      console.log('📍 Selected location:', location);
      // Save selected location to AsyncStorage
      await AsyncStorage.setItem('selectedPickupLocation', JSON.stringify(location));
      
      // Navigate back to confirm order screen
      router.back();
    } catch (error) {
      console.error('Error saving location:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Pickup Location</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Location Search Component */}
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <CustomLocationPicker onSelectLocation={handleSelectLocation} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
});

