// app/(tabs)/home/shop/services/[id].tsx
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
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Minus, Plus } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { mockServices, mockShops } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { PageTransition, StaggeredListItem } from '@/components/Animated';

export default function LaundryItemsScreen() {
  const params = useLocalSearchParams<{ 
    shopId?: string; 
    serviceId?: string;
    serviceName?: string;
    selectedService?: string;
  }>();
  const router = useRouter();
  const { user } = useAuth();

  const shopId = (params.shopId ?? '') as string;
  const parseJsonParam = (param: string | string[] | undefined, fallback: any) => {
    if (!param || typeof param !== 'string') return fallback;
    try {
      if (param.trim().startsWith('{') || param.trim().startsWith('[')) {
        return JSON.parse(param);
      }
      return fallback;
    } catch (error) {
      console.error('Error parsing route param:', error);
      return fallback;
    }
  };
  const selectedService = parseJsonParam(params.selectedService, {
    id: params.serviceId,
    name: params.serviceName,
  });
  const shop = mockShops.find((s) => s.id === shopId) ?? null;

  const [cart, setCart] = useState<Array<any>>([]);

  const updateQuantity = (item: any, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) return prev.filter((i) => i.id !== item.id);
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: newQty } : i));
      } else if (delta > 0) {
        return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
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
            {selectedService?.name ?? 'Items'}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {shop && (
            <LinearGradient
              colors={['#6366f1', '#8b5cf6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.shopCard}
            >
              <Image source={{ uri: shop.imageUrl }} style={styles.shopImage} />
              <View style={styles.shopInfo}>
                <Text style={styles.shopName}>{shop.name}</Text>
                {shop.address && <Text style={styles.shopAddress}>{shop.address}</Text>}
                {selectedService?.name && (
                  <View style={styles.serviceTypeBadge}>
                    <Text style={styles.serviceType}>Service: {selectedService.name}</Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          )}

          {mockServices.map((item, index) => {
            const qty = getQty(item.id);
            return (
              <StaggeredListItem key={item.id} index={index} staggerDelay={50}>
                <LinearGradient
                  colors={qty > 0 ? ['#fef3c7', '#fde68a', '#fcd34d'] : ['#ffffff', '#f8fafc', '#f1f5f9']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.itemCard}
                >
                  <View style={styles.itemImageContainer}>
                    <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                    {qty > 0 && (
                      <View style={styles.quantityBadge}>
                        <Text style={styles.quantityBadgeText}>{qty}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>
                      <Text style={styles.itemUnit}> per {item.unit}</Text>
                    </View>
                  </View>
                  <View style={styles.qtyControls}>
                    {qty > 0 && (
                      <TouchableOpacity
                        style={styles.qtyBtnMinus}
                        onPress={() => updateQuantity(item, -1)}
                      >
                        <Minus size={16} color="#fff" />
                      </TouchableOpacity>
                    )}
                    {qty > 0 && <Text style={styles.qtyText}>{qty}</Text>}
                    <TouchableOpacity
                      style={styles.qtyBtnPlus}
                      onPress={() => updateQuantity(item, 1)}
                    >
                      <Plus size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </StaggeredListItem>
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
    margin: 6,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  shopImage: { 
    width: 70, 
    height: 70, 
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  shopInfo: { marginLeft: 12, flex: 1 },
  shopName: { 
    fontSize: 18, 
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  shopAddress: { 
    color: 'rgba(255, 255, 255, 0.9)', 
    marginTop: 2, 
    fontSize: 13,
    marginBottom: 6,
  },
  serviceTypeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginTop: 4,
  },
  serviceType: { 
    fontWeight: '600', 
    color: '#ffffff', 
    fontSize: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  itemImageContainer: {
    position: 'relative',
  },
  itemImage: { 
    width: 64, 
    height: 64, 
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  quantityBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  quantityBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  itemInfo: { flex: 1, marginLeft: 14 },
  itemName: { 
    fontSize: 16, 
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  itemPrice: { 
    fontSize: 16, 
    fontWeight: '700',
    color: '#6366f1',
  },
  itemUnit: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  qtyControls: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
  },
  qtyBtnMinus: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  qtyBtnPlus: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  qtyText: { 
    fontSize: 16, 
    marginHorizontal: 8, 
    fontWeight: '700',
    color: '#1e293b',
    minWidth: 24,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 2,
    borderTopColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  totalContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  totalText: { 
    fontSize: 20, 
    fontWeight: '700',
    color: '#6366f1',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#6366f1',
    padding: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmText: { 
    color: '#fff', 
    fontWeight: '700',
    fontSize: 16,
  },
});
