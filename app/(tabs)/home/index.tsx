import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { serviceCategories } from '@/data/mockData';
import { useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { AnimatedView, AnimatedButton, StaggeredListItem, PageTransition } from '@/components/Animated';

export default function HomeScreen() {
  const router = useRouter();
  const [promoImages] = useState([
    require('@/assets/images/promo1.webp'),
    require('@/assets/images/promo2.webp'),
  ]);
  const [showImages, setShowImages] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (showImages) {
      imageIntervalRef.current = setInterval(() => {
        setCurrentImageIndex((p) => (p + 1) % promoImages.length);
      }, 3000) as unknown as number;
    }
    return () => {
      if (imageIntervalRef.current !== null)
        clearInterval(imageIntervalRef.current);
    };
  }, [showImages]);

  return (
    <PageTransition>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <AnimatedView animation="fadeInDown" delay={0}>
          <View style={styles.header}>
            <View style={styles.appInfoContainer}>
              <Image source={require('@/assets/images/logo1.jpg')} style={styles.logo} />
              <Text style={styles.appName}>Laundry Point</Text>
            </View>
          </View>
        </AnimatedView>

        {/* Banner */}
        <AnimatedView animation="scaleIn" delay={100}>
          <View style={styles.bannerContainer}>
            {!showImages ? (
              <Video
                source={require('@/assets/videos/bannerla.mp4')}
                style={styles.banner}
                resizeMode={ResizeMode.COVER}
                shouldPlay
                isLooping={false}
                onPlaybackStatusUpdate={(status) => {
                  if (status.isLoaded && status.didJustFinish) setShowImages(true);
                }}
                isMuted
              />
            ) : (
              <Image source={promoImages[currentImageIndex]} style={styles.banner} />
            )}
          </View>
        </AnimatedView>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <AnimatedView animation="fadeInLeft" delay={200}>
            <Text style={styles.sectionTitle}>Services</Text>
          </AnimatedView>
          <View style={styles.categoriesWrap}>
            {serviceCategories.map((category, index) => (
              <StaggeredListItem 
                key={category.id} 
                index={index} 
                staggerDelay={100}
                style={{ width: '31%' }}
              >
                <AnimatedButton
                  style={styles.categoryCard}
                  scaleValue={0.92}
                  onPress={() =>
                    router.push({
                      pathname: '/home/shop/services/[id]',
                      params: {
                        id: category.id,
                        serviceId: category.id,
                        serviceName: category.name,
                        serviceImage: category.imageUrl,
                      },
                    })
                  }
                >
                  <Image source={{ uri: category.imageUrl }} style={styles.categoryImage} />
                  <Text style={styles.categoryName}>{category.name}</Text>
                </AnimatedButton>
              </StaggeredListItem>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollView: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appInfoContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  logo: { 
    width: 32, 
    height: 32, 
    borderRadius: 8 
  },
  appName: { 
    marginLeft: 12, 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#000' 
  },
  bannerContainer: { margin: 16, borderRadius: 12, overflow: 'hidden' },
  banner: { width: '100%', height: 180 },
  categoriesContainer: { paddingHorizontal: 16, marginBottom: 24 },
  categoriesWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryCard: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  categoryImage: { width: '100%', height: 92 },
  categoryName: { padding: 8, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
});
