// Google Places API Configuration
// Replace 'YOUR_GOOGLE_PLACES_API_KEY' with your actual Google Places API key

export const GOOGLE_PLACES_CONFIG = {
  // Get your API key from: https://console.cloud.google.com/apis/credentials
  API_KEY: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || 'AIzaSyDX9SxLUCpU37WiQmyP-_Lsy324r_96OGw',
  
  // API endpoints
  ENDPOINTS: {
    AUTOCOMPLETE: 'https://maps.googleapis.com/maps/api/place/autocomplete/json',
    DETAILS: 'https://maps.googleapis.com/maps/api/place/details/json',
    NEARBY: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
  },
  
  // Request parameters
  PARAMS: {
    TYPES: 'geocode', // Restrict to addresses only
    LANGUAGE: 'en',
    REGION: 'us', // Adjust based on your target region
  },
};

// Instructions for getting Google Places API key:
// 1. Go to Google Cloud Console: https://console.cloud.google.com/
// 2. Create a new project or select existing one
// 3. Enable the following APIs:
//    - Places API
//    - Maps JavaScript API
//    - Geocoding API
// 4. Go to Credentials and create an API key
// 5. Restrict the API key to your app's bundle ID (for security)
// 6. Replace 'YOUR_GOOGLE_PLACES_API_KEY' above with your actual key
