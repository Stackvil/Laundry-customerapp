# Environment Setup Guide

## Required Environment Variables

Create a `.env` file in the root directory (`LaundryPoint1/`) with the following variables:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Places API Configuration
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
```

## Getting Google Places API Key

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create or select a project**
3. **Enable the following APIs**:
   - Places API
   - Maps JavaScript API
   - Geocoding API
4. **Create credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy your API key
5. **Restrict the API key** (recommended for production):
   - Click on the API key to edit
   - Under "Application restrictions", select your platform
   - Add your app's bundle ID for mobile
6. **Add to .env file**: Replace `your_google_places_api_key_here` with your actual key

## Getting Supabase Credentials

1. **Go to Supabase**: https://supabase.com/
2. **Create or select a project**
3. **Get your credentials**:
   - Go to "Settings" → "API"
   - Copy your "Project URL" (SUPABASE_URL)
   - Copy your "anon/public" key (SUPABASE_ANON_KEY)
4. **Add to .env file**: Replace the placeholder values

## Location Permissions

The app requires location permissions to:
- Get current location
- Find nearby places
- Search for locations

### iOS
Add to `app.json` under `ios`:
```json
"infoPlist": {
  "NSLocationWhenInUseUsageDescription": "We need your location to find nearby laundry services and pickup locations.",
  "NSLocationAlwaysUsageDescription": "We need your location to provide delivery updates."
}
```

### Android
Location permissions are already configured in the Expo setup.

## Testing Location Features

1. **Run the app**: `npx expo start`
2. **Go to Confirm Order screen**
3. **Click "Select Pickup Location"**
4. **Allow location permissions when prompted**
5. **You should see**:
   - Current location (if permission granted)
   - Recent locations
   - Nearby places
   - Search suggestions as you type

## Troubleshooting

### Location not working?
- Ensure location permissions are granted
- Check that Google Places API key is valid
- Verify all required APIs are enabled in Google Cloud Console
- Check network connectivity

### API key errors?
- Verify the API key is correct in `.env`
- Ensure Places API is enabled
- Check API key restrictions don't block your app
- Try creating a new API key without restrictions for testing

### No nearby places showing?
- Wait a few seconds for the API to respond
- Check your internet connection
- Verify the Google Places API quota isn't exceeded
- Look at console logs for error messages

## Production Checklist

- [ ] Replace hardcoded API key in `config/googlePlaces.ts` with environment variable
- [ ] Enable API key restrictions in Google Cloud Console
- [ ] Set up billing in Google Cloud Console
- [ ] Test on both iOS and Android devices
- [ ] Verify location permissions are working
- [ ] Test with different location scenarios (GPS on/off, different locations)

