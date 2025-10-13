# Google Maps Location Search with Autocomplete

A fast and simple Google Maps location search feature with autocomplete for React Native (Expo) apps using the Google Places API.

## 🚀 Features

- **Fast Autocomplete**: Real-time location suggestions as you type
- **Google Places API Integration**: Uses official Google Places API for accurate results
- **Debounced Search**: Optimized API calls with 300ms debounce
- **Location Details**: Full address and coordinates for selected locations
- **Recent Locations**: Saves and displays recently selected locations
- **Map Integration**: Visual map display with marker for selected locations
- **Responsive Design**: Clean, modern UI that works on all screen sizes

## 📁 Files Created

```
├── services/
│   └── googlePlaces.ts          # Google Places API service
├── components/
│   └── LocationSearch.tsx        # Main location search component
├── config/
│   └── googlePlaces.ts          # API configuration
├── app/
│   ├── location-picker-enhanced.tsx    # Enhanced location picker
│   └── location-search-example.tsx     # Usage example
```

## 🛠 Setup Instructions

### 1. Get Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Places API**
   - **Maps JavaScript API**
   - **Geocoding API**
4. Go to **Credentials** and create an API key
5. Restrict the API key to your app's bundle ID for security

### 2. Configure API Key

Update `config/googlePlaces.ts`:

```typescript
export const GOOGLE_PLACES_CONFIG = {
  API_KEY: 'YOUR_ACTUAL_API_KEY_HERE', // Replace with your API key
  // ... rest of config
};
```

### 3. Install Dependencies

The required dependencies are already in your `package.json`:
- `react-native-google-places-autocomplete` ✅
- `react-native-maps` ✅
- `expo-location` ✅

### 4. Usage Examples

#### Basic Usage

```typescript
import LocationSearch from '@/components/LocationSearch';

function MyComponent() {
  const handleLocationSelect = (location) => {
    console.log('Selected:', location.address);
    console.log('Coordinates:', location.coordinates);
  };

  return (
    <LocationSearch
      onLocationSelect={handleLocationSelect}
      placeholder="Search for a location..."
    />
  );
}
```

#### Advanced Usage with Styling

```typescript
<LocationSearch
  onLocationSelect={handleLocationSelect}
  placeholder="Enter your address..."
  initialValue=""
  style={customStyles}
/>
```

#### Integration with Existing Location Picker

Replace your current location picker with the enhanced version:

```typescript
// In your navigation or component
import LocationPickerEnhanced from '@/app/location-picker-enhanced';

// Use it in your app
<LocationPickerEnhanced />
```

## 🎯 Component Props

### LocationSearch Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onLocationSelect` | `function` | ✅ | Callback when location is selected |
| `placeholder` | `string` | ❌ | Search input placeholder text |
| `initialValue` | `string` | ❌ | Initial search value |
| `style` | `object` | ❌ | Custom styles for the container |

### Location Data Structure

When a location is selected, the callback receives:

```typescript
{
  address: string;           // Full formatted address
  coordinates: {
    latitude: number;        // Latitude coordinate
    longitude: number;       // Longitude coordinate
  };
  placeId: string;          // Google Places ID
}
```

## 🔧 Customization

### Styling

You can customize the appearance by modifying the styles in `LocationSearch.tsx`:

```typescript
const customStyles = {
  container: {
    // Custom container styles
  },
  inputContainer: {
    // Custom input styles
  },
  suggestionsContainer: {
    // Custom suggestions dropdown styles
  },
};
```

### API Configuration

Modify `config/googlePlaces.ts` to adjust:

- **Language**: Change `LANGUAGE: 'en'` to your preferred language
- **Region**: Change `REGION: 'us'` to your target region
- **Types**: Modify `TYPES: 'geocode'` to include other place types

## 🚨 Important Notes

1. **API Key Security**: Never commit your API key to version control. Use environment variables in production.

2. **Rate Limits**: Google Places API has usage limits. Consider implementing caching for frequently searched locations.

3. **Billing**: Google Places API is a paid service. Monitor your usage in the Google Cloud Console.

4. **Permissions**: Ensure you have location permissions enabled for the current location feature.

## 🧪 Testing

Test the implementation using the example component:

```typescript
// Navigate to the example
import LocationSearchExample from '@/app/location-search-example';
```

## 🐛 Troubleshooting

### Common Issues

1. **"API key not valid"**: Check your API key and ensure Places API is enabled
2. **No suggestions appearing**: Verify internet connection and API key permissions
3. **CORS errors**: This shouldn't happen in React Native, but check your API key restrictions

### Debug Mode

Enable debug logging by adding console logs in `services/googlePlaces.ts`:

```typescript
console.log('API Response:', data); // Add this for debugging
```

## 📱 Example Screenshots

The component provides:
- Clean search input with search icon
- Dropdown suggestions with location icons
- Selected location display with coordinates
- Recent locations list
- Map integration with markers

## 🔄 Future Enhancements

Potential improvements you can add:
- **Favorites**: Save frequently used locations
- **Offline Support**: Cache recent searches
- **Voice Search**: Add speech-to-text integration
- **Custom Markers**: Use custom map markers
- **Route Planning**: Add directions between locations

---

**Ready to use!** 🎉 Your Google Maps location search with autocomplete is now set up and ready to use in your React Native Expo app.
