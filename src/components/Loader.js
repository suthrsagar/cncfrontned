import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { COLORS, FONTS } from '../theme/theme';
import Icon from 'react-native-vector-icons/FontAwesome5';

const Loader = () => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        <Icon name="drafting-compass" size={60} color={COLORS.primary} />
        <Text style={styles.brandName}>WoodCraft CNC</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    marginTop: 20,
    color: COLORS.primary,
    ...FONTS.h1,
    fontWeight: 'bold',
    letterSpacing: 2,
  }
});

export default Loader;
