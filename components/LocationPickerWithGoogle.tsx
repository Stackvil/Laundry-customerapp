import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MapPin, Navigation, Clock } from 'lucide-react-native';

type SelectedLocation = {
  id?: string;
  address: string;
  latitude: number;
  longitude: number;
};

type Props = {
  onSelectLocation: (loc: SelectedLocation) => void;
};

const RECENT_KEY = 'recentLocations';

export default function LocationPickerWithGoogle({ onSelectLocation }: Props) {
  const [currentLocation, setCurrentLocation] = useState<SelectedLocation | null>(null);
  const [recent, setRecent] = useState<SelectedLocation[]>([]);
  const [loadingCurrent, setLoadingCurrent] = useState(false);

  useEffect(() => {
    loadRecent();
    getCurrentLocation();
  }, []);

  const loadRecent = async () => {
    try {
      const raw = await AsyncStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch (e) {
      console.error('Error loading recent:', e);
    }
  };

  const saveRecent = async (loc: SelectedLocation) => {
    try {
      const updated = [loc, ...recent.filter(r => r.address !== loc.address)].slice(0, 8);
      setRecent(updated);
      await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving recent:', e);
    }
  };

  const getCurrentLocation = async () => {
    setLoadingCurrent(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const reverse = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      const addr = reverse && reverse[0] 
        ? [reverse[0].name, reverse[0].street, reverse[0].city, reverse[0].region].filter(Boolean).join(', ')
        : `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      
      setCurrentLocation({ id: 'current', address: addr, latitude: lat, longitude: lng });
    } catch (e) {
      console.error('Error getting current location:', e);
    } finally {
      setLoadingCurrent(false);
    }
  };

  const handleSelectCurrent = () => {
    if (currentLocation) {
      saveRecent(currentLocation);
      onSelectLocation(currentLocation);
    }
  };

  const handleSelectRecent = (loc: SelectedLocation) => {
    onSelectLocation(loc);
  };

  return (
    <View style={styles.container}>
      {/* Google Places Autocomplete */}
      <GooglePlacesAutocomplete
        placeholder='Search for pickup location'
        minLength={2}
        listViewDisplayed='auto'
        fetchDetails={true}
        renderDescription={(row) => row.description}
        onPress={(data, details = null) => {
          console.log('📍 Selected place:', data);
          console.log('📍 Place details:', details);
          if (details) {
            const location: SelectedLocation = {
              id: details.place_id,
              address: details.formatted_address || data.description,
              latitude: details.geometry.location.lat,
              longitude: details.geometry.location.lng,
            };
            console.log('✅ Final location object:', location);
            saveRecent(location);
            onSelectLocation(location);
          }
        }}
        query={{
          key: 'AIzaSyDX9SxLUCpU37WiQmyP-_Lsy324r_96OGw',
          language: 'en',
          components: 'country:in',
          types: 'geocode',
        }}
        enablePoweredByContainer={false}
        keepResultsAfterBlur={true}
        debounce={400}
        styles={{
          container: {
            flex: 0,
            marginBottom: 16,
          },
          textInputContainer: {
            backgroundColor: '#f2f2f2',
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 0,
          },
          textInput: {
            height: 44,
            color: '#000',
            fontSize: 16,
            backgroundColor: '#f2f2f2',
          },
          listView: {
            backgroundColor: '#fff',
            borderRadius: 8,
            marginTop: 8,
          },
          row: {
            backgroundColor: '#fff',
            padding: 13,
            minHeight: 44,
            flexDirection: 'row',
          },
          separator: {
            height: 1,
            backgroundColor: '#f0f0f0',
          },
          description: {
            fontSize: 14,
            color: '#000',
          },
          loader: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            height: 20,
          },
          predefinedPlacesDescription: {
            color: '#1faadb',
          },
        }}
        textInputProps={{
          placeholderTextColor: '#999',
          returnKeyType: 'search',
        }}
      />

      {/* Current Location */}
      {currentLocation && (
        <TouchableOpacity style={styles.locationItem} onPress={handleSelectCurrent}>
          <View style={styles.iconContainer}>
            <Navigation size={20} color="#007AFF" />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationTitle}>Current location</Text>
            <Text style={styles.locationSubtitle}>{currentLocation.address}</Text>
          </View>
        </TouchableOpacity>
      )}

      {loadingCurrent && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>Getting current location...</Text>
        </View>
      )}

      {/* Recent Locations */}
      {recent.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent</Text>
          <FlatList
            data={recent}
            scrollEnabled={false}
            keyExtractor={(item, index) => item.address + index}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.locationItem} onPress={() => handleSelectRecent(item)}>
                <View style={styles.iconContainer}>
                  <Clock size={20} color="#666" />
                </View>
                <View style={styles.locationInfo}>
                  <Text style={styles.locationTitle}>{item.address}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  locationSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 16,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 14,
  },
});

