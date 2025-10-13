import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MapPin, Navigation, Clock, Search } from 'lucide-react-native';

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
const GOOGLE_API_KEY = 'AIzaSyDX9SxLUCpU37WiQmyP-_Lsy324r_96OGw';

export default function CustomLocationPicker({ onSelectLocation }: Props) {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<SelectedLocation | null>(null);
  const [recent, setRecent] = useState<SelectedLocation[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadRecent();
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setPredictions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        await fetchPredictions(query);
      } catch (error) {
        console.error('❌ Search error:', error);
        setPredictions([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const fetchPredictions = async (input: string) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input
      )}&key=${GOOGLE_API_KEY}&language=en&components=country:in`;

      console.log('🔍 Fetching predictions for:', input);
      
      const response = await fetch(url);
      const data = await response.json();

      console.log('✅ API Status:', data.status);

      if (data.status === 'OK') {
        console.log('📍 Found', data.predictions?.length || 0, 'predictions');
        setPredictions(data.predictions || []);
      } else if (data.status === 'ZERO_RESULTS') {
        console.log('⚠️ No results found');
        setPredictions([]);
      } else {
        console.error('❌ API Error:', data.status, data.error_message);
        setPredictions([]);
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
      setPredictions([]);
    }
  };

  const fetchPlaceDetails = async (placeId: string) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
        placeId
      )}&key=${GOOGLE_API_KEY}&fields=geometry,formatted_address,name`;

      console.log('📍 Fetching details for place:', placeId);
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.result) {
        return {
          address: data.result.formatted_address || data.result.name,
          latitude: data.result.geometry.location.lat,
          longitude: data.result.geometry.location.lng,
        };
      }
      return null;
    } catch (error) {
      console.error('❌ Details fetch error:', error);
      return null;
    }
  };

  const loadRecent = async () => {
    try {
      const raw = await AsyncStorage.getItem(RECENT_KEY);
      if (raw) {
        setRecent(JSON.parse(raw));
      }
    } catch (error) {
      console.error('Error loading recent:', error);
    }
  };

  const saveRecent = async (loc: SelectedLocation) => {
    try {
      const updated = [loc, ...recent.filter((r) => r.address !== loc.address)].slice(0, 8);
      setRecent(updated);
      await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('📍 Location permission denied');
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      const reverse = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });

      const addr =
        reverse && reverse[0]
          ? [reverse[0].name, reverse[0].street, reverse[0].city, reverse[0].region]
              .filter(Boolean)
              .join(', ')
          : `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

      setCurrentLocation({ id: 'current', address: addr, latitude: lat, longitude: lng });
      console.log('✅ Current location:', addr);
    } catch (error) {
      console.error('❌ Location error:', error);
    }
  };

  const handleSelectPrediction = async (prediction: any) => {
    console.log('📍 Selected:', prediction.description);
    setLoading(true);
    
    const details = await fetchPlaceDetails(prediction.place_id);
    
    if (details) {
      const location: SelectedLocation = {
        id: prediction.place_id,
        address: details.address,
        latitude: details.latitude,
        longitude: details.longitude,
      };
      console.log('✅ Final location:', location);
      await saveRecent(location);
      onSelectLocation(location);
    } else {
      // Fallback to prediction description
      const location: SelectedLocation = {
        id: prediction.place_id,
        address: prediction.description,
        latitude: 0,
        longitude: 0,
      };
      await saveRecent(location);
      onSelectLocation(location);
    }
    
    setLoading(false);
  };

  const handleSelectCurrent = () => {
    if (currentLocation) {
      console.log('✅ Selected current location');
      saveRecent(currentLocation);
      onSelectLocation(currentLocation);
    }
  };

  const handleSelectRecent = (loc: SelectedLocation) => {
    console.log('✅ Selected recent location:', loc.address);
    onSelectLocation(loc);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for pickup location"
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
          autoFocus={false}
          returnKeyType="search"
        />
        {loading && <ActivityIndicator size="small" color="#007AFF" />}
      </View>

      {/* Search Results */}
      {query.length >= 2 && predictions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SEARCH RESULTS</Text>
          {predictions.map((prediction) => (
            <TouchableOpacity
              key={prediction.place_id}
              style={styles.locationItem}
              onPress={() => handleSelectPrediction(prediction)}
            >
              <View style={styles.iconContainer}>
                <MapPin size={18} color="#007AFF" />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationTitle}>
                  {prediction.structured_formatting?.main_text || prediction.description}
                </Text>
                {prediction.structured_formatting?.secondary_text && (
                  <Text style={styles.locationSubtitle}>
                    {prediction.structured_formatting.secondary_text}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* No Results */}
      {query.length >= 2 && predictions.length === 0 && !loading && (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>No locations found</Text>
        </View>
      )}

      {/* Current Location */}
      {query.length === 0 && currentLocation && (
        <TouchableOpacity style={styles.locationItem} onPress={handleSelectCurrent}>
          <View style={[styles.iconContainer, styles.currentIconContainer]}>
            <Navigation size={18} color="#fff" />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationTitle}>Current location</Text>
            <Text style={styles.locationSubtitle}>{currentLocation.address}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Recent Locations */}
      {query.length === 0 && recent.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECENT</Text>
          {recent.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.locationItem}
              onPress={() => handleSelectRecent(item)}
            >
              <View style={styles.iconContainer}>
                <Clock size={18} color="#666" />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationTitle} numberOfLines={2}>
                  {item.address}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    padding: 0,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 4,
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
  currentIconContainer: {
    backgroundColor: '#007AFF',
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
  noResults: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: '#999',
  },
});

