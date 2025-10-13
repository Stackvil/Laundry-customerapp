import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface AnimatedButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  scaleValue?: number;
}

export default function AnimatedButton({
  children,
  onPress,
  scaleValue = 0.95,
  style,
  ...props
}: AnimatedButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withTiming(scaleValue, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 12,
      stiffness: 200,
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[animatedStyle, style]}
      activeOpacity={0.9}
      {...props}
    >
      {children}
    </AnimatedTouchable>
  );
}

