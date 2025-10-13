import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { CircleCheck as CheckCircle, Phone, User, MapPin, X, Video as VideoIcon } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import { Video, ResizeMode } from 'expo-av';
import { PageTransition } from '@/components/Animated';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      const stored = await AsyncStorage.getItem('orders');
      if (!stored) return;
      const parsed = JSON.parse(stored);
      const found = parsed.find((o: any) => o.id === id);
      if (!found) return;

      setOrder(found);
    };
    fetchOrder();
  }, [id]);

  const handleImagePress = (imageUri: string) => {
    setSelectedImage(imageUri);
    setIsImageViewerVisible(true);
  };

  const closeImageViewer = () => {
    setIsImageViewerVisible(false);
    setSelectedImage(null);
  };

  if (!order) return null;

  const trackingSteps = [
    { label: 'Order Placed', completed: true },
    { label: 'Picked Up', completed: ['Picked Up', 'In Progress', 'Out for Delivery', 'Delivered'].includes(order.status) },
    { label: 'In Progress', completed: ['In Progress', 'Out for Delivery', 'Delivered'].includes(order.status) },
    { label: 'Out for Delivery', completed: ['Out for Delivery', 'Delivered'].includes(order.status) },
    { label: 'Delivered', completed: order.status === 'Delivered' },
  ];

  return (
    <PageTransition>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>

          {/* Order Tracking */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Status</Text>
          <View style={styles.trackingContainer}>
            {trackingSteps.map((step, idx) => (
              <View key={idx} style={styles.trackingWrapper}>
                <View style={[styles.stepIndicator, step.completed && styles.stepIndicatorCompleted]}>
                  {step.completed && <CheckCircle size={14} color="#fff" />}
                </View>
                {idx < trackingSteps.length - 1 && (
                  <View
                    style={[
                      styles.connector,
                      trackingSteps[idx + 1].completed && styles.connectorCompleted,
                    ]}
                  />
                )}
                <Text style={[styles.stepLabel, step.completed && styles.stepLabelCompleted]}>
                  {step.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pickup Address */}
        {order.pickupAddress && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pickup Address</Text>
            <View style={styles.pickupAddressDisplay}>
              <MapPin size={16} color="#666" />
              <Text style={styles.pickupAddressText}>{order.pickupAddress}</Text>
            </View>
          </View>
        )}

        {/* Mobile Number */}
        {order.mobile && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mobile Number</Text>
            <View style={styles.mobileDisplay}>
              <Phone size={16} color="#666" />
              <Text style={styles.mobileText}>{order.mobile}</Text>
            </View>
          </View>
        )}

        {/* Delivery Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          <View style={styles.deliveryField}>
            <Text style={styles.deliveryText}>{order.customerName || user?.name || 'User'}</Text>
          </View>
          <View style={styles.deliveryField}>
            <Text style={styles.deliveryText}>{order.mobile}</Text>
          </View>
          <View style={styles.deliveryField}>
            <Text style={styles.deliveryText}>{order.address}</Text>
          </View>
        </View>

        {/* Selected Service */}
        {order.service && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selected Service</Text>
            <View style={styles.itemRow}>
              {order.service.imageUrl && (
                <Image source={{ uri: order.service.imageUrl }} style={styles.itemImage} />
              )}
              <View style={styles.itemDetails}>
                <Text style={styles.itemText}>{order.service.name}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Service Center */}
        {order.serviceCenter && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Center</Text>
            <View style={styles.itemRow}>
              {order.serviceCenter.imageUrl && (
                <Image source={{ uri: order.serviceCenter.imageUrl }} style={styles.itemImage} />
              )}
              <View style={styles.itemDetails}>
                <Text style={styles.itemText}>{order.serviceCenter.name}</Text>
                {order.serviceCenter.address && (
                  <Text style={[styles.itemText, { marginTop: 4 }]}>{order.serviceCenter.address}</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {order.cartItems.map((item: any, idx: number) => (
            <View key={idx} style={styles.orderItem}>
              <Text style={styles.itemText}>{item.quantity} × {item.serviceName}</Text>
              <Text style={styles.itemPrice}>₹{(item.quantity * item.price).toFixed(2)}</Text>
            </View>
          ))}
          <Text style={styles.totalText}>Total: ₹{Number(order.totalAmount).toFixed(2)}</Text>
        </View>

        {/* Uploaded Items - Images or Video */}
        {order.uploadType === 'images' && order.images && order.images.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Uploaded Items Images</Text>
            <Text style={styles.uploadTypeLabel}>📸 Less than 10 items</Text>
            <View style={styles.imageGrid}>
              {order.images.map((imageUri: string, idx: number) => (
                <TouchableOpacity 
                  key={idx} 
                  onPress={() => handleImagePress(imageUri)}
                  style={styles.imageTouchable}
                >
                  <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.imageCount}>{order.images.length} image(s)</Text>
          </View>
        )}

        {/* Uploaded Video */}
        {order.uploadType === 'video' && order.videoUri && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Uploaded Items Video</Text>
            <Text style={styles.uploadTypeLabel}>🎥 More than 10 items</Text>
            <View style={styles.videoPlayerContainer}>
              <Video
                source={{ uri: order.videoUri }}
                style={styles.videoPlayer}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping
              />
            </View>
            <Text style={styles.videoLabel}>Tap to play video</Text>
          </View>
        )}

        {/* Optional: Pickup/Delivery Agent */}
        {order.rider && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pickup/Delivery Agent</Text>
            <Text style={styles.itemText}>Name: {order.rider.name}</Text>
            <Text style={styles.itemText}>Phone: {order.rider.phone}</Text>
            <Text style={styles.itemText}>Vehicle: {order.rider.vehicleType} - {order.rider.vehicleNumber}</Text>
          </View>
        )}

      </ScrollView>

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
    </SafeAreaView>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  section: { backgroundColor: '#fff', margin: 16, padding: 16, borderRadius: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemImage: { width: 80, height: 80, borderRadius: 8 },
  itemDetails: { flex: 1 },
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  itemText: { fontSize: 16, color: '#000' },
  itemPrice: { fontSize: 16, fontWeight: '600', color: '#000' },
  totalText: { textAlign: 'right', fontWeight: '700', marginTop: 8 },
  deliveryField: { backgroundColor: '#f2f2f2', borderRadius: 8, padding: 12, marginBottom: 10 },
  deliveryText: { fontSize: 16, color: '#000' },

  // Tracking UI
  trackingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
    position: 'relative',
  },
  trackingWrapper: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepIndicator: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  stepIndicatorCompleted: {
    backgroundColor: '#4CAF50',
  },
  connector: {
    position: 'absolute',
    top: 13,
    left: '50%',
    width: '100%',
    height: 3,
    backgroundColor: '#ccc',
    zIndex: 1,
  },
  connectorCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepLabel: {
    marginTop: 6,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  stepLabelCompleted: {
    color: '#4CAF50',
    fontWeight: '700',
  },

  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 8 },
  imageTouchable: { borderRadius: 8, overflow: 'hidden' },
  uploadedImage: { width: 80, height: 80, borderRadius: 8 },
  imageCount: { 
    fontSize: 12, 
    color: '#666', 
    marginTop: 8, 
    textAlign: 'center',
  },
  uploadTypeLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
    textAlign: 'center',
  },
  videoPlayerContainer: {
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  videoPlayer: {
    width: '100%',
    height: 250,
  },
  videoLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  pickupAddressDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  pickupAddressText: { flex: 1, fontSize: 14, color: '#333', lineHeight: 20 },
  mobileDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  mobileText: { fontSize: 16, color: '#333', fontWeight: '500' },
  
  // Image Viewer Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  fullScreenImage: {
    width: Dimensions.get('window').width - 40,
    height: Dimensions.get('window').height - 100,
  },
});
