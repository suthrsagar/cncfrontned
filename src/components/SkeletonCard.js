import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, interpolate } from 'react-native-reanimated';
import { COLORS, SIZES, SHADOWS } from '../theme/theme';

const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 25;

const SkeletonCard = () => {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmer.value, [0, 1], [0.3, 0.7]);
    return { opacity };
  });

  return (
    <View style={styles.cardContainer}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <View style={styles.cardImage} />
        <View style={styles.cardInfo}>
          <View style={styles.titleSkeleton} />
          <View style={styles.categorySkeleton} />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: cardWidth,
    marginHorizontal: 5,
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.surfaceLight || '#e0e0e0',
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    ...SHADOWS.dark,
  },
  cardImage: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.secondary + '40', // 40% opacity
  },
  cardInfo: {
    padding: 12,
  },
  titleSkeleton: {
    width: '80%',
    height: 16,
    backgroundColor: COLORS.secondary + '40',
    borderRadius: 4,
    marginBottom: 8,
  },
  categorySkeleton: {
    width: '50%',
    height: 12,
    backgroundColor: COLORS.secondary + '40',
    borderRadius: 4,
  },
});

export default SkeletonCard;
