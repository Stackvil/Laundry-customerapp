import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Package, RefreshCw } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatedView, AnimatedButton, StaggeredListItem, PageTransition } from '@/components/Animated';

// ✅ Status color mapping
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending':
      return '#ff9500'; // Orange
    case 'Picked Up':
      return '#5ac8fa'; // Light Blue
    case 'In Progress':
      return '#007aff'; // Blue
    case 'Out for Delivery':
      return '#34c759'; // Green
    case 'Delivered':
      return '#8e8e93'; // Gray
    case 'Cancelled':
      return '#ff3b30'; // Red
    default:
      return '#8e8e93';
  }
};

export default function OrdersScreen() {
  const router = useRouter();
  const { user } = useAuth(); // ✅ Logged-in user info
  const [orders, setOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders...');
      const stored = await AsyncStorage.getItem('orders');
      console.log('Raw stored data:', stored);
      
      if (stored && stored !== 'null' && stored !== 'undefined') {
        // Validate that it's valid JSON before parsing
        if (stored.trim().startsWith('[') || stored.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(stored);
            console.log('Parsed orders count:', parsed?.length || 0);
            console.log('Parsed orders:', parsed);
            
            if (Array.isArray(parsed) && parsed.length > 0) {
              const sortedOrders = parsed.sort((a, b) => {
                const dateA = new Date(a.date || a.createdAt || 0).getTime();
                const dateB = new Date(b.date || b.createdAt || 0).getTime();
                return dateB - dateA;
              });
              setOrders(sortedOrders);
              console.log('Orders set successfully:', sortedOrders.length);
            } else {
              setOrders([]);
              console.log('No valid orders found');
            }
          } catch (parseError) {
            console.error('Invalid JSON in orders:', parseError);
            // Clear invalid data
            await AsyncStorage.removeItem('orders');
            setOrders([]);
          }
        } else {
          // If it's not JSON, clear it
          console.warn('orders is not valid JSON, clearing...');
          await AsyncStorage.removeItem('orders');
          setOrders([]);
        }
      } else {
        setOrders([]);
        console.log('No stored orders found');
      }
    } catch (err) {
      console.log('Error fetching orders:', err);
      setOrders([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchOrders(); // Fetch only on mount
  }, []);

  return (
    <PageTransition>
      <SafeAreaView style={styles.container}>
        {/* ✅ Header */}
        <AnimatedView animation="fadeInDown">
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Orders</Text>
          <AnimatedButton onPress={onRefresh} style={styles.refreshButton}>
            <RefreshCw size={20} color="#000" />
          </AnimatedButton>
        </View>
      </AnimatedView>

      {/* ✅ Orders List */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No orders yet</Text>
            <Text style={styles.emptyStateSubtext}>Start by placing your first order</Text>
          </View>
        ) : (
          orders.map((order, idx) => (
            <StaggeredListItem key={order.id || idx} index={idx} staggerDelay={60}>
              <AnimatedButton
                style={styles.orderCard}
                scaleValue={0.98}
                onPress={() =>
                  router.push({ pathname: '/(tabs)/orders/[id]', params: { id: order.id } })
                }
              >
              {/* ✅ Header with User Name & Status */}
              <View style={styles.orderHeader}>
                <Text style={styles.orderShop}>
                  {user?.name || order.user || ''}
                </Text>
                <View
                  style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}
                >
                  <Text style={styles.statusText}>{order.status}</Text>
                </View>
              </View>

              {/* ✅ Ordered Items */}
              <View style={styles.orderItems}>
                {(order.cartItems ?? []).map((item: any, index: number) => (
                  <Text key={index} style={styles.orderItemText}>
                    {item.quantity}x {item.serviceName} - ₹
                    {(item.price * item.quantity).toFixed(2)}
                  </Text>
                ))}
              </View>

              {/* ✅ Footer with Date & Total */}
              <View style={styles.orderFooter}>
                <Text style={styles.orderDate}>
                  {order.date ? new Date(order.date).toLocaleDateString() : ''}
                </Text>
                <Text style={styles.orderTotal}>₹{Number(order.totalAmount || 0).toFixed(2)}</Text>
              </View>
              </AnimatedButton>
            </StaggeredListItem>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
    </PageTransition>
  );
}

// ✅ Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#000' },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },

  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 120,
  },
  emptyStateText: { fontSize: 20, fontWeight: '600', color: '#000', marginTop: 16 },
  emptyStateSubtext: { fontSize: 14, color: '#666', marginTop: 8 },

  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderShop: { fontSize: 18, fontWeight: '700', color: '#000' },

  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600', color: '#fff' },

  orderItems: { marginBottom: 12 },
  orderItemText: { fontSize: 14, color: '#666', marginBottom: 4 },

  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  orderDate: { fontSize: 14, color: '#999' },
  orderTotal: { fontSize: 16, fontWeight: '700', color: '#000' },
});
