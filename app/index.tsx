import { View, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import * as Location from 'expo-location';

export default function SplashScreen() {
  const router = useRouter();
  
  const player = useVideoPlayer(require('@/assets/videos/intologo.mp4'), (player) => {
    player.loop = false;
    player.muted = false;
    player.play();
  });

  useEffect(() => {
    // Request location permission when entering the app
    const requestLocationPermission = async () => {
      try {
        await Location.requestForegroundPermissionsAsync();
      } catch (error) {
        console.error('Error requesting location permission:', error);
      }
    };

    // Request permission immediately when app starts
    requestLocationPermission();
  }, []);

  useEffect(() => {
    const subscription = player.addListener('playToEnd', () => {
      router.replace('/(tabs)/home');
    });
    
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="contain"
        nativeControls={false}
        allowsPictureInPicture={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.1 }],
  },
});
