import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Animated as RNAnimated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';
import { mockShops } from '@/data/mockData';
import { useRouter } from 'expo-router';
import { AnimatedView, AnimatedButton, StaggeredListItem } from '@/components/Animated';
import { useFonts, Montserrat_800ExtraBold, Montserrat_700Bold, Montserrat_500Medium } from '@expo-google-fonts/montserrat';

const LOGO_IMAGE = require('@/assets/images/logo1.png');

type SlideItem = 
  | { type: 'video'; source: any }
  | { type: 'image'; source: any };

// Image slides
const IMAGE_SLIDES: SlideItem[] = [
  { type: 'image', source: require('@/assets/images/promo1.png') },
  { type: 'image', source: require('@/assets/images/promo2.webp') },
  { type: 'image', source: require('@/assets/images/promo3.jpg') },
  { type: 'image', source: require('@/assets/images/promo4.jpg') },
  { type: 'image', source: require('@/assets/images/promo5.jpg') },
  { type: 'image', source: require('@/assets/images/promo6.jpg') },
];

const SLIDE_DURATION = 4000; // 4 seconds per slide

export default function HomeScreen() {
  const router = useRouter();
  
  // State for image slides
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageSlideIntervalRef = useRef<number | null>(null);
  const hasStartedSliding = useRef(false);
  
  const currentImageSlide = IMAGE_SLIDES[currentImageIndex];
  
  // Start with opacity 1 so first image is immediately visible
  const imageFadeAnim = useRef(new RNAnimated.Value(1)).current;

  // Load Montserrat fonts
  const [fontsLoaded] = useFonts({
    Montserrat_800ExtraBold,
    Montserrat_700Bold,
    Montserrat_500Medium,
  });

  // Function to advance image slides
  const advanceImageSlide = useCallback(() => {
    hasStartedSliding.current = true;
    RNAnimated.timing(imageFadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentImageIndex((prev) => (prev + 1) % IMAGE_SLIDES.length);
      RNAnimated.timing(imageFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  }, [imageFadeAnim]);

  // Ensure first image is visible immediately on mount
  useEffect(() => {
    imageFadeAnim.setValue(1);
  }, [imageFadeAnim]);

  // Auto-advance image slides continuously (start after initial delay)
  useEffect(() => {
    // Wait one full slide duration before starting the interval to ensure first image displays
    const startTimer = setTimeout(() => {
      if (imageSlideIntervalRef.current !== null) {
        clearInterval(imageSlideIntervalRef.current);
        imageSlideIntervalRef.current = null;
      }

      imageSlideIntervalRef.current = setInterval(advanceImageSlide, SLIDE_DURATION) as unknown as number;
    }, SLIDE_DURATION); // Wait one full slide duration before starting

    return () => {
      clearTimeout(startTimer);
      if (imageSlideIntervalRef.current !== null) {
        clearInterval(imageSlideIntervalRef.current);
      }
    };
  }, [advanceImageSlide]);


  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.appInfoContainer}>
            <View style={styles.logoContainer}>
              <Image 
                source={LOGO_IMAGE} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.appNameContainer}>
              <Text style={styles.appName}>LAUNDRY POINT</Text>
              <Text style={styles.appTagline}>LAUNDRY SERVICES</Text>
            </View>
          </View>
        </View>

        {/* Image Slider Section */}
        <View style={styles.bannerContainer}>
          {/* Render first image without animation wrapper to ensure it displays */}
          {currentImageIndex === 0 && !hasStartedSliding.current ? (
            <View style={styles.slideWrapper}>
              <Image 
                source={IMAGE_SLIDES[0].source}
                style={styles.banner}
                resizeMode="cover"
                onLoad={() => console.log('First image (promo1.png) loaded successfully')}
                onError={(error) => {
                  console.error('ERROR: First image (promo1.png) failed to load');
                  console.error('Error details:', error.nativeEvent.error);
                  console.error('Image source:', IMAGE_SLIDES[0].source);
                }}
              />
            </View>
          ) : (
            <RNAnimated.View style={[styles.slideWrapper, { opacity: imageFadeAnim }]}>
              <Image 
                key={`image-${currentImageIndex}`}
                source={currentImageSlide.source}
                style={styles.banner}
                resizeMode="cover"
                onError={(error) => {
                  console.error('Image load error:', error.nativeEvent.error);
                  console.error('Failed to load image at index:', currentImageIndex);
                  console.error('Image source:', currentImageSlide.source);
                }}
              />
            </RNAnimated.View>
          )}
          
          {/* Image Slide Indicators */}
          <View style={styles.indicators}>
            {IMAGE_SLIDES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentImageIndex && styles.indicatorActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Service Centers */}
        <View style={styles.categoriesContainer}>
          <AnimatedView animation="fadeInLeft" delay={200}>
            <Text style={styles.sectionTitle}>Service Centers Near You</Text>
          </AnimatedView>
          <View style={styles.serviceCentersWrap}>
            {mockShops.map((shop, index) => (
              <StaggeredListItem 
                key={shop.id} 
                index={index} 
                staggerDelay={80}
              >
                <AnimatedButton
                  style={styles.serviceCenterCard}
                  scaleValue={0.95}
                  onPress={() =>
                    router.push({
                      pathname: '/home/shop/[id]',
                      params: {
                        id: shop.id,
                        shopId: shop.id,
                      },
                    })
                  }
                >
                  <LinearGradient
                    colors={['#ffffff', '#f8f9ff', '#f0f4ff']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardGradient}
                  >
                    <View style={styles.cardContent}>
                      <Image 
                        source={{ uri: shop.imageUrl }} 
                        style={styles.serviceCenterImage}
                        resizeMode="cover"
                      />
                      <View style={styles.serviceCenterInfo}>
                        <Text style={styles.serviceCenterName}>{shop.name}</Text>
                        <Text style={styles.serviceCenterAddress}>{shop.address}</Text>
                        <View style={styles.distanceBadge}>
                          <Text style={styles.serviceCenterDistance}>{shop.distance}</Text>
                        </View>
                      </View>
                      <View style={styles.arrowContainer}>
                        <ChevronRight size={24} color="#6366f1" />
                      </View>
                    </View>
                  </LinearGradient>
                </AnimatedButton>
              </StaggeredListItem>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollView: { flex: 1 },
  header: {
    paddingHorizontal: 60,
    paddingVertical: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  appInfoContainer: { 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
  },
  logoContainer: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logo: { 
    width: 70, 
    height: 70, 
  },
  logoPlaceholder: {
    width: 70,
    height: 70,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  appNameContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  appName: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#3b82f6', // Vibrant blue matching the logo
    letterSpacing: 1,
    fontFamily: 'Montserrat_800ExtraBold',
    textTransform: 'uppercase',
    lineHeight: 24,
  },
  appTagline: {
    fontSize: 11,
    fontWeight: '500',
    color: '#000',
    letterSpacing: 0.8,
    fontFamily: 'Montserrat_500Medium',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    lineHeight: 14,
    marginTop: 1,
  },
  bannerContainer: { 
    margin: 16, 
    borderRadius: 12, 
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000', // Black background to prevent white screen
  },
  slideWrapper: {
    width: '100%',
    height: 180,
    backgroundColor: '#000', // Black background to prevent white screen
  },
  banner: { 
    width: '100%', 
    height: 180,
    backgroundColor: '#000', // Black background to prevent white screen
  },
  indicators: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  indicatorActive: {
    backgroundColor: '#fff',
    width: 20,
  },
  categoriesContainer: { paddingHorizontal: 16, marginBottom: 24 },
  serviceCentersWrap: { gap: 12 },
  serviceCenterCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    minHeight: 100,
  },
  cardGradient: {
    borderRadius: 16,
    padding: 12,
    width: '100%',
    minHeight: 100,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    flex: 1,
  },
  serviceCenterImage: { 
    width: 80, 
    height: 80, 
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  serviceCenterInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  serviceCenterName: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#1e293b', 
    marginBottom: 4,
  },
  serviceCenterAddress: { 
    fontSize: 13, 
    color: '#64748b', 
    marginBottom: 6,
  },
  distanceBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  serviceCenterDistance: { 
    fontSize: 11, 
    color: '#6366f1', 
    fontWeight: '600',
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingLeft: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
});
