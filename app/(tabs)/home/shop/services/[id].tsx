// app/(tabs)/home/shop/index.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { mockShops } from '@/data/mockData';
import { Shop } from '@/types';
import { PageTransition } from '@/components/Animated';

export default function ServiceShopsScreen() {
  const { serviceId, serviceName, serviceImage } = useLocalSearchParams<{
    serviceId?: string;
    serviceName?: string;
    serviceImage?: string;
  }>();

  const router = useRouter();

  const handleShopSelect = (shop: Shop) => {
    router.push({
      pathname: '/home/shop/[id]',
      params: {
        id: shop.id,
        shopId: shop.id, // dynamic segment for services screen
        selectedService: JSON.stringify({
          id: serviceId,
          name: serviceName,
          imageUrl: serviceImage,
        }),
      },
    });
  };

  return (
    <PageTransition>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={22} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Service Centers Near You</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {mockShops.map((shop) => (
            <TouchableOpacity key={shop.id} style={styles.shopCard} onPress={() => handleShopSelect(shop)}>
              <Image source={{ uri: shop.imageUrl }} style={styles.shopImage} />
              <View style={styles.shopInfo}>
                <Text style={styles.shopName}>{shop.name}</Text>
                <Text style={styles.shopAddress}>{shop.address}</Text>
                <Text style={styles.shopDistance}>{shop.distance}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: { marginRight: 10 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#000' },
  scrollContent: { padding: 16 },
  shopCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  shopImage: { width: 80, height: 80, borderRadius: 8 },
  shopInfo: { flex: 1, marginLeft: 12 },
  shopName: { fontSize: 16, fontWeight: '700', color: '#000' },
  shopAddress: { fontSize: 13, color: '#666', marginTop: 4 },
  shopDistance: { fontSize: 13, color: '#999', marginTop: 4 },
});
