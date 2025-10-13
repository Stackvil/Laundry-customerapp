import Constants from 'expo-constants';

const getApiKey = (): string | null => {
  // First try environment variable
  const envKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (envKey) return envKey;
  
  // Try to read from app config extras
  try {
    // @ts-ignore
    const extras = Constants.expoConfig?.extra ?? Constants.manifest?.extra;
    if (extras && extras.expoPublicGooglePlacesApiKey) return extras.expoPublicGooglePlacesApiKey;
  } catch (e) {
    // ignore
  }
  
  // Fallback to hardcoded key from config (for development only)
  return 'AIzaSyDX9SxLUCpU37WiQmyP-_Lsy324r_96OGw';
};

const API_BASE = 'https://maps.googleapis.com/maps/api/place';

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed ${res.status}`);
  return res.json();
}

export const googlePlacesService = {
  async getPlacePredictions(input: string) {
    const key = getApiKey();
    if (!key) throw new Error('Google Places API key not configured');
    const url = `${API_BASE}/autocomplete/json?input=${encodeURIComponent(input)}&key=${key}&language=en&components=country:in`;
    console.log('🔍 Fetching predictions for:', input);
    console.log('🔗 API URL:', url.replace(key, 'API_KEY_HIDDEN'));
    
    const data = await fetchJson(url);
    console.log('✅ API Response status:', data.status);
    console.log('📍 Predictions count:', data.predictions?.length || 0);
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('❌ Google Places API Error:', data.status, data.error_message);
      throw new Error(`Google Places API Error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }
    
    return (data.predictions || []).map((p: any) => ({
      placeId: p.place_id,
      description: p.description,
      mainText: p.structured_formatting?.main_text,
      secondaryText: p.structured_formatting?.secondary_text,
    }));
  },

  async getPlaceDetails(placeId: string) {
    const key = getApiKey();
    if (!key) throw new Error('Google Places API key not configured');
    const url = `${API_BASE}/details/json?place_id=${encodeURIComponent(placeId)}&key=${key}&fields=geometry,formatted_address,name,place_id`;
    const data = await fetchJson(url);
    const result = data.result;
    return {
      placeId: result.place_id,
      address: result.formatted_address || result.name,
      name: result.name,
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
    };
  },

  async getNearbyPlaces(lat: number, lng: number, radius = 1500) {
    const key = getApiKey();
    if (!key) throw new Error('Google Places API key not configured');
    const url = `${API_BASE}/nearbysearch/json?location=${lat},${lng}&radius=${radius}&key=${key}&language=en`;
    const data = await fetchJson(url);
    return (data.results || []).map((r: any) => ({
      placeId: r.place_id,
      name: r.name,
      address: r.vicinity || r.formatted_address || r.name,
      latitude: r.geometry?.location?.lat,
      longitude: r.geometry?.location?.lng,
    }));
  },
};

export default googlePlacesService;
