import React, { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { ViewProps } from 'react-native';

type AnimationType = 
  | 'fadeIn' 
  | 'fadeInUp' 
  | 'fadeInDown' 
  | 'fadeInLeft' 
  | 'fadeInRight' 
  | 'scaleIn' 
  | 'slideInUp' 
  | 'slideInDown'
  | 'slideInLeft'
  | 'slideInRight';

interface AnimatedViewProps extends ViewProps {
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  children: React.ReactNode;
}

export default function AnimatedView({
  animation = 'fadeIn',
  delay = 0,
  duration = 400,
  children,
  style,
  ...props
}: AnimatedViewProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Set initial values based on animation type
    switch (animation) {
      case 'fadeIn':
        opacity.value = 0;
        break;
      case 'fadeInUp':
      case 'slideInUp':
        opacity.value = 0;
        translateY.value = 50;
        break;
      case 'fadeInDown':
      case 'slideInDown':
        opacity.value = 0;
        translateY.value = -50;
        break;
      case 'fadeInLeft':
      case 'slideInLeft':
        opacity.value = 0;
        translateX.value = -50;
        break;
      case 'fadeInRight':
      case 'slideInRight':
        opacity.value = 0;
        translateX.value = 50;
        break;
      case 'scaleIn':
        opacity.value = 0;
        scale.value = 0.8;
        break;
    }

    // Animate to final values
    const timer = setTimeout(() => {
      opacity.value = withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      });
      
      if (translateY.value !== 0) {
        translateY.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
        });
      }
      
      if (translateX.value !== 0) {
        translateX.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
        });
      }
      
      if (scale.value !== 1) {
        scale.value = withSpring(1, {
          damping: 12,
          stiffness: 120,
        });
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [animation, delay, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
}

