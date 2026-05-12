import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { API_URL, AuthContext } from '../../context/AuthContext';
import { COLORS, SIZES, SHADOWS, FONTS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { launchImageLibrary } from 'react-native-image-picker';

const AdminBannersScreen = ({ navigation }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { userToken } = useContext(AuthContext);

  const fetchBanners = async () => {
    try {
      const res = await axios.get(`${API_URL}/banners`);
      setBanners(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const selectAndUploadBanner = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, async (response) => {
      if (!response.didCancel && response.assets && response.assets.length > 0) {
        setUploading(true);
        const image = response.assets[0];
        try {
          const formData = new FormData();
          formData.append('image', {
            uri: image.uri,
            type: image.type,
            name: image.fileName || 'banner.jpg',
          });
          formData.append('orderIndex', banners.length);

          await axios.post(`${API_URL}/banners`, formData, {
            headers: { 
              Authorization: `Bearer ${userToken}`,
              'Content-Type': 'multipart/form-data'
            }
          });
          fetchBanners();
        } catch (error) {
          Alert.alert('Error', 'Could not upload banner');
        } finally {
          setUploading(false);
        }
      }
    });
  };

  const deleteBanner = async (id) => {
    Alert.alert('Delete Banner', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: async () => {
          try {
            await axios.delete(`${API_URL}/banners/${id}`, {
              headers: { Authorization: `Bearer ${userToken}` }
            });
            fetchBanners();
          } catch (error) {
            Alert.alert('Error', 'Could not delete banner');
          }
        }, style: 'destructive' }
    ]);
  };

  const renderBannerItem = ({ item }) => (
    <View style={styles.bannerCard}>
      <Image source={{ uri: item.imageUrl }} style={styles.bannerImage} />
      <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteBanner(item._id)}>
        <Icon name="trash" size={16} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginRight: 15}}>
          <Icon name="arrow-left" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Banners</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={banners}
          keyExtractor={(item) => item._id}
          renderItem={renderBannerItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <TouchableOpacity style={styles.uploadBtn} onPress={selectAndUploadBanner} disabled={uploading}>
              {uploading ? <ActivityIndicator color={COLORS.primary} /> : (
                <>
                  <Icon name="plus" size={20} color={COLORS.primary} style={{marginRight: 10}} />
                  <Text style={styles.uploadText}>Upload New Banner</Text>
                </>
              )}
            </TouchableOpacity>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: COLORS.text, ...FONTS.h2 },
  listContent: { padding: 20 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, padding: 20, borderRadius: SIZES.radiusSm, borderWidth: 2, borderColor: COLORS.primary, borderStyle: 'dashed', marginBottom: 20 },
  uploadText: { color: COLORS.primary, ...FONTS.h3 },
  bannerCard: { width: '100%', height: 150, borderRadius: SIZES.radiusSm, overflow: 'hidden', marginBottom: 15, borderWidth: 1, borderColor: COLORS.surfaceLight, ...SHADOWS.dark },
  bannerImage: { width: '100%', height: '100%' },
  deleteBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255, 59, 48, 0.9)', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' }
});

export default AdminBannersScreen;
