import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator, Dimensions } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../api/config';
import { COLORS, SIZES, SHADOWS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { useAlert } from '../../context/AlertContext';
import SkeletonCard from '../../components/SkeletonCard';
import AnimatedTouchable from '../../components/AnimatedTouchable';

const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 25;

const categories = ['All', 'Door Designs', 'Wall Art', 'Temple Designs', 'Name Plates', 'Furniture', 'Mandala'];

const ExploreScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [savedDesignIds, setSavedDesignIds] = useState(new Set());
  const { userToken } = useContext(AuthContext);
  const { showAlert } = useAlert();

  const fetchSavedDesigns = async () => {
    if (!userToken) return;
    try {
      const res = await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      const ids = res.data.savedDesigns.map(d => typeof d === 'object' ? d._id : d);
      setSavedDesignIds(new Set(ids));
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchSavedDesigns();
    }, [userToken])
  );

  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/designs`, {
        params: { category: activeCategory !== 'All' ? activeCategory : '', search: searchQuery }
      });
      setDesigns(res.data);
    } catch (error) {
      console.error('Fetch designs error:', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, [activeCategory, searchQuery]);

  const handleSaveToggle = async (id) => {
    try {
      const res = await axios.put(`${API_URL}/users/save-design/${id}`, {}, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      const newSavedIds = new Set(res.data);
      setSavedDesignIds(newSavedIds);
      
      const isSaved = newSavedIds.has(id);
      showAlert({ 
        title: isSaved ? (t('success') || 'Success') : (t('info') || 'Info'), 
        message: isSaved ? (t('design_saved') || 'Design saved successfully') : (t('design_removed') || 'Design removed from saved'), 
        type: isSaved ? 'success' : 'info' 
      });
    } catch (error) {
      console.error('Save design error:', error);
      showAlert({ title: t('error') || 'Error', message: 'Failed to save design', type: 'error' });
    }
  };

  const renderCategory = ({ item }) => (
    <AnimatedTouchable 
      style={[styles.categoryBtn, activeCategory === item && styles.categoryBtnActive]}
      onPress={() => setActiveCategory(item)}
      scaleTo={0.9}
    >
      <Text style={[styles.categoryText, activeCategory === item && styles.categoryTextActive]}>{item}</Text>
    </AnimatedTouchable>
  );

  const renderDesignCard = ({ item, index }) => {
    const displayImage = item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : item.imageUrl;
    
    return (
      <Animated.View entering={FadeInDown.delay(index * 100).springify()} style={styles.cardContainer}>
        <AnimatedTouchable 
          style={styles.card} 
          activeOpacity={0.9}
          scaleTo={0.97}
          onPress={() => navigation.navigate('DesignDetails', { design: item })}
        >
          <Image source={{ uri: displayImage }} style={styles.cardImage} />
          
          <View style={styles.cardOverlay}>
            <AnimatedTouchable style={styles.saveBtn} onPress={() => handleSaveToggle(item._id)} scaleTo={0.8}>
              <Icon 
                name="bookmark" 
                size={16} 
                color={savedDesignIds.has(item._id) ? COLORS.primary : COLORS.text} 
                solid={savedDesignIds.has(item._id)} 
              />
            </AnimatedTouchable>
          </View>

          {item.imageUrls && item.imageUrls.length > 1 && (
            <View style={styles.multipleImagesIcon}>
              <Icon name="images" size={14} color="#fff" />
            </View>
          )}

          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.cardCategory}>{item.category}</Text>
          </View>
        </AnimatedTouchable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{t('welcome_to')}</Text>
          <Text style={styles.brandName}>{t('brand_name')}</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Icon name="bell" size={20} color={COLORS.text} />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.searchContainer, searchFocused && { borderColor: COLORS.primary, shadowColor: COLORS.primary, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 }]}>
        <Icon name="search" size={18} color={searchFocused ? COLORS.primary : COLORS.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('search_designs')}
          placeholderTextColor={COLORS.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
      </Animated.View>

      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={renderCategory}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <FlatList
            data={[1, 2, 3, 4, 5, 6]}
            numColumns={2}
            keyExtractor={(item) => item.toString()}
            renderItem={() => <SkeletonCard />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      ) : (
        <FlatList
          data={designs}
          numColumns={2}
          keyExtractor={(item) => item._id}
          renderItem={renderDesignCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="box-open" size={50} color={COLORS.surfaceLight} />
              <Text style={styles.emptyText}>{t('no_designs_found')}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  greeting: {
    color: COLORS.secondary,
    fontSize: SIZES.fontMd,
  },
  brandName: {
    color: COLORS.primary,
    fontSize: SIZES.fontXl,
    fontWeight: 'bold',
  },
  notificationBtn: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: SIZES.radius,
    ...SHADOWS.dark,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    backgroundColor: COLORS.error,
    borderRadius: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    borderRadius: SIZES.radiusLg,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    paddingVertical: 15,
    fontSize: SIZES.fontMd,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  categoryBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    color: COLORS.secondary,
    fontSize: SIZES.fontSm,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#000',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 100, // For bottom tab
  },
  cardContainer: {
    width: cardWidth,
    marginHorizontal: 5,
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    ...SHADOWS.dark,
  },
  cardImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  cardOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  saveBtn: {
    backgroundColor: COLORS.glassBackground,
    padding: 8,
    borderRadius: 20,
  },
  multipleImagesIcon: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 6,
    borderRadius: 15,
  },
  cardInfo: {
    padding: 12,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardCategory: {
    color: COLORS.secondary,
    fontSize: SIZES.fontSm,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: COLORS.secondary,
    marginTop: 10,
    fontSize: SIZES.fontMd,
  }
});

export default ExploreScreen;
