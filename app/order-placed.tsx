import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import { AppUser } from './types';

export default function OrderPlacedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();

  const cart = params.cart ? JSON.parse(params.cart as string) : [];
  const totalAmount = Number(params.totalAmount || 0);
  const mobile = params.mobile as string;
  const address = params.address as string;
  const pickupAddress = params.pickupAddress as string;
  const pickupCoordinates = params.pickupCoordinates ? JSON.parse(params.pickupCoordinates as string) : null;
  const images = params.images ? JSON.parse(params.images as string) : [];
  const videoUri = params.videoUri as string || '';
  const uploadType = params.uploadType as string || 'images';
  const service = params.selectedService ? JSON.parse(params.selectedService as string) : { name: 'Laundry' };
  const serviceCenter = params.serviceCenter
    ? JSON.parse(params.serviceCenter as string)
    : {
        id: '',
        name: 'Default Service Center',
        address: '123 Street, City',
        distance: '2.3 km',
        imageUrl: 'https://via.placeholder.com/80',
      };

  useEffect(() => {
    const saveOrder = async () => {
      try {
        const newOrder = {
          id: Date.now().toString(),
          userId: user?.id || user?.email || 'guest',
          customerName: params.name || user?.name || 'Guest',
          mobile: mobile || (user as AppUser)?.mobile || '',
          address: address || (user as AppUser)?.address || '',
          pickupAddress: pickupAddress || '',
          pickupCoordinates: pickupCoordinates || null,
          images: images || [],
          videoUri: videoUri || '',
          uploadType: uploadType || 'images',
          cartItems: cart,
          totalAmount,
          date: new Date().toISOString(),
          status: 'Order Placed',
          service,
          serviceCenter,
        };

        const existing = await AsyncStorage.getItem('orders');
        const parsed = existing ? JSON.parse(existing) : [];
        const updated = [newOrder, ...parsed];

        await AsyncStorage.setItem('orders', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving order:', e);
      }
    };

    saveOrder();

    const timer = setTimeout(() => {
      router.replace('/(tabs)/orders');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <CheckCircle size={80} color="#34c759" />
        <Text style={styles.title}>Your Order is Placed!</Text>
        <Text style={styles.subtitle}>
          We’ll keep you updated on your order status.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/(tabs)/orders')}
        >
          <Text style={styles.buttonText}>Go to My Orders</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { alignItems: 'center', paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#000', marginTop: 20 },
  subtitle: { fontSize: 16, color: '#666', marginTop: 8, textAlign: 'center' },
  button: {
    marginTop: 24,
    backgroundColor: '#007aff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
