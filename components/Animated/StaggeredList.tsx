import React, { useEffect } from 'react';
import { View, ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface StaggeredListItemProps extends ViewProps {
  index: number;
  staggerDelay?: number;
  children: React.ReactNode;
}

export function StaggeredListItem({
  index,
  staggerDelay = 80,
  children,
  style,
  ...props
}: StaggeredListItemProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(
      index * staggerDelay,
      withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      })
    );
    
    translateY.value = withDelay(
      index * staggerDelay,
      withSpring(0, {
        damping: 15,
        stiffness: 150,
      })
    );
  }, [index, staggerDelay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
}

