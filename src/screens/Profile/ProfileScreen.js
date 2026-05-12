import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { AuthContext, API_URL } from '../../context/AuthContext';
import { COLORS, SIZES, SHADOWS, FONTS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/FontAwesome5';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';

const ProfileScreen = ({ navigation }) => {
  const { logout, userToken } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      setProfile(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const changeProfileImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, async (response) => {
      if (!response.didCancel && response.assets && response.assets.length > 0) {
        const image = response.assets[0];
        setUploadingImage(true);
        
        try {
          const formData = new FormData();
          formData.append('avatar', {
            uri: image.uri,
            type: image.type,
            name: image.fileName || 'avatar.jpg',
          });

          await axios.put(`${API_URL}/users/profile/image`, formData, {
            headers: { 
              Authorization: `Bearer ${userToken}`,
              'Content-Type': 'multipart/form-data'
            }
          });
          
          fetchProfile(); // Refresh profile to get new image URL
        } catch (error) {
          Alert.alert('Error', 'Failed to upload profile image.');
        } finally {
          setUploadingImage(false);
        }
      }
    });
  };

  const renderMenuItem = (icon, title, color = COLORS.text, onPress = null, showBadge = false) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIconWrap}>
        <Icon name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.menuTitle, { color }]}>{title}</Text>
      {showBadge && <View style={styles.badge} />}
      <Icon name="chevron-right" size={14} color={COLORS.surfaceLight} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        {profile?.role === 'admin' && (
          <TouchableOpacity style={styles.adminHeaderBadge} onPress={() => navigation.navigate('AdminDashboard')}>
            <Icon name="user-shield" size={12} color="#000" style={{marginRight: 6}} />
            <Text style={styles.adminHeaderBadgeText}>Admin Panel</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Top Premium Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileHeaderRow}>
              <View>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.name}>{profile?.name}</Text>
              </View>
              <TouchableOpacity style={styles.avatarContainer} onPress={changeProfileImage}>
                {uploadingImage ? (
                  <View style={styles.avatarPlaceholder}>
                    <ActivityIndicator color={COLORS.primary} />
                  </View>
                ) : profile?.avatarUrl ? (
                  <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{profile?.name?.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <View style={styles.editAvatarBadge}>
                  <Icon name="camera" size={10} color="#000" />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.contactInfo}>
              <View style={styles.contactRow}>
                <Icon name="envelope" size={14} color={COLORS.primary} style={styles.contactIcon} />
                <Text style={styles.email}>{profile?.email}</Text>
              </View>
              <View style={styles.contactRow}>
                <Icon name="phone-alt" size={14} color={COLORS.primary} style={styles.contactIcon} />
                <Text style={styles.phone}>{profile?.phone}</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Account Settings</Text>
            <View style={styles.cardBlock}>
              {renderMenuItem('user-edit', 'Edit Profile')}
              {renderMenuItem('lock', 'Change Password')}
              {renderMenuItem('bookmark', 'Saved Designs', COLORS.text, () => navigation.navigate('MainTabs', { screen: 'Saved' }))}
              {renderMenuItem('box-open', 'Order History', COLORS.text, () => navigation.navigate('MainTabs', { screen: 'Orders' }))}
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Customer Support</Text>
            <View style={styles.cardBlock}>
              {renderMenuItem('headset', 'Chat with Admin', COLORS.primary, () => navigation.navigate('CustomerSupport'), true)}
              {renderMenuItem('whatsapp', 'WhatsApp Support', '#25D366')}
              {renderMenuItem('phone', 'Call Support', COLORS.text)}
              {renderMenuItem('question-circle', 'Help Center')}
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>More</Text>
            <View style={styles.cardBlock}>
              {renderMenuItem('bell', 'Notification Settings')}
              {renderMenuItem('palette', 'Theme Settings')}
              {renderMenuItem('share-alt', 'Share App')}
              {renderMenuItem('star', 'Rate App')}
              {renderMenuItem('file-contract', 'Privacy Policy')}
              {renderMenuItem('info-circle', 'About Workshop')}
            </View>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Icon name="sign-out-alt" size={18} color={COLORS.error} />
            <Text style={styles.logoutBtnText}>Log Out</Text>
          </TouchableOpacity>
          
          <View style={{height: 100}} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { color: COLORS.text, ...FONTS.h1 },
  adminHeaderBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  adminHeaderBadgeText: { color: '#000', fontSize: 12, fontWeight: 'bold' },
  
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  
  profileCard: { backgroundColor: COLORS.card, borderRadius: SIZES.radiusLg, padding: 25, marginBottom: 25, borderWidth: 1, borderColor: COLORS.surfaceLight, ...SHADOWS.light },
  profileHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  welcomeText: { color: COLORS.secondary, ...FONTS.bodySm, marginBottom: 4 },
  name: { color: COLORS.text, ...FONTS.h2 },
  
  avatarContainer: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: COLORS.primary, padding: 2 },
  avatar: { width: '100%', height: '100%', borderRadius: 40 },
  avatarPlaceholder: { width: '100%', height: '100%', borderRadius: 40, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 32, color: COLORS.primary, fontWeight: 'bold' },
  editAvatarBadge: { position: 'absolute', bottom: -5, right: -5, width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.card, ...SHADOWS.glow },
  
  contactInfo: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusSm, padding: 15 },
  contactRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  contactIcon: { width: 20 },
  email: { color: COLORS.secondary, ...FONTS.bodySm },
  phone: { color: COLORS.secondary, ...FONTS.bodySm },
  
  sectionContainer: { marginBottom: 25 },
  sectionTitle: { color: COLORS.secondary, fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15, marginLeft: 5 },
  cardBlock: { backgroundColor: COLORS.card, borderRadius: SIZES.radius, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.surfaceLight, ...SHADOWS.light },
  
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15 },
  menuIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuTitle: { flex: 1, ...FONTS.body, fontWeight: '500' },
  badge: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.error, marginRight: 10 },
  
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.card, padding: 18, borderRadius: SIZES.radius, borderWidth: 1, borderColor: COLORS.error + '30', ...SHADOWS.light },
  logoutBtnText: { color: COLORS.error, ...FONTS.h3, marginLeft: 10 }
});

export default ProfileScreen;
