import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Image, ActivityIndicator, Dimensions } from 'react-native';
import axios from 'axios';
import { API_URL, AuthContext } from '../../context/AuthContext';
import { COLORS, SIZES, SHADOWS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 25;

const SavedScreen = ({ navigation }) => {
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userToken } = useContext(AuthContext);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      setSavedDesigns(res.data.savedDesigns || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchSaved();
    });
    return unsubscribe;
  }, [navigation]);

  const handleRemove = async (id) => {
    try {
      await axios.put(`${API_URL}/users/save-design/${id}`, {}, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      setSavedDesigns(prev => prev.filter(item => item._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const renderDesignCard = ({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()} style={styles.cardContainer}>
      <TouchableOpacity style={styles.card} activeOpacity={0.8}>
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        <View style={styles.cardOverlay}>
          <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item._id)}>
            <Icon name="bookmark" size={16} color={COLORS.primary} solid={true} />
          </TouchableOpacity>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.cardCategory}>{item.category}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Designs</Text>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={savedDesigns}
          numColumns={2}
          keyExtractor={(item) => item._id}
          renderItem={renderDesignCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="bookmark" size={50} color={COLORS.surfaceLight} />
              <Text style={styles.emptyText}>No saved designs yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20 },
  headerTitle: { color: COLORS.text, fontSize: SIZES.fontXl, fontWeight: 'bold' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 15, paddingBottom: 100 },
  cardContainer: { width: cardWidth, marginHorizontal: 5, marginBottom: 20 },
  card: { backgroundColor: COLORS.surface, borderRadius: SIZES.radius, overflow: 'hidden', ...SHADOWS.dark },
  cardImage: { width: '100%', height: 200, resizeMode: 'cover' },
  cardOverlay: { position: 'absolute', top: 10, right: 10 },
  removeBtn: { backgroundColor: COLORS.glassBackground, padding: 8, borderRadius: 20 },
  cardInfo: { padding: 12 },
  cardTitle: { color: COLORS.text, fontSize: SIZES.fontMd, fontWeight: 'bold', marginBottom: 4 },
  cardCategory: { color: COLORS.secondary, fontSize: SIZES.fontSm },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { color: COLORS.secondary, marginTop: 10, fontSize: SIZES.fontMd }
});

export default SavedScreen;
