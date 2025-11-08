import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { CircleCheck as CheckCircle, Phone, User, MapPin, X, Video as VideoIcon, CreditCard, Smartphone } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import { Video, ResizeMode } from 'expo-av';
import { PageTransition } from '@/components/Animated';
import { WebView } from 'react-native-webview';
import { RAZORPAY_CONFIG } from '@/config/razorpay';
import * as Linking from 'expo-linking';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [showUPIPaymentModal, setShowUPIPaymentModal] = useState(false);
  const [paymentHtml, setPaymentHtml] = useState<string>('');
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const stored = await AsyncStorage.getItem('orders');
        if (!stored) return;
        
        // Validate that it's valid JSON before parsing
        if (stored.trim().startsWith('[') || stored.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              const found = parsed.find((o: any) => o.id === id);
              if (found) {
                setOrder(found);
              }
            }
          } catch (parseError) {
            console.error('Invalid JSON in orders:', parseError);
            await AsyncStorage.removeItem('orders');
          }
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      }
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

  const handlePaymentMethodSelection = () => {
    if (!order) {
      Alert.alert('Error', 'Order not found');
      return;
    }

    const amount = Number(order.totalAmount || 0);
    if (amount <= 0) {
      Alert.alert('Error', 'Invalid order amount');
      return;
    }

    // Validate mobile number
    const mobile = order.mobile || user?.mobile || '';
    if (!mobile || mobile.length < 10) {
      Alert.alert('Error', 'Please provide a valid mobile number');
      return;
    }

    setShowPaymentMethodModal(true);
  };

  const handleUPIPayment = async () => {
    if (!order) {
      Alert.alert('Error', 'Order not found');
      return;
    }

    const amount = Number(order.totalAmount || 0);
    if (amount <= 0) {
      Alert.alert('Error', 'Invalid order amount');
      return;
    }

    setShowPaymentMethodModal(false);
    setShowUPIPaymentModal(true);
  };

  const openPhonePeApp = async () => {
    if (!order) return;

    const amount = Number(order.totalAmount || 0);
    
    // Merchant UPI ID
    const merchantUPI = 'manuchandrasai1@ybl';
    const merchantName = 'LaundryPoint';
    const transactionNote = `Order ${order.id}`;
    
    // PhonePe expects amount in rupees format (not paise)
    // Example: ₹180.00 becomes "180.00" or "180"
    const amountForPhonePe = amount.toFixed(2);
    
    // Standard UPI format uses amount in paise (smallest currency unit)
    // Example: ₹180.00 becomes 18000 (paise)
    const amountInPaise = Math.round(amount * 100);
    
    // PhonePe specific deep link format - uses rupees
    const phonePePaymentUrl = `phonepe://pay?pa=${merchantUPI}&pn=${encodeURIComponent(merchantName)}&am=${amountForPhonePe}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
    
    // Standard UPI payment link format (for other UPI apps) - uses paise
    // Format: upi://pay?pa=<payee_address>&pn=<payee_name>&am=<amount>&cu=<currency>&tn=<transaction_note>
    const upiPaymentUrl = `upi://pay?pa=${merchantUPI}&pn=${encodeURIComponent(merchantName)}&am=${amountInPaise}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
    
    try {
      // Check if PhonePe is installed
      const phonePeInstalled = await Linking.canOpenURL('phonepe://');
      
      if (phonePeInstalled) {
        try {
          // Try PhonePe specific deep link first
          const canOpenPhonePe = await Linking.canOpenURL(phonePePaymentUrl);
          if (canOpenPhonePe) {
            await Linking.openURL(phonePePaymentUrl);
            setShowUPIPaymentModal(false);
            
            setTimeout(() => {
              Alert.alert(
                'Opening PhonePe',
                `Payment Amount: ₹${amount.toFixed(2)}\n\nPayment details are pre-filled. Please confirm the payment in PhonePe app.`,
                [{ text: 'OK' }]
              );
            }, 500);
          } else {
            // Fallback to standard UPI format
            throw new Error('PhonePe deep link not supported');
          }
        } catch (phonePeError) {
          console.log('PhonePe specific link failed, trying standard UPI format:', phonePeError);
          
          try {
            // Try standard UPI payment link format
            const canOpenUPI = await Linking.canOpenURL(upiPaymentUrl);
            if (canOpenUPI) {
              await Linking.openURL(upiPaymentUrl);
              setShowUPIPaymentModal(false);
              
              setTimeout(() => {
                Alert.alert(
                  'Opening PhonePe',
                  `Payment Amount: ₹${amount.toFixed(2)}\n\nPayment details are pre-filled. Please confirm the payment in PhonePe app.`,
                  [{ text: 'OK' }]
                );
              }, 500);
            } else {
              // If UPI link doesn't work, just open PhonePe app
              await Linking.openURL('phonepe://');
              setShowUPIPaymentModal(false);
              
              Alert.alert(
                'Payment Details',
                `UPI ID: ${merchantUPI}\nAmount: ₹${amount.toFixed(2)}\n\nPlease enter these details manually in PhonePe app.`,
                [{ text: 'OK' }]
              );
            }
          } catch (upiError) {
            console.error('UPI payment link failed:', upiError);
            // Fallback: just open PhonePe app
            await Linking.openURL('phonepe://');
            setShowUPIPaymentModal(false);
            
            Alert.alert(
              'Payment Details',
              `UPI ID: ${merchantUPI}\nAmount: ₹${amount.toFixed(2)}\n\nPlease enter these details manually in PhonePe app.`,
              [{ text: 'OK' }]
            );
          }
        }
      } else {
        // PhonePe not installed, try generic UPI
        const canOpenUPI = await Linking.canOpenURL('upi://');
        if (canOpenUPI) {
          try {
            await Linking.openURL(upiPaymentUrl);
            setShowUPIPaymentModal(false);
            
            setTimeout(() => {
              Alert.alert(
                'Opening UPI App',
                `Payment Amount: ₹${amount.toFixed(2)}\n\nPayment details are pre-filled. Please confirm the payment in your UPI app.`,
                [{ text: 'OK' }]
              );
            }, 500);
          } catch (upiError) {
            Alert.alert(
              'UPI Payment',
              `Amount: ₹${amount.toFixed(2)}\nUPI ID: ${merchantUPI}\n\nPlease install PhonePe or use Razorpay payment.`,
              [
                { 
                  text: 'Install PhonePe', 
                  onPress: () => {
                    Linking.openURL('https://play.google.com/store/apps/details?id=com.phonepe.app');
                    setShowUPIPaymentModal(false);
                  }
                },
                { 
                  text: 'Use Razorpay', 
                  onPress: () => {
                    setShowUPIPaymentModal(false);
                    handleRazorpayPayment();
                  }
                },
                { text: 'Cancel', style: 'cancel' }
              ]
            );
          }
        } else {
          // No UPI app installed
          Alert.alert(
            'PhonePe Not Installed',
            `Amount: ₹${amount.toFixed(2)}\nUPI ID: ${merchantUPI}\n\nPlease install PhonePe app to use UPI payment.`,
            [
              { 
                text: 'Install PhonePe', 
                onPress: () => {
                  Linking.openURL('https://play.google.com/store/apps/details?id=com.phonepe.app');
                  setShowUPIPaymentModal(false);
                }
              },
              { 
                text: 'Use Razorpay', 
                onPress: () => {
                  setShowUPIPaymentModal(false);
                  handleRazorpayPayment();
                }
              },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Error opening PhonePe:', error);
      Alert.alert(
        'Error',
        `Amount: ₹${amount.toFixed(2)}\nUPI ID: ${merchantUPI}\n\nCould not open PhonePe app. Please try again or use Razorpay payment.`,
        [
          { 
            text: 'Use Razorpay', 
            onPress: () => {
              setShowUPIPaymentModal(false);
              handleRazorpayPayment();
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const handleRazorpayPayment = () => {
    if (!order) {
      Alert.alert('Error', 'Order not found');
      return;
    }

    if (isProcessingPayment) {
      return; // Prevent multiple clicks
    }

    const amount = Number(order.totalAmount || 0);
    if (amount <= 0) {
      Alert.alert('Error', 'Invalid order amount');
      return;
    }

    // Validate mobile number
    const mobile = order.mobile || user?.mobile || '';
    if (!mobile || mobile.length < 10) {
      Alert.alert('Error', 'Please provide a valid mobile number');
      return;
    }

    setShowPaymentMethodModal(false);
    setIsProcessingPayment(true);

    // Convert amount to paise (Razorpay uses paise as the smallest currency unit)
    const amountInPaise = Math.round(amount * 100);
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);

    // Create Razorpay checkout HTML
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #f5f5f5;
          }
          .container {
            text-align: center;
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 400px;
            width: 100%;
          }
          .amount {
            font-size: 32px;
            font-weight: bold;
            color: #3b82f6;
            margin: 20px 0;
          }
          .description {
            color: #666;
            margin-bottom: 30px;
          }
          button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 15px 40px;
            font-size: 18px;
            border-radius: 8px;
            cursor: pointer;
            width: 100%;
            font-weight: 600;
          }
          button:hover {
            background: #2563eb;
          }
          .loading {
            display: none;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Complete Payment</h2>
          <div class="amount">₹${amount.toFixed(2)}</div>
          <div class="description">Order ID: ${order.id}</div>
          <button id="pay-button" onclick="openRazorpay()">Pay Now</button>
          <div class="loading" id="loading">Processing...</div>
        </div>
        <script>
          function openRazorpay() {
            document.getElementById('pay-button').style.display = 'none';
            document.getElementById('loading').style.display = 'block';
            
            const options = {
              key: '${RAZORPAY_CONFIG.KEY_ID}',
              amount: ${amountInPaise},
              currency: '${RAZORPAY_CONFIG.CURRENCY}',
              name: '${RAZORPAY_CONFIG.NAME}',
              description: 'Order Payment - ${order.id}',
              prefill: {
                name: '${(order.customerName || (user && user.name) || 'Customer Name').replace(/'/g, "\\'")}',
                email: '${((user && user.email) || 'customer@example.com').replace(/'/g, "\\'")}',
                contact: '${cleanMobile}'
              },
              theme: {
                color: '${RAZORPAY_CONFIG.THEME_COLOR}'
              },
              notes: {
                order_id: '${order.id}',
                order_date: '${order.date || new Date().toISOString()}'
              },
              handler: function(response) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'success',
                  data: response
                }));
              },
              modal: {
                ondismiss: function() {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'dismiss'
                  }));
                }
              }
            };
            
            const rzp = new Razorpay(options);
            rzp.on('payment.failed', function(response) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'failed',
                data: response.error
              }));
            });
            rzp.open();
          }
          
          // Auto-open on load
          window.onload = function() {
            setTimeout(openRazorpay, 500);
          };
        </script>
      </body>
      </html>
    `;

    setPaymentHtml(html);
    setShowPaymentModal(true);
    setIsProcessingPayment(false);
  };

  const handlePaymentMessage = async (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      if (message.type === 'success') {
        setShowPaymentModal(false);
        setIsProcessingPayment(false);
        
        // Update order with payment information
        try {
          const stored = await AsyncStorage.getItem('orders');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              const orderIndex = parsed.findIndex((o: any) => o.id === id);
              if (orderIndex !== -1) {
                parsed[orderIndex] = {
                  ...parsed[orderIndex],
                  paymentId: message.data.razorpay_payment_id,
                  paymentStatus: 'paid',
                  paidAt: new Date().toISOString(),
                  status: 'Picked Up'
                };
                await AsyncStorage.setItem('orders', JSON.stringify(parsed));
                setOrder(parsed[orderIndex]);
              }
            }
          }
        } catch (error) {
          console.error('Error updating order after payment:', error);
        }
        
        Alert.alert(
          'Payment Successful',
          `Payment ID: ${message.data.razorpay_payment_id}\nYour order will be processed soon.`,
          [{ text: 'OK' }]
        );
      } else if (message.type === 'failed') {
        setShowPaymentModal(false);
        setIsProcessingPayment(false);
        Alert.alert(
          'Payment Failed',
          message.data.description || 'Payment could not be processed. Please try again.',
          [{ text: 'OK' }]
        );
      } else if (message.type === 'dismiss') {
        setShowPaymentModal(false);
        setIsProcessingPayment(false);
      }
    } catch (error) {
      console.error('Error handling payment message:', error);
    }
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

        {/* Pay Button Section */}
        {order.status === 'Pending' && (
          <View style={styles.section}>
            <TouchableOpacity 
              style={[styles.payButton, isProcessingPayment && styles.payButtonDisabled]}
              onPress={handlePaymentMethodSelection}
              activeOpacity={0.8}
              disabled={isProcessingPayment}
            >
              <CreditCard size={20} color="#fff" />
              <Text style={styles.payButtonText}>
                {isProcessingPayment ? 'Processing...' : `Pay ₹${Number(order.totalAmount).toFixed(2)}`}
              </Text>
            </TouchableOpacity>
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

      {/* Payment Method Selection Modal */}
      <Modal
        visible={showPaymentMethodModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPaymentMethodModal(false)}
      >
        <View style={styles.paymentMethodModalOverlay}>
          <View style={styles.paymentMethodModalContent}>
            <View style={styles.paymentMethodModalHeader}>
              <Text style={styles.paymentMethodModalTitle}>Select Payment Method</Text>
              <TouchableOpacity 
                onPress={() => setShowPaymentMethodModal(false)}
                style={styles.paymentMethodModalCloseButton}
              >
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.paymentAmountText}>Amount: ₹{Number(order?.totalAmount || 0).toFixed(2)}</Text>
            
            <View style={styles.paymentMethodOptions}>
              {/* UPI/PhonePe Option */}
              <TouchableOpacity 
                style={styles.paymentMethodOption}
                onPress={handleUPIPayment}
                activeOpacity={0.7}
              >
                <View style={styles.paymentMethodIconContainer}>
                  <Smartphone size={32} color="#5F259F" />
                </View>
                <View style={styles.paymentMethodDetails}>
                  <Text style={styles.paymentMethodName}>UPI Payment</Text>
                  <Text style={styles.paymentMethodDescription}>Pay via PhonePe</Text>
                </View>
                <View style={styles.paymentMethodArrow}>
                  <Text style={styles.arrowText}>›</Text>
                </View>
              </TouchableOpacity>

              {/* Razorpay Option */}
              <TouchableOpacity 
                style={styles.paymentMethodOption}
                onPress={handleRazorpayPayment}
                activeOpacity={0.7}
              >
                <View style={styles.paymentMethodIconContainer}>
                  <CreditCard size={32} color="#3b82f6" />
                </View>
                <View style={styles.paymentMethodDetails}>
                  <Text style={styles.paymentMethodName}>Card/Net Banking</Text>
                  <Text style={styles.paymentMethodDescription}>Pay via Razorpay</Text>
                </View>
                <View style={styles.paymentMethodArrow}>
                  <Text style={styles.arrowText}>›</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* UPI Payment Details Modal */}
      <Modal
        visible={showUPIPaymentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowUPIPaymentModal(false)}
      >
        <SafeAreaView style={styles.paymentMethodModalOverlay} edges={['bottom']}>
          <View style={styles.paymentMethodModalContent}>
            <View style={styles.paymentMethodModalHeader}>
              <Text style={styles.paymentMethodModalTitle}>UPI Payment</Text>
              <TouchableOpacity 
                onPress={() => setShowUPIPaymentModal(false)}
                style={styles.paymentMethodModalCloseButton}
              >
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.upiPaymentScrollView}
              contentContainerStyle={styles.upiPaymentContentContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.upiPaymentContent}>
                <View style={styles.upiPaymentIconContainer}>
                  <Smartphone size={64} color="#5F259F" />
                </View>
                
                <Text style={styles.upiPaymentTitle}>Payment Amount</Text>
                <Text style={styles.upiPaymentAmount}>₹{Number(order?.totalAmount || 0).toFixed(2)}</Text>
                
                <View style={styles.upiPaymentDetails}>
                  <View style={styles.upiPaymentDetailRow}>
                    <Text style={styles.upiPaymentDetailLabel}>Order ID:</Text>
                    <Text style={styles.upiPaymentDetailValue}>{order?.id}</Text>
                  </View>
                  <View style={styles.upiPaymentDetailRow}>
                    <Text style={styles.upiPaymentDetailLabel}>UPI ID:</Text>
                    <Text style={styles.upiPaymentDetailValue}>manuchandrasai1@ybl</Text>
                  </View>
                  <View style={styles.upiPaymentDetailRow}>
                    <Text style={styles.upiPaymentDetailLabel}>Merchant:</Text>
                    <Text style={styles.upiPaymentDetailValue}>LaundryPoint</Text>
                  </View>
                </View>
                
              <Text style={styles.upiPaymentInstructions}>
                Click "Open PhonePe" to proceed. Payment details will be automatically filled in PhonePe app.
              </Text>
                
                <TouchableOpacity 
                  style={styles.openPhonePeButton}
                  onPress={openPhonePeApp}
                  activeOpacity={0.8}
                >
                  <Smartphone size={24} color="#fff" />
                  <Text style={styles.openPhonePeButtonText}>Open PhonePe</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.cancelUPIButton}
                  onPress={() => {
                    setShowUPIPaymentModal(false);
                    setShowPaymentMethodModal(true);
                  }}
                >
                  <Text style={styles.cancelUPIButtonText}>Choose Another Payment Method</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Payment Modal with WebView */}
      <Modal
        visible={showPaymentModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => {
          setShowPaymentModal(false);
          setIsProcessingPayment(false);
        }}
      >
        <SafeAreaView style={styles.paymentModalContainer}>
          <View style={styles.paymentModalHeader}>
            <Text style={styles.paymentModalTitle}>Payment</Text>
            <TouchableOpacity 
              onPress={() => {
                setShowPaymentModal(false);
                setIsProcessingPayment(false);
              }}
              style={styles.paymentModalCloseButton}
            >
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>
          {paymentHtml ? (
            <WebView
              ref={webViewRef}
              source={{ html: paymentHtml }}
              onMessage={handlePaymentMessage}
              style={styles.webView}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.webViewLoading}>
                  <ActivityIndicator size="large" color="#3b82f6" />
                  <Text style={styles.webViewLoadingText}>Loading payment gateway...</Text>
                </View>
              )}
            />
          ) : (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          )}
        </SafeAreaView>
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
  payButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  payButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.7,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  paymentModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  paymentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  paymentModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  paymentModalCloseButton: {
    padding: 8,
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  webViewLoadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  // Payment Method Selection Modal Styles
  paymentMethodModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  paymentMethodModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '60%',
  },
  paymentMethodModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  paymentMethodModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  paymentMethodModalCloseButton: {
    padding: 4,
  },
  paymentAmountText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3b82f6',
    textAlign: 'center',
    paddingVertical: 20,
  },
  paymentMethodOptions: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  paymentMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  paymentMethodIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentMethodDetails: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  paymentMethodDescription: {
    fontSize: 14,
    color: '#666',
  },
  paymentMethodArrow: {
    marginLeft: 12,
  },
  arrowText: {
    fontSize: 24,
    color: '#999',
    fontWeight: '300',
  },
  // UPI Payment Modal Styles
  upiPaymentScrollView: {
    flex: 1,
  },
  upiPaymentContentContainer: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  upiPaymentContent: {
    padding: 20,
    alignItems: 'center',
  },
  upiPaymentIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  upiPaymentTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  upiPaymentAmount: {
    fontSize: 42,
    fontWeight: '700',
    color: '#5F259F',
    marginBottom: 24,
  },
  upiPaymentDetails: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  upiPaymentDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  upiPaymentDetailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  upiPaymentDetailValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  upiPaymentInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  openPhonePeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5F259F',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    gap: 8,
    marginBottom: 12,
  },
  openPhonePeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  cancelUPIButton: {
    paddingVertical: 12,
  },
  cancelUPIButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
});
