import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { COLORS, SIZES, SHADOWS, FONTS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../api/config';
import { useFocusEffect } from '@react-navigation/native';
import { useAlert } from '../../context/AlertContext';
import AnimatedTouchable from '../../components/AnimatedTouchable';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const DesignDetailsScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { design } = route.params;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const { userToken } = React.useContext(AuthContext);
  const { showAlert } = useAlert();

  const fetchSavedStatus = async () => {
    if (!userToken) return;
    try {
      const res = await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      const ids = res.data.savedDesigns.map(d => typeof d === 'object' ? d._id : d);
      setIsSaved(ids.includes(design._id));
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchSavedStatus();
    }, [userToken])
  );

  const handleSaveToggle = async () => {
    try {
      const res = await axios.put(`${API_URL}/users/save-design/${design._id}`, {}, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      const ids = res.data.map(d => typeof d === 'object' ? d._id : d);
      const currentlySaved = ids.includes(design._id);
      setIsSaved(currentlySaved);
      
      showAlert({ 
        title: currentlySaved ? (t('success') || 'Success') : (t('info') || 'Info'), 
        message: currentlySaved ? (t('design_saved') || 'Design saved successfully') : (t('design_removed') || 'Design removed from saved'), 
        type: currentlySaved ? 'success' : 'info' 
      });
    } catch (error) {
      console.error('Save design error:', error);
      showAlert({ title: t('error') || 'Error', message: 'Failed to save design', type: 'error' });
    }
  };

  const images = design.imageUrls && design.imageUrls.length > 0 
    ? design.imageUrls 
    : [design.imageUrl];

  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveImageIndex(Math.round(index));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <AnimatedTouchable onPress={() => navigation.goBack()} style={styles.backBtn} scaleTo={0.8}>
          <Icon name="arrow-left" size={20} color={COLORS.text} />
        </AnimatedTouchable>
        <Text style={styles.headerTitle}>Design Details</Text>
        <AnimatedTouchable style={styles.saveBtn} onPress={handleSaveToggle} scaleTo={0.8}>
          <Icon name="bookmark" size={20} color={isSaved ? COLORS.primary : COLORS.text} solid={isSaved} />
        </AnimatedTouchable>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.carouselContainer}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {images.map((img, idx) => (
              <Animated.Image entering={FadeIn.duration(500).delay(idx * 100)} key={idx} source={{ uri: img }} style={styles.image} />
            ))}
          </ScrollView>
          
          {images.length > 1 && (
            <View style={styles.pagination}>
              {images.map((_, idx) => (
                <View 
                  key={idx} 
                  style={[styles.dot, idx === activeImageIndex && styles.activeDot]} 
                />
              ))}
            </View>
          )}
        </View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.detailsContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{design.title}</Text>
            {design.isFeatured && (
              <View style={styles.featuredBadge}>
                <Icon name="star" solid size={10} color="#000" />
                <Text style={styles.featuredText}>Featured</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.category}>{design.category}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Icon name="eye" size={14} color={COLORS.secondary} style={styles.statIcon} />
              <Text style={styles.statText}>{design.views || 0} Views</Text>
            </View>
            <View style={styles.stat}>
              <Icon name="calendar-alt" size={14} color={COLORS.secondary} style={styles.statIcon} />
              <Text style={styles.statText}>{new Date(design.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>

          <View style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {design.description || "No description provided for this design."}
          </Text>
        </Animated.View>
      </ScrollView>

      <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.bottomBar}>
        <AnimatedTouchable style={styles.orderBtn} scaleTo={0.97} onPress={() => navigation.navigate('MainTabs', { screen: 'Orders', params: { referenceDesign: design } })}>
          <Text style={styles.orderBtnText}>{t('request_custom_order')}</Text>
        </AnimatedTouchable>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backBtn: { width: 40, height: 40, backgroundColor: COLORS.surface, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  saveBtn: { width: 40, height: 40, backgroundColor: COLORS.surface, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: COLORS.text, ...FONTS.h3 },
  content: { paddingBottom: 100 },
  carouselContainer: { width: width, height: width * 1.2, position: 'relative' },
  image: { width: width, height: '100%', resizeMode: 'cover' },
  pagination: { flexDirection: 'row', position: 'absolute', bottom: 20, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)', marginHorizontal: 4 },
  activeDot: { backgroundColor: COLORS.primary, width: 12 },
  detailsContainer: { padding: 20, backgroundColor: COLORS.surface, borderTopLeftRadius: SIZES.radiusLg, borderTopRightRadius: SIZES.radiusLg, marginTop: -20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  title: { color: COLORS.text, ...FONTS.h2, flex: 1, marginRight: 10 },
  featuredBadge: { flexDirection: 'row', backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, alignItems: 'center' },
  featuredText: { color: '#000', fontSize: 10, fontWeight: 'bold', marginLeft: 4 },
  category: { color: COLORS.primary, ...FONTS.body, marginBottom: 15 },
  statsRow: { flexDirection: 'row', marginBottom: 20 },
  stat: { flexDirection: 'row', alignItems: 'center', marginRight: 20, backgroundColor: COLORS.background, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statIcon: { marginRight: 8 },
  statText: { color: COLORS.secondary, ...FONTS.bodySm },
  divider: { height: 1, backgroundColor: COLORS.surfaceLight, marginVertical: 20 },
  sectionTitle: { color: COLORS.text, ...FONTS.h3, marginBottom: 10 },
  description: { color: COLORS.secondary, ...FONTS.body, lineHeight: 24 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.surfaceLight },
  orderBtn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: SIZES.radius, alignItems: 'center', ...SHADOWS.dark },
  orderBtnText: { color: '#000', ...FONTS.h3 }
});

export default DesignDetailsScreen;
