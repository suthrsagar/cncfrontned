import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withSequence, withDelay, runOnJS } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { COLORS, SIZES, FONTS, SHADOWS } from '../theme/theme';
import AnimatedTouchable from './AnimatedTouchable';

const OrderSuccessModal = ({ visible, onClose, title = "Order Placed!", message = "Your custom order has been received successfully." }) => {
  const scale = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Reset values
      scale.value = 0;
      checkScale.value = 0;
      buttonOpacity.value = 0;

      // Start animation
      scale.value = withSpring(1, { damping: 12, stiffness: 100 });
      checkScale.value = withDelay(300, withSpring(1, { damping: 10, stiffness: 120 }));
      buttonOpacity.value = withDelay(600, withTiming(1, { duration: 300 }));
    }
  }, [visible]);

  const handleClose = () => {
    scale.value = withTiming(0, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(onClose)();
      }
    });
  };

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: withTiming(buttonOpacity.value === 1 ? 0 : 20) }]
  }));

  if (!visible && scale.value === 0) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, modalStyle]}>
          <Animated.View style={[styles.iconContainer, checkStyle]}>
            <Icon name="check" size={50} color="#fff" />
          </Animated.View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <Animated.View style={[styles.btnContainer, buttonStyle]}>
            <AnimatedTouchable style={styles.button} onPress={handleClose} scaleTo={0.95}>
              <Text style={styles.buttonText}>Track My Order</Text>
            </AnimatedTouchable>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: 30,
    alignItems: 'center',
    ...SHADOWS.dark,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...SHADOWS.glow,
  },
  title: {
    ...FONTS.h1,
    color: COLORS.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    ...FONTS.body,
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  btnContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#000',
    ...FONTS.h3,
    fontWeight: 'bold',
  }
});

export default OrderSuccessModal;
