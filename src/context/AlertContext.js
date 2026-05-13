import React, { createContext, useState, useContext } from 'react';
import { View, Text, StyleSheet, Modal, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { COLORS, SIZES, FONTS, SHADOWS } from '../theme/theme';
import AnimatedTouchable from '../components/AnimatedTouchable';

export const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info', // 'success', 'error', 'warning', 'info', 'confirm'
    onConfirm: null,
    onCancel: null,
    confirmText: 'OK',
    cancelText: 'Cancel'
  });

  const [fadeAnim] = useState(new Animated.Value(0));

  const showAlert = (config) => {
    setAlertConfig({
      ...config,
      visible: true,
      confirmText: config.confirmText || 'OK',
      cancelText: config.cancelText || 'Cancel'
    });
    Animated.spring(fadeAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true
    }).start();
  };

  const hideAlert = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      setAlertConfig(prev => ({ ...prev, visible: false }));
    });
  };

  const handleConfirm = () => {
    if (alertConfig.onConfirm) alertConfig.onConfirm();
    hideAlert();
  };

  const handleCancel = () => {
    if (alertConfig.onCancel) alertConfig.onCancel();
    hideAlert();
  };

  const getIcon = () => {
    switch(alertConfig.type) {
      case 'success': return { name: 'check-circle', color: COLORS.success };
      case 'error': return { name: 'exclamation-circle', color: COLORS.error };
      case 'warning': return { name: 'exclamation-triangle', color: '#F39C12' };
      case 'confirm': return { name: 'question-circle', color: COLORS.primary };
      default: return { name: 'info-circle', color: COLORS.secondary };
    }
  };

  const iconConfig = getIcon();

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <Modal transparent visible={alertConfig.visible} animationType="none">
        <View style={styles.overlay}>
          <Animated.View style={[styles.alertBox, { opacity: fadeAnim, transform: [{ scale: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] }]}>
            <Icon name={iconConfig.name} size={45} color={iconConfig.color} style={styles.icon} />
            <Text style={styles.title}>{alertConfig.title}</Text>
            <Text style={styles.message}>{alertConfig.message}</Text>
            
            <View style={styles.btnRow}>
              {alertConfig.type === 'confirm' && (
                <AnimatedTouchable style={[styles.btn, styles.cancelBtn]} onPress={handleCancel} scaleTo={0.95}>
                  <Text style={styles.cancelBtnText}>{alertConfig.cancelText}</Text>
                </AnimatedTouchable>
              )}
              <AnimatedTouchable 
                style={[styles.btn, { backgroundColor: iconConfig.color }]} 
                onPress={handleConfirm}
                scaleTo={0.95}
              >
                <Text style={styles.confirmBtnText}>{alertConfig.confirmText}</Text>
              </AnimatedTouchable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  alertBox: { width: '85%', backgroundColor: COLORS.card, borderRadius: SIZES.radiusLg, padding: 25, alignItems: 'center', ...SHADOWS.dark },
  icon: { marginBottom: 15 },
  title: { color: COLORS.text, ...FONTS.h2, marginBottom: 10, textAlign: 'center' },
  message: { color: COLORS.secondary, ...FONTS.body, textAlign: 'center', marginBottom: 25 },
  btnRow: { flexDirection: 'row', width: '100%', justifyContent: 'center' },
  btn: { flex: 1, paddingVertical: 14, borderRadius: SIZES.radius, alignItems: 'center', marginHorizontal: 5 },
  cancelBtn: { backgroundColor: COLORS.surfaceLight },
  cancelBtnText: { color: COLORS.text, ...FONTS.h3 },
  confirmBtnText: { color: '#FFF', ...FONTS.h3, fontWeight: 'bold' }
});
