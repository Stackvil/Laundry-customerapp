// app/(tabs)/home/shop/[id].tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { mockShops, serviceCategories } from '@/data/mockData';
import { PageTransition, AnimatedView, AnimatedButton, StaggeredListItem } from '@/components/Animated';

export default function ServiceCenterServicesScreen() {
  const { id, shopId } = useLocalSearchParams<{
    id?: string;
    shopId?: string;
  }>();

  const router = useRouter();
  const selectedShopId = shopId || id || '';
  const selectedShop = mockShops.find((s) => s.id === selectedShopId);

  const handleServiceSelect = (service: any) => {
    router.push({
      pathname: '/home/shop/services/[id]',
      params: {
        id: service.id,
        shopId: selectedShopId,
        serviceId: service.id,
        serviceName: service.name,
        serviceImage: service.imageUrl,
        selectedService: JSON.stringify(service),
      },
    });
  };

  return (
    <PageTransition>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={22} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Services</Text>
        </View>

        {/* Service Center Info */}
        {selectedShop && (
          <LinearGradient
            colors={['#6366f1', '#8b5cf6', '#a855f7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.shopInfoCard}
          >
            <Image source={{ uri: selectedShop.imageUrl }} style={styles.shopImage} />
            <View style={styles.shopInfo}>
              <Text style={styles.shopName}>{selectedShop.name}</Text>
              <Text style={styles.shopAddress}>{selectedShop.address}</Text>
              <View style={styles.distanceBadge}>
                <Text style={styles.shopDistance}>{selectedShop.distance}</Text>
              </View>
            </View>
          </LinearGradient>
        )}

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <AnimatedView animation="fadeInUp" delay={100}>
            <Text style={styles.sectionTitle}>Available Services</Text>
          </AnimatedView>
          
          <View style={styles.servicesGrid}>
            {serviceCategories.map((service, index) => (
              <StaggeredListItem 
                key={service.id} 
                index={index} 
                staggerDelay={80}
                style={{ width: '48%' }}
              >
                <AnimatedButton
                  style={styles.serviceCard}
                  scaleValue={0.95}
                  onPress={() => handleServiceSelect(service)}
                >
                  <LinearGradient
                    colors={['#ffffff', '#f8fafc', '#f1f5f9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.serviceCardGradient}
                  >
                    <View style={styles.serviceImageContainer}>
                      <Image source={{ uri: service.imageUrl }} style={styles.serviceImage} />
                      <LinearGradient
                        colors={['transparent', 'rgba(99, 102, 241, 0.3)']}
                        style={styles.serviceImageOverlay}
                      />
                    </View>
                    <View style={styles.serviceNameContainer}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                    </View>
                  </LinearGradient>
                </AnimatedButton>
              </StaggeredListItem>
            ))}
          </View>
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  shopInfoCard: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  shopImage: { 
    width: 64, 
    height: 64, 
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  shopInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
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
    fontSize: 13, 
    color: 'rgba(255, 255, 255, 0.9)', 
    marginBottom: 6,
  },
  distanceBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  shopDistance: { 
    fontSize: 11, 
    color: '#ffffff', 
    fontWeight: '600',
  },
  scrollContent: { padding: 16, paddingBottom: 100 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, color: '#000' },
  servicesGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
    gap: 12,
  },
  serviceCard: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  serviceCardGradient: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  serviceImageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
  },
  serviceImage: { 
    width: '100%', 
    height: 120,
    resizeMode: 'cover',
  },
  serviceImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  serviceNameContainer: {
    padding: 12,
    backgroundColor: 'transparent',
  },
  serviceName: { 
    fontSize: 14, 
    fontWeight: '700', 
    textAlign: 'center', 
    color: '#1e293b',
  },
});
