import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/FontAwesome5';

const LanguageSelectScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState('en');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true
    }).start();
  }, []);

  const handleSelect = async (lang) => {
    setSelectedLang(lang);
    await i18n.changeLanguage(lang);
  };

  const handleContinue = async () => {
    await AsyncStorage.setItem('@app_language', selectedLang);
    await AsyncStorage.setItem('@has_selected_language', 'true');
    navigation.replace('Register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.iconWrap}>
          <Icon name="globe-asia" size={60} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>{t('select_language')}</Text>
        <Text style={styles.subtitle}>Choose your preferred language / अपनी पसंदीदा भाषा चुनें</Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={[styles.optionCard, selectedLang === 'en' && styles.optionCardActive]}
            onPress={() => handleSelect('en')}
            activeOpacity={0.8}
          >
            <View style={styles.optionRow}>
              <Text style={[styles.optionText, selectedLang === 'en' && styles.optionTextActive]}>English</Text>
              {selectedLang === 'en' && <Icon name="check-circle" size={20} color={COLORS.primary} solid />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.optionCard, selectedLang === 'hi' && styles.optionCardActive]}
            onPress={() => handleSelect('hi')}
            activeOpacity={0.8}
          >
            <View style={styles.optionRow}>
              <Text style={[styles.optionText, selectedLang === 'hi' && styles.optionTextActive]}>हिन्दी (Hindi)</Text>
              {selectedLang === 'hi' && <Icon name="check-circle" size={20} color={COLORS.primary} solid />}
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueBtnText}>{t('continue')}</Text>
          <Icon name="arrow-right" size={16} color="#000" style={{ marginLeft: 10 }} />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center' },
  content: { padding: 30, alignItems: 'center' },
  iconWrap: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 30, ...SHADOWS.light },
  title: { color: COLORS.text, ...FONTS.h1, marginBottom: 10, textAlign: 'center' },
  subtitle: { color: COLORS.secondary, ...FONTS.body, marginBottom: 40, textAlign: 'center' },
  optionsContainer: { width: '100%', marginBottom: 40 },
  optionCard: { backgroundColor: COLORS.surface, padding: 20, borderRadius: SIZES.radiusLg, marginBottom: 15, borderWidth: 2, borderColor: COLORS.surfaceLight, ...SHADOWS.light },
  optionCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionText: { color: COLORS.text, fontSize: 18, fontWeight: 'bold' },
  optionTextActive: { color: COLORS.primary },
  continueBtn: { flexDirection: 'row', backgroundColor: COLORS.primary, width: '100%', padding: 18, borderRadius: SIZES.radius, justifyContent: 'center', alignItems: 'center', ...SHADOWS.dark },
  continueBtnText: { color: '#000', ...FONTS.h2 }
});

export default LanguageSelectScreen;
