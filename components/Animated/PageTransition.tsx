import React, { useEffect } from 'react';
import { ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';

interface PageTransitionProps extends ViewProps {
  children: React.ReactNode;
}

export default function PageTransition({
  children,
  style,
  ...props
}: PageTransitionProps) {
  const isFocused = useIsFocused();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    if (isFocused) {
      // Reset values before animating
      opacity.value = 0;
      translateY.value = 30;
      scale.value = 0.95;

      // Smooth fade in with scale and slide up effect
      opacity.value = withTiming(1, {
        duration: 400,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      
      translateY.value = withSpring(0, {
        damping: 18,
        stiffness: 120,
        mass: 0.8,
      });

      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 100,
      });
    }
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View 
      style={[{ flex: 1 }, animatedStyle, style]}
      entering={FadeIn.duration(400).easing(Easing.bezier(0.25, 0.1, 0.25, 1))}
      exiting={FadeOut.duration(250).easing(Easing.bezier(0.25, 0.1, 0.25, 1))}
      {...props}
    >
      {children}
    </Animated.View>
  );
}

