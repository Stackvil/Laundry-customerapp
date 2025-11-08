// ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Modal, TextInput, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, MapPin, User, LogOut, Plus, X } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnimatedView, AnimatedButton, StaggeredListItem, PageTransition } from '@/components/Animated';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    loadAddresses();
    loadProfileData();
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      loadProfileData();
    }, [])
  );

  const loadProfileData = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        // Validate that it's valid JSON before parsing
        if (savedProfile.trim().startsWith('{') || savedProfile.trim().startsWith('[')) {
          try {
            const profile = JSON.parse(savedProfile);
            setProfileData(profile);
          } catch (parseError) {
            console.error('Invalid JSON in userProfile:', parseError);
            // Clear invalid data
            await AsyncStorage.removeItem('userProfile');
          }
        } else {
          // If it's not JSON, clear it
          console.warn('userProfile is not valid JSON, clearing...');
          await AsyncStorage.removeItem('userProfile');
        }
      }
      
      const savedImage = await AsyncStorage.getItem('profileImage');
      if (savedImage) {
        // profileImage is stored as plain string, not JSON
        setProfileImage(savedImage);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const loadAddresses = async () => {
    try {
      const savedAddresses = await AsyncStorage.getItem('userAddresses');
      if (savedAddresses) {
        // Validate that it's valid JSON before parsing
        if (savedAddresses.trim().startsWith('[') || savedAddresses.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(savedAddresses);
            if (Array.isArray(parsed)) {
              setAddresses(parsed);
            } else {
              console.warn('userAddresses is not an array, clearing...');
              await AsyncStorage.removeItem('userAddresses');
            }
          } catch (parseError) {
            console.error('Invalid JSON in userAddresses:', parseError);
            // Clear invalid data
            await AsyncStorage.removeItem('userAddresses');
          }
        } else {
          // If it's not JSON, clear it
          console.warn('userAddresses is not valid JSON, clearing...');
          await AsyncStorage.removeItem('userAddresses');
        }
      } else if (user?.address) {
        // Add signup address as default if no saved addresses
        const signupAddress = {
          id: 'signup-address',
          label: 'Home',
          street: user.address,
          city: '',
          state: '',
          pincode: '',
          isDefault: true,
        };
        setAddresses([signupAddress]);
        await AsyncStorage.setItem('userAddresses', JSON.stringify([signupAddress]));
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.label || !newAddress.street || !newAddress.city) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const addressId = Date.now().toString();
      const addressToAdd = {
        id: addressId,
        label: newAddress.label,
        street: newAddress.street,
        city: newAddress.city,
        state: newAddress.state,
        pincode: newAddress.pincode,
        isDefault: addresses.length === 0, // First address is default
      };

      const updatedAddresses = [...addresses, addressToAdd];
      setAddresses(updatedAddresses);
      await AsyncStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));
      
      setShowAddAddressModal(false);
      setNewAddress({ label: '', street: '', city: '', state: '', pincode: '' });
      Alert.alert('Success', 'Address added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add address');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }));
      setAddresses(updatedAddresses);
      await AsyncStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));
    } catch (error) {
      Alert.alert('Error', 'Failed to update default address');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
              setAddresses(updatedAddresses);
              await AsyncStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete address');
            }
          }
        }
      ]
    );
  };


  // Not logged in view
  if (!user) {
    return (
      <PageTransition>
        <SafeAreaView style={styles.container} edges={['top']}>
          <AnimatedView animation="fadeInDown">
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Profile</Text>
            </View>
          </AnimatedView>
          <View style={styles.notLoggedIn}>
            <User size={64} color="#ccc" />
            <Text style={styles.notLoggedInText}>Not logged in</Text>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() =>
                router.push({ pathname: '/login', params: { type: 'login' } })
              }
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: '#0c0c0cff', marginTop: 12 }]}
              onPress={() =>
                router.push({ pathname: '/signup', params: { type: 'signup' } })
              }
            >
              <Text style={styles.loginButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </PageTransition>
    );
  }

  // Logged in view
  return (
    <PageTransition>
      <SafeAreaView style={styles.container} edges={['top']}>
        <AnimatedView animation="fadeInDown">
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>
        </AnimatedView>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* User Info */}
        <AnimatedView animation="fadeInUp" delay={100}>
          <View style={styles.userSection}>
            <View style={styles.userAvatar}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
              <User size={32} color="#fff" />
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{profileData.name || user?.name || 'Guest User'}</Text>
              <Text style={styles.userEmail}>{profileData.email || user?.email}</Text>
              {profileData.mobile && (
                <Text style={styles.userMobile}>{profileData.mobile}</Text>
              )}
            </View>
          </View>
        </AnimatedView>

        {/* Saved Addresses */}
        <AnimatedView animation="fadeInUp" delay={200}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color="#000" style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>Saved Addresses</Text>
            </View>
            {addresses.map((address, index) => (
              <StaggeredListItem key={address.id} index={index} staggerDelay={50}>
                <View style={styles.addressItem}>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>{address.label}</Text>
                <Text style={styles.listItemSubtitle}>
                  {address.street}
                  {address.city && `, ${address.city}`}
                  {address.state && `, ${address.state}`}
                  {address.pincode && ` - ${address.pincode}`}
                </Text>
                {address.isDefault && <Text style={styles.defaultBadge}>Default</Text>}
              </View>
              <View style={styles.addressActions}>
                {!address.isDefault && (
                  <AnimatedButton 
                    style={styles.actionButton}
                    onPress={() => handleSetDefault(address.id)}
                  >
                    <Text style={styles.actionButtonText}>Set Default</Text>
                  </AnimatedButton>
                )}
                <AnimatedButton 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteAddress(address.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </AnimatedButton>
              </View>
            </View>
              </StaggeredListItem>
            ))}
            <AnimatedButton 
              style={styles.addButton}
              onPress={() => setShowAddAddressModal(true)}
            >
              <Plus size={16} color="#007aff" style={{ marginRight: 8 }} />
              <Text style={styles.addButtonText}>Add New Address</Text>
            </AnimatedButton>
          </View>
        </AnimatedView>

        {/* Other Options */}
        <AnimatedView animation="fadeInUp" delay={300}>
          <View style={styles.section}>
            <AnimatedButton 
              style={styles.listItem}
              onPress={() => router.push('/account-settings')}
            >
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>Account Settings</Text>
              </View>
              <ChevronRight size={20} color="#999" />
            </AnimatedButton>

            {/* <AnimatedButton style={styles.listItem}>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>Help & Support</Text>
              </View>
              <ChevronRight size={20} color="#999" />
            </AnimatedButton> */}

            <AnimatedButton style={styles.logoutButton} onPress={handleSignOut}>
              <LogOut size={20} color="#ff3b30" style={{ marginRight: 8 }} />
              <Text style={styles.logoutText}>Logout</Text>
            </AnimatedButton>
          </View>
        </AnimatedView>
      </ScrollView>

      {/* Add Address Modal */}
      <Modal
        visible={showAddAddressModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddAddressModal(false)}>
              <X size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add New Address</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.modalInput}
              placeholder="Label (e.g., Home, Work)"
              value={newAddress.label}
              onChangeText={(text) => setNewAddress({ ...newAddress, label: text })}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Street Address"
              value={newAddress.street}
              onChangeText={(text) => setNewAddress({ ...newAddress, street: text })}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="City"
              value={newAddress.city}
              onChangeText={(text) => setNewAddress({ ...newAddress, city: text })}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="State"
              value={newAddress.state}
              onChangeText={(text) => setNewAddress({ ...newAddress, state: text })}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Pincode"
              value={newAddress.pincode}
              onChangeText={(text) => setNewAddress({ ...newAddress, pincode: text })}
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleAddAddress}>
              <Text style={styles.saveButtonText}>Save Address</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e5e5e5' },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#000' },
  scrollContent: { flexGrow: 1, paddingBottom: 120 },
  notLoggedIn: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 100 },
  notLoggedInText: { fontSize: 20, fontWeight: '600', color: '#000', marginTop: 16, marginBottom: 24 },
  loginButton: { backgroundColor: '#000', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 8, minWidth: 200 },
  loginButtonText: { fontSize: 16, fontWeight: '700', color: '#fff', textAlign: 'center' },
  userSection: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 20, marginTop: 20, padding: 20, borderRadius: 12 },
  userAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  profileImage: { width: 64, height: 64, borderRadius: 32 },
  userInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: '700', color: '#000', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#666', marginBottom: 2 },
  userMobile: { fontSize: 14, color: '#666' },
  section: { backgroundColor: '#fff', marginHorizontal: 20, marginTop: 20, borderRadius: 12, padding: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  listItemContent: { flex: 1 },
  listItemTitle: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 4 },
  listItemSubtitle: { fontSize: 14, color: '#666' },
  defaultBadge: { fontSize: 12, color: '#34c759', fontWeight: '600', marginTop: 4 },
  addButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 12
  },
  addButtonText: { fontSize: 14, fontWeight: '600', color: '#007aff' },
  addressItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  addressActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: '#007aff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, marginTop: 8 },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#ff3b30' },
  
  // Modal styles
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  modalContent: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  modalInput: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  saveButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
