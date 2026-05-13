import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const AnimatedTouchable = ({ children, onPress, style, scaleTo = 0.95, activeOpacity = 0.8, disabled = false, ...props }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withSpring(scaleTo, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(activeOpacity, { duration: 150 });
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      style={[style, animatedStyle]}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
};

export default AnimatedTouchable;
