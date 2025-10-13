import { 
  withSpring, 
  withTiming, 
  withSequence,
  withDelay,
  Easing,
  SharedValue,
} from 'react-native-reanimated';

// Spring configurations
export const springConfig = {
  damping: 15,
  stiffness: 150,
  mass: 1,
};

export const softSpring = {
  damping: 20,
  stiffness: 100,
  mass: 0.5,
};

export const bouncySpring = {
  damping: 10,
  stiffness: 200,
  mass: 1,
};

// Timing configurations
export const timingConfig = {
  duration: 300,
  easing: Easing.out(Easing.cubic),
};

export const fastTiming = {
  duration: 200,
  easing: Easing.out(Easing.quad),
};

export const slowTiming = {
  duration: 500,
  easing: Easing.out(Easing.cubic),
};

// Common animation presets
export const fadeIn = (delay = 0) => ({
  from: { opacity: 0 },
  to: { opacity: 1 },
  delay,
  duration: 400,
});

export const fadeOut = () => ({
  from: { opacity: 1 },
  to: { opacity: 0 },
  duration: 300,
});

export const slideInLeft = (delay = 0) => ({
  from: { translateX: -50, opacity: 0 },
  to: { translateX: 0, opacity: 1 },
  delay,
});

export const slideInRight = (delay = 0) => ({
  from: { translateX: 50, opacity: 0 },
  to: { translateX: 0, opacity: 1 },
  delay,
});

export const slideInUp = (delay = 0) => ({
  from: { translateY: 50, opacity: 0 },
  to: { translateY: 0, opacity: 1 },
  delay,
});

export const slideInDown = (delay = 0) => ({
  from: { translateY: -50, opacity: 0 },
  to: { translateY: 0, opacity: 1 },
  delay,
});

export const scaleIn = (delay = 0) => ({
  from: { scale: 0.8, opacity: 0 },
  to: { scale: 1, opacity: 1 },
  delay,
});

export const scaleOut = () => ({
  from: { scale: 1, opacity: 1 },
  to: { scale: 0.8, opacity: 0 },
  duration: 200,
});

// Button press animation
export const buttonPress = (scale: SharedValue<number>) => {
  'worklet';
  scale.value = withSequence(
    withTiming(0.95, { duration: 100 }),
    withSpring(1, springConfig)
  );
};

// Card entrance animation
export const cardEntrance = (index: number) => ({
  from: { 
    translateY: 30, 
    opacity: 0,
    scale: 0.95,
  },
  to: { 
    translateY: 0, 
    opacity: 1,
    scale: 1,
  },
  delay: index * 100, // Stagger effect
});

// List item stagger
export const staggeredFadeIn = (index: number, staggerDelay = 50) => ({
  from: { opacity: 0, translateY: 20 },
  to: { opacity: 1, translateY: 0 },
  delay: index * staggerDelay,
});

// Rotate animation
export const rotate = (duration = 1000) => ({
  from: { rotate: '0deg' },
  to: { rotate: '360deg' },
  duration,
  loop: true,
});

// Pulse animation
export const pulse = () => ({
  from: { scale: 1 },
  to: { scale: 1.1 },
  duration: 1000,
  loop: true,
  reverse: true,
});

// Shake animation
export const shake = (translateX: SharedValue<number>) => {
  'worklet';
  translateX.value = withSequence(
    withTiming(-10, { duration: 50 }),
    withTiming(10, { duration: 50 }),
    withTiming(-10, { duration: 50 }),
    withTiming(10, { duration: 50 }),
    withTiming(0, { duration: 50 })
  );
};

// Success bounce
export const successBounce = (scale: SharedValue<number>) => {
  'worklet';
  scale.value = withSequence(
    withSpring(1.2, bouncySpring),
    withSpring(1, springConfig)
  );
};

// Page transition
export const pageTransition = {
  slideFromRight: {
    from: { translateX: 300, opacity: 0 },
    to: { translateX: 0, opacity: 1 },
  },
  slideFromLeft: {
    from: { translateX: -300, opacity: 0 },
    to: { translateX: 0, opacity: 1 },
  },
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  scaleIn: {
    from: { scale: 0.9, opacity: 0 },
    to: { scale: 1, opacity: 1 },
  },
};

// Easing functions export
export const easings = {
  easeIn: Easing.in(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  easeInOut: Easing.inOut(Easing.ease),
  linear: Easing.linear,
  bounce: Easing.bounce,
  elastic: Easing.elastic(1),
};

