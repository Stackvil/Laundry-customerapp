// app/(tabs)/home/shop/services/[shopId].tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Minus, Plus } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { mockServices, mockShops } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { PageTransition } from '@/components/Animated';

export default function LaundryServiceScreen() {
  const params = useLocalSearchParams<{ shopId?: string; selectedService?: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const shopId = (params.shopId ?? '') as string;
  const selectedService = params.selectedService ? JSON.parse(params.selectedService) : null;
  const shop = mockShops.find((s) => s.id === shopId) ?? null;

  const [cart, setCart] = useState<Array<any>>([]);

  const updateQuantity = (service: any, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === service.id);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) return prev.filter((i) => i.id !== service.id);
        return prev.map((i) => (i.id === service.id ? { ...i, quantity: newQty } : i));
      } else if (delta > 0) {
        return [...prev, { id: service.id, name: service.name, price: service.price, quantity: 1 }];
      }
      return prev;
    });
  };

  const getQty = (id: string) => cart.find((i) => i.id === id)?.quantity || 0;

  const totalAmount = useMemo(
    () => cart.reduce((s, i) => s + i.price * i.quantity, 0),
    [cart]
  );

  const handleConfirm = () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items before proceeding.');
      return;
    }
    if (!shop) {
      Alert.alert('Error', 'Shop details not found.');
      return;
    }
    if (!user) {
      Alert.alert('Account Required', 'Please sign in or create an account to continue.', [
        { text: 'Sign In', onPress: () => router.push('/login') },
        { text: 'Sign Up', onPress: () => router.push('/signup') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    router.push({
      pathname: '/confirm-order',
      params: {
        cart: JSON.stringify(
          cart.map((i) => ({
            serviceId: i.id,
            serviceName: i.name,
            quantity: i.quantity,
            price: i.price,
          }))
        ),
        totalAmount: totalAmount.toString(),
        selectedServiceCenter: JSON.stringify(shop),
        selectedService: JSON.stringify(selectedService),
      },
    });
  };

  return (
    <PageTransition>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={22} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {selectedService?.name ?? 'Laundry Services'}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
        {shop ? (
          <View style={styles.shopCard}>
            <Image source={{ uri: shop.imageUrl }} style={styles.shopImage} />
            <View style={styles.shopInfo}>
              <Text style={styles.shopName}>{shop.name}</Text>
              {shop.address && <Text style={styles.shopAddress}>{shop.address}</Text>}
              {selectedService?.name && (
                <Text style={styles.serviceType}>Selected: {selectedService.name}</Text>
              )}
            </View>
          </View>
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>
            Shop not found.
          </Text>
        )}

        {mockServices.map((service) => {
          const qty = getQty(service.id);
          return (
            <View key={service.id} style={styles.serviceCard}>
              <Image source={{ uri: service.imageUrl }} style={styles.serviceImage} />
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.servicePrice}>₹{service.price.toFixed(2)}</Text>
              </View>
              <View style={styles.qtyControls}>
                {qty > 0 && (
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(service, -1)}
                  >
                    <Minus size={14} color="#fff" />
                  </TouchableOpacity>
                )}
                {qty > 0 && <Text style={styles.qtyText}>{qty}</Text>}
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(service, 1)}
                >
                  <Plus size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {cart.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>₹{totalAmount.toFixed(2)}</Text>
            <Text style={{ color: '#666', fontSize: 13 }}>
              {cart.length} item{cart.length > 1 ? 's' : ''} selected
            </Text>
          </View>
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmText}>Preview Order</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', marginLeft: 10, color: '#000' },
  scrollContent: { paddingBottom: 120, padding: 12 },
  shopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 6,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f3f3f3',
  },
  shopImage: { width: 64, height: 64, borderRadius: 8 },
  shopInfo: { marginLeft: 10, flex: 1 },
  shopName: { fontSize: 16, fontWeight: '700' },
  shopAddress: { color: '#666', marginTop: 4 },
  serviceType: { marginTop: 6, fontWeight: '600', color: '#333' },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f4f4f4',
  },
  serviceImage: { width: 56, height: 56, borderRadius: 8 },
  serviceInfo: { flex: 1, marginLeft: 12 },
  serviceName: { fontSize: 15, fontWeight: '600' },
  servicePrice: { marginTop: 6, color: '#666' },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: { fontSize: 15, marginHorizontal: 6, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  totalText: { fontSize: 18, fontWeight: '700' },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: { color: '#fff', fontWeight: '700' },
});
