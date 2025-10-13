import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { googlePlacesService } from '@/services/googlePlaces';

type SelectedLocation = {
  id?: string;
  address: string;
  latitude: number;
  longitude: number;
};

type Props = {
  onSelectLocation: (loc: SelectedLocation) => void;
  placeholder?: string;
};

const RECENT_KEY = 'recentLocations';

export default function LocationSearchWithDefaults({ onSelectLocation, placeholder = 'Search here' }: Props) {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [nearby, setNearby] = useState<any[]>([]);
  const [recent, setRecent] = useState<SelectedLocation[]>([]);
  const [currentLocation, setCurrentLocation] = useState<SelectedLocation | null>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    loadRecent();
    getCurrentLocationAndNearby();
  }, []);

  useEffect(() => {
    if (!query) {
      setPredictions([]);
      setLoadingPredictions(false);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current as any);
        debounceRef.current = null;
      }
      return;
    }

    setLoadingPredictions(true);
    if (debounceRef.current) clearTimeout(debounceRef.current as any);
    debounceRef.current = setTimeout(async () => {
      try {
        console.log('🔎 Searching for:', query);
        const preds = await googlePlacesService.getPlacePredictions(query);
        console.log('✅ Got predictions:', preds.length);
        if (preds.length > 0) {
          console.log('📍 First result:', preds[0]);
        }
        setPredictions(preds);
      } catch (e: any) {
        console.error('❌ Autocomplete error:', e.message || e);
        setPredictions([]);
      } finally {
        setLoadingPredictions(false);
      }
    }, 400) as unknown as number;

    // cleanup handled by next call
  }, [query]);

  const loadRecent = async () => {
    try {
      const raw = await AsyncStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  };

  const saveRecent = async (loc: SelectedLocation) => {
    try {
      const updated = [loc, ...recent.filter(r => r.address !== loc.address)].slice(0, 8);
      setRecent(updated);
      await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  const getCurrentLocationAndNearby = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const reverse = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      const addr = reverse && reverse[0] ? [reverse[0].name, reverse[0].street, reverse[0].city].filter(Boolean).join(', ') : 'Current location';
      const cur = { id: 'current', address: addr, latitude: lat, longitude: lng };
      setCurrentLocation(cur);
      try {
        const nearbyResults = await googlePlacesService.getNearbyPlaces(lat, lng, 2000);
        setNearby(nearbyResults);
      } catch (e) {
        setNearby([]);
      }
    } catch (e) {
      // ignore
    }
  };

  const onPickCurrent = () => {
    if (!currentLocation) return;
    saveRecent(currentLocation);
    onSelectLocation(currentLocation);
  };

  const onPickNearby = (item: any) => {
    const loc: SelectedLocation = { id: item.placeId || item.id, address: item.address || item.name, latitude: item.latitude, longitude: item.longitude };
    saveRecent(loc);
    onSelectLocation(loc);
  };

  const onPickPrediction = async (p: any) => {
    try {
      const details = await googlePlacesService.getPlaceDetails(p.placeId);
      const loc: SelectedLocation = { id: details.placeId, address: details.address, latitude: details.latitude, longitude: details.longitude };
      saveRecent(loc);
      setQuery('');
      setPredictions([]);
      onSelectLocation(loc);
    } catch (e) {
      console.warn('Details error', e);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.row} onPress={() => onPickNearby(item)}>
      <Text style={styles.title}>{item.name || item.address}</Text>
      {item.address ? <Text style={styles.sub}>{item.address}</Text> : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          placeholder={placeholder}
          value={query}
          onChangeText={setQuery}
          style={styles.input}
        />
        {loadingPredictions && <ActivityIndicator style={{ marginLeft: 8 }} />}
      </View>

      {/* Current Location */}
      {currentLocation && (
        <TouchableOpacity style={styles.row} onPress={onPickCurrent}>
          <Text style={styles.title}>Current location</Text>
          <Text style={styles.sub}>{currentLocation.address}</Text>
        </TouchableOpacity>
      )}

      {/* Predictions while typing */}
      {predictions.length > 0 && (
        <FlatList data={predictions} keyExtractor={(i) => i.placeId} renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => onPickPrediction(item)}>
            <Text style={styles.title}>{item.mainText || item.description}</Text>
            {item.secondaryText ? <Text style={styles.sub}>{item.secondaryText}</Text> : null}
          </TouchableOpacity>
        )} />
      )}

      {/* Recent */}
      {recent.length > 0 && query.length === 0 && (
        <View>
          <Text style={styles.section}>Recent</Text>
          <FlatList data={recent} keyExtractor={(r) => r.address} renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => onPickNearby(item)}>
              <Text style={styles.title}>{item.address}</Text>
            </TouchableOpacity>
          )} />
        </View>
      )}

      {/* Nearby when not typing */}
      {query.length === 0 && nearby.length > 0 && (
        <View>
          <Text style={styles.section}>Nearby</Text>
          <FlatList data={nearby} keyExtractor={(n) => n.placeId || n.id} renderItem={renderItem} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', borderRadius: 8, padding: 8 },
  searchRow: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#f2f2f2' },
  row: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 14, fontWeight: '600' },
  sub: { fontSize: 12, color: '#666', marginTop: 4 },
  section: { fontSize: 13, fontWeight: '700', marginTop: 8, marginBottom: 4, paddingLeft: 8 },
});
