import React, { useEffect } from 'react';
import { View, ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
  useAnimatedScrollHandler,
  SharedValue,
} from 'react-native-reanimated';

interface ScrollTriggeredViewProps extends ViewProps {
  children: React.ReactNode;
  index: number;
  scrollY: SharedValue<number>;
  itemHeight?: number;
  animation?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn' | 'slideInUp';
}

export function ScrollTriggeredView({
  children,
  index,
  scrollY,
  itemHeight = 120,
  animation = 'fadeInUp',
  style,
  ...props
}: ScrollTriggeredViewProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * itemHeight,
      index * itemHeight,
      (index + 1) * itemHeight,
    ];

    switch (animation) {
      case 'fadeInUp':
        const opacity = interpolate(
          scrollY.value,
          inputRange,
          [0, 1, 1],
          Extrapolate.CLAMP
        );
        const translateY = interpolate(
          scrollY.value,
          inputRange,
          [50, 0, 0],
          Extrapolate.CLAMP
        );
        return {
          opacity,
          transform: [{ translateY }],
        };

      case 'fadeInLeft':
        const opacityLeft = interpolate(
          scrollY.value,
          inputRange,
          [0, 1, 1],
          Extrapolate.CLAMP
        );
        const translateX = interpolate(
          scrollY.value,
          inputRange,
          [-50, 0, 0],
          Extrapolate.CLAMP
        );
        return {
          opacity: opacityLeft,
          transform: [{ translateX }],
        };

      case 'fadeInRight':
        const opacityRight = interpolate(
          scrollY.value,
          inputRange,
          [0, 1, 1],
          Extrapolate.CLAMP
        );
        const translateXRight = interpolate(
          scrollY.value,
          inputRange,
          [50, 0, 0],
          Extrapolate.CLAMP
        );
        return {
          opacity: opacityRight,
          transform: [{ translateX: translateXRight }],
        };

      case 'scaleIn':
        const opacityScale = interpolate(
          scrollY.value,
          inputRange,
          [0, 1, 1],
          Extrapolate.CLAMP
        );
        const scale = interpolate(
          scrollY.value,
          inputRange,
          [0.8, 1, 1],
          Extrapolate.CLAMP
        );
        return {
          opacity: opacityScale,
          transform: [{ scale }],
        };

      case 'slideInUp':
        const translateYSlide = interpolate(
          scrollY.value,
          inputRange,
          [80, 0, 0],
          Extrapolate.CLAMP
        );
        return {
          transform: [{ translateY: translateYSlide }],
        };

      default:
        return {};
    }
  });

  return (
    <Animated.View style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
}

// Hook to create scroll handler
export function useScrollTrigger() {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return { scrollY, scrollHandler };
}

