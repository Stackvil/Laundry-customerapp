import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { ArrowLeft, Camera, MapPin, Navigation, X, Play } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import { AppUser } from './types';
import { Video, ResizeMode } from 'expo-av';
import { AnimatedView, AnimatedButton, PageTransition } from '@/components/Animated';

export default function ConfirmOrderScreen() {
  const { cart, totalAmount, selectedService, selectedServiceCenter } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const cartItems = cart ? JSON.parse(cart as string) : [];
  const serviceCenter = selectedServiceCenter ? JSON.parse(selectedServiceCenter as string) : null;
  const service = selectedService ? JSON.parse(selectedService as string) : null;

  const [name, setName] = useState((user as AppUser)?.name || '');
  const [mobile, setMobile] = useState((user as AppUser)?.mobile || '');
  const [address, setAddress] = useState((user as AppUser)?.address || '');
  const [images, setImages] = useState<string[]>([]);
  const [videoUri, setVideoUri] = useState<string>('');
  const [uploadType, setUploadType] = useState<'images' | 'video' | null>(null);
  const [pickupAddress, setPickupAddress] = useState<string>('');
  const [pickupCoordinates, setPickupCoordinates] = useState<{latitude: number, longitude: number} | null>(null);
  
  // Image/Video viewer states
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [isVideoPlayerVisible, setIsVideoPlayerVisible] = useState(false);

  // Handle location selection from location picker
  useFocusEffect(() => {
    const handleLocationSelection = async () => {
      try {
        const savedLocation = await AsyncStorage.getItem('selectedPickupLocation');
        if (savedLocation) {
          const location = JSON.parse(savedLocation);
          setPickupAddress(location.address);
          setPickupCoordinates({
            latitude: location.latitude,
            longitude: location.longitude,
          });
          // Clear the saved location after reading it
          await AsyncStorage.removeItem('selectedPickupLocation');
        }
      } catch (error) {
        console.error('Error reading selected location:', error);
      }
    };
    
    handleLocationSelection();
  });

  const handlePickImage = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission Required', 'Camera permission is required to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.7,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled) {
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const handlePickVideo = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission Required', 'Camera permission is required to record video.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 0.7,
      videoMaxDuration: 60, // 60 seconds max
    });
    if (!result.canceled) {
      setVideoUri(result.assets[0].uri);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveVideo = () => {
    setVideoUri('');
  };

  const handleImagePress = (imageUri: string) => {
    setSelectedImage(imageUri);
    setIsImageViewerVisible(true);
  };

  const closeImageViewer = () => {
    setIsImageViewerVisible(false);
    setSelectedImage(null);
  };

  const handleVideoPress = () => {
    setIsVideoPlayerVisible(true);
  };

  const closeVideoPlayer = () => {
    setIsVideoPlayerVisible(false);
  };

  const handleSelectPickupLocation = () => {
    // Navigate to location picker screen
    router.push('/location-picker');
  };

  const handleConfirm = () => {
    if (!user) {
      Alert.alert('Account Required', 'Please sign in or create an account.', [
        { text: 'Sign In', onPress: () => router.push('/login') },
        { text: 'Sign Up', onPress: () => router.push('/signup') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }
    if (!name || !mobile || !address) {
      Alert.alert('Missing Information', 'Please fill all delivery details (Name, Mobile, Address).');
      return;
    }
    if (!pickupAddress) {
      Alert.alert('Pickup Location Required', 'Please select a pickup address.');
      return;
    }
    if (!uploadType) {
      Alert.alert('Upload Required', 'Please select items quantity and upload images or video.');
      return;
    }
    if (uploadType === 'images' && images.length === 0) {
      Alert.alert('Images Required', 'Please upload at least one image of your items.');
      return;
    }
    if (uploadType === 'video' && !videoUri) {
      Alert.alert('Video Required', 'Please record a video of your items.');
      return;
    }

    router.push({
      pathname: '/order-placed',
      params: {
        cart: JSON.stringify(cartItems),
        totalAmount,
        name,
        mobile,
        address,
        pickupAddress,
        pickupCoordinates: pickupCoordinates ? JSON.stringify(pickupCoordinates) : '',
        images: JSON.stringify(images),
        videoUri: videoUri || '',
        uploadType: uploadType || '',
        selectedService: JSON.stringify(service),
        serviceCenter: JSON.stringify(serviceCenter),
      },
    });
  };

  return (
    <PageTransition>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* Header */}
          <AnimatedView animation="fadeInDown">
            <View style={styles.header}>
              <AnimatedButton onPress={() => router.back()} style={styles.backButton}>
                <ArrowLeft size={24} color="#000" />
            </AnimatedButton>
            <Text style={styles.headerTitle}>Confirm Order</Text>
          </View>
        </AnimatedView>

        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          {/* 1. Selected Service */}
          {service && (
            <AnimatedView animation="fadeInUp" delay={100}>
              <View style={styles.section}>
              <Text style={styles.sectionTitle}>Selected Service</Text>
              <View style={styles.itemRow}>
                {service.imageUrl && (
                    <Image source={{ uri: service.imageUrl }} style={styles.itemImage} />
                  )}
                  <View style={styles.itemDetails}>
                   <Text style={styles.itemText}>{service.name}</Text>
                  </View>
                </View>
              </View>
            </AnimatedView>
          )}

          {/* 2. Selected Service Center */}
          {serviceCenter && (
            <AnimatedView animation="fadeInUp" delay={150}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Selected Service Center</Text>
                <View style={styles.itemRow}>
                  {serviceCenter.imageUrl && (
                    <Image source={{ uri: serviceCenter.imageUrl }} style={styles.itemImage} />
                  )}
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemText}>{serviceCenter.name}</Text>
                    {serviceCenter.address && (
                      <Text style={[styles.itemText, { marginTop: 4 }]}>{serviceCenter.address}</Text>
                    )}
                  </View>
                </View>
              </View>
            </AnimatedView>
          )}

          {/* 3. Pickup Address */}
          <AnimatedView animation="fadeInUp" delay={200}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pickup Address</Text>
              <Text style={styles.sectionSubtitle}>Select your pickup location</Text>
              <AnimatedButton style={styles.pickupButton} onPress={handleSelectPickupLocation}>
                <MapPin size={20} color="#fff" />
                <Text style={styles.pickupButtonText}>
                  {pickupAddress ? 'Change Pickup Location' : 'Select Pickup Location'}
                </Text>
              </AnimatedButton>
              {pickupAddress ? (
                <View style={styles.pickupAddressDisplay}>
                  <Navigation size={16} color="#666" />
                  <Text style={styles.pickupAddressText}>{pickupAddress}</Text>
                </View>
              ) : (
                <Text style={styles.pickupPlaceholder}>No pickup location selected</Text>
              )}
            </View>
          </AnimatedView>

          {/* 4. Mobile Number */}
          <AnimatedView animation="fadeInUp" delay={250}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mobile Number</Text>
              <Text style={styles.sectionSubtitle}>Enter your contact number</Text>
              <TextInput
                style={styles.input}
                placeholder="Mobile Number"
                value={mobile}
                onChangeText={setMobile}
                keyboardType="phone-pad"
              />
            </View>
          </AnimatedView>

          {/* 5. Delivery Details */}
          <AnimatedView animation="fadeInUp" delay={300}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Delivery Details</Text>
              <Text style={styles.sectionSubtitle}>Edit your delivery information below</Text>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Mobile Number"
                value={mobile}
                onChangeText={setMobile}
                keyboardType="phone-pad"
              />
              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Address"
                value={address}
                onChangeText={setAddress}
                multiline
              />
            </View>
          </AnimatedView>

          {/* 6. Upload Items - Images or Video */}
          <AnimatedView animation="fadeInUp" delay={350}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Upload Your Items</Text>
              <Text style={styles.sectionSubtitle}>Select the quantity of items you have</Text>
              
              {/* Quantity Selection Buttons */}
              <View style={styles.quantityButtons}>
                <AnimatedButton
                  style={[styles.quantityBtn, uploadType === 'images' && styles.quantityBtnActive]}
                  onPress={() => {
                    setUploadType('images');
                    setVideoUri('');
                  }}
                >
                  <Text style={[styles.quantityBtnText, uploadType === 'images' && styles.quantityBtnTextActive]}>
                    Less than 10 items
                  </Text>
                </AnimatedButton>
                
                <AnimatedButton
                  style={[styles.quantityBtn, uploadType === 'video' && styles.quantityBtnActive]}
                  onPress={() => {
                    setUploadType('video');
                    setImages([]);
                  }}
                >
                  <Text style={[styles.quantityBtnText, uploadType === 'video' && styles.quantityBtnTextActive]}>
                    More than 10 items
                  </Text>
                </AnimatedButton>
              </View>

              {/* Image Upload Section */}
              {uploadType === 'images' && (
                <View style={styles.uploadSection}>
                  <Text style={styles.uploadInstructions}>
                    📸 Upload all your items images clearly
                  </Text>
                  <AnimatedButton style={styles.uploadBtn} onPress={handlePickImage}>
                    <Camera size={20} color="#fff" />
                    <Text style={styles.uploadText}>Take Photo</Text>
                  </AnimatedButton>
                  {images.length > 0 && (
                    <View style={styles.imageGrid}>
                      {images.map((uri, idx) => (
                        <View key={idx} style={styles.imageContainer}>
                          <AnimatedButton onPress={() => handleImagePress(uri)}>
                            <Image source={{ uri }} style={styles.image} />
                          </AnimatedButton>
                          <AnimatedButton
                            style={styles.removeBtn}
                            onPress={() => handleRemoveImage(idx)}
                          >
                            <Text style={styles.removeBtnText}>✕</Text>
                          </AnimatedButton>
                        </View>
                      ))}
                    </View>
                  )}
                  {images.length > 0 && (
                    <Text style={styles.imageCount}>{images.length} image(s) uploaded</Text>
                  )}
                </View>
              )}

              {/* Video Upload Section */}
              {uploadType === 'video' && (
                <View style={styles.uploadSection}>
                  <Text style={styles.uploadInstructions}>
                    🎥 Spread your items neatly and take a clear video
                  </Text>
                  <Text style={styles.uploadSubInstructions}>
                    • Spread all items on a clean surface{'\n'}
                    • Record a slow pan video (max 60 seconds){'\n'}
                    • Ensure good lighting for clarity
                  </Text>
                  <AnimatedButton style={[styles.uploadBtn, styles.videoBtn]} onPress={handlePickVideo}>
                    <Camera size={20} color="#fff" />
                    <Text style={styles.uploadText}>Record Video</Text>
                  </AnimatedButton>
                  {videoUri && (
                    <View style={styles.videoContainer}>
                      <AnimatedButton 
                        style={styles.videoPreview}
                        onPress={handleVideoPress}
                      >
                        <Play size={60} color="#007AFF" />
                        <Text style={styles.videoText}>Video recorded successfully</Text>
                        <Text style={styles.videoSubText}>Tap to preview video</Text>
                      </AnimatedButton>
                      <AnimatedButton
                        style={styles.removeVideoBtn}
                        onPress={handleRemoveVideo}
                      >
                        <Text style={styles.removeVideoBtnText}>Remove Video</Text>
                      </AnimatedButton>
                    </View>
                  )}
                </View>
              )}
            </View>
          </AnimatedView>

          {/* 7. Order Summary */}
          <AnimatedView animation="fadeInUp" delay={400}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Summary</Text>
              {cartItems.map((i: any, idx: number) => (
                <View key={idx} style={styles.orderItem}>
                  <Text style={styles.itemText}>{i.quantity} × {i.serviceName}</Text>
                  <Text style={styles.itemPrice}>₹{(i.quantity * i.price).toFixed(2)}</Text>
                </View>
              ))}
              <Text style={styles.totalText}>Total: ₹{totalAmount}</Text>
            </View>
          </AnimatedView>
        </ScrollView>

        {/* Footer */}
        <AnimatedView animation="fadeInUp" delay={500}>
          <View style={styles.footer}>
            <AnimatedButton style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmText}>Confirm Order</Text>
            </AnimatedButton>
          </View>
        </AnimatedView>
      </KeyboardAvoidingView>

      {/* Image Viewer Modal */}
      <Modal
        visible={isImageViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageViewer}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalCloseButton} 
            onPress={closeImageViewer}
          >
            <X size={24} color="#fff" />
          </TouchableOpacity>
          {selectedImage && (
            <Image 
              source={{ uri: selectedImage }} 
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* Video Player Modal */}
      <Modal
        visible={isVideoPlayerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeVideoPlayer}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalCloseButton} 
            onPress={closeVideoPlayer}
          >
            <X size={24} color="#fff" />
          </TouchableOpacity>
          {videoUri && (
            <View style={styles.videoModalContainer}>
              <Video
                source={{ uri: videoUri }}
                style={styles.fullScreenVideo}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay
              />
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  backButton: { marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  section: { backgroundColor: '#fff', margin: 16, padding: 16, borderRadius: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  sectionSubtitle: { fontSize: 14, color: '#666', marginBottom: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemImage: { width: 80, height: 80, borderRadius: 8 },
  itemDetails: { flex: 1 },
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  itemText: { fontSize: 16, color: '#000' },
  itemPrice: { fontSize: 16, fontWeight: '600', color: '#000' },
  totalText: { textAlign: 'right', fontWeight: '700', marginTop: 8 },
  input: { backgroundColor: '#f2f2f2', borderRadius: 8, padding: 12, marginBottom: 10 },
  
  // Quantity Selection Buttons
  quantityButtons: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  quantityBtn: { 
    flex: 1, 
    padding: 14, 
    borderRadius: 8, 
    borderWidth: 2, 
    borderColor: '#ddd', 
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  quantityBtnActive: { 
    borderColor: '#000', 
    backgroundColor: '#f0f0f0',
  },
  quantityBtnText: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: '#666',
    textAlign: 'center',
  },
  quantityBtnTextActive: { 
    color: '#000',
  },
  
  // Upload Section
  uploadSection: { marginTop: 12 },
  uploadInstructions: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#333', 
    marginBottom: 8,
    textAlign: 'center',
  },
  uploadSubInstructions: { 
    fontSize: 13, 
    color: '#666', 
    marginBottom: 12,
    lineHeight: 20,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  uploadBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#000', 
    padding: 12, 
    borderRadius: 8, 
    gap: 8,
    marginBottom: 12,
  },
  videoBtn: {
    backgroundColor: '#007AFF',
  },
  uploadText: { color: '#fff', fontWeight: '600' },
  
  // Image Grid
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  imageContainer: { position: 'relative' },
  image: { width: 80, height: 80, borderRadius: 8 },
  removeBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff3b30',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  imageCount: { 
    fontSize: 13, 
    color: '#666', 
    marginTop: 8, 
    textAlign: 'center',
  },
  
  // Video Preview
  videoContainer: { marginTop: 8 },
  videoPreview: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  videoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 12,
  },
  videoSubText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  removeVideoBtn: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 12,
    alignSelf: 'center',
  },
  removeVideoBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  
  footer: { backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#ddd' },
  confirmBtn: { backgroundColor: '#000', borderRadius: 8, padding: 16, alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  
  // Pickup Address Styles
  pickupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
  },
  pickupButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  pickupAddressDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  pickupAddressText: { flex: 1, fontSize: 14, color: '#333', lineHeight: 20 },
  pickupPlaceholder: { fontSize: 14, color: '#999', fontStyle: 'italic', textAlign: 'center', padding: 12 },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 10,
  },
  fullScreenImage: {
    width: Dimensions.get('window').width - 40,
    height: Dimensions.get('window').height - 100,
  },
  videoModalContainer: {
    width: Dimensions.get('window').width - 40,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenVideo: {
    width: '100%',
    height: '100%',
  },
});
