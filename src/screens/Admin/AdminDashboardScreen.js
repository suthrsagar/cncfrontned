import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { AuthContext, API_URL } from '../../context/AuthContext';
import { COLORS, SIZES, SHADOWS, FONTS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Animated, { FadeInDown } from 'react-native-reanimated';
import axios from 'axios';

const AdminDashboardScreen = ({ navigation }) => {
  const { userInfo, userToken } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        setStats(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const renderStatCard = (title, value, icon, color) => (
    <View style={styles.statCard}>
      <Icon name={icon} size={24} color={color} style={styles.statIcon} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const renderDashboardLink = (title, icon, route, index, params) => (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate(route, params)}>
        <View style={styles.iconContainer}>
          <Icon name={icon} size={24} color={COLORS.primary} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Icon name="chevron-right" size={16} color={COLORS.secondary} style={styles.arrow} />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginRight: 15}}>
          <Icon name="arrow-left" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.greeting}>Admin Dashboard</Text>
          <Text style={styles.adminName}>{userInfo?.name}</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.statsContainer}>
            {renderStatCard('Total Users', stats?.totalUsers || 0, 'users', '#3b82f6')}
            {renderStatCard('Total Orders', stats?.totalOrders || 0, 'box', COLORS.primary)}
            {renderStatCard('Pending', stats?.pendingOrders || 0, 'clock', '#f59e0b')}
            {renderStatCard('Completed', stats?.completedOrders || 0, 'check-circle', COLORS.success)}
          </View>

          <Text style={styles.sectionTitle}>Management Tools</Text>
          {renderDashboardLink('Manage Orders', 'box-open', 'AdminOrders', 1)}
          {renderDashboardLink('Support Chats', 'headset', 'AdminSupportChats', 2)}
          {renderDashboardLink('Manage Designs', 'images', 'MainTabs', 3, { screen: 'Explore' })} 
          {renderDashboardLink('Upload New Design', 'upload', 'AdminAddPost', 4)}
          {renderDashboardLink('Manage Users', 'users-cog', 'AdminUsers', 5)}
          {renderDashboardLink('Manage Banners', 'image', 'AdminBanners', 6)}
          {renderDashboardLink('Admin Settings', 'cog', 'AdminSettings', 7)}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingBottom: 10, flexDirection: 'row', alignItems: 'center' },
  greeting: { color: COLORS.secondary, ...FONTS.bodySm },
  adminName: { color: COLORS.text, ...FONTS.h2 },
  content: { padding: 20, paddingBottom: 50 },
  statsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 25 },
  statCard: { width: '48%', backgroundColor: COLORS.surface, padding: 15, borderRadius: SIZES.radiusSm, marginBottom: 15, borderWidth: 1, borderColor: COLORS.surfaceLight, ...SHADOWS.dark },
  statIcon: { marginBottom: 10 },
  statValue: { color: COLORS.text, ...FONTS.h2 },
  statTitle: { color: COLORS.secondary, ...FONTS.bodySm, marginTop: 5 },
  sectionTitle: { color: COLORS.text, ...FONTS.h3, marginBottom: 15, marginTop: 10 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: 18, borderRadius: SIZES.radiusSm, marginBottom: 12, borderWidth: 1, borderColor: COLORS.surfaceLight, ...SHADOWS.dark },
  iconContainer: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: COLORS.glassBackground, justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: COLORS.surfaceLight },
  cardTitle: { flex: 1, color: COLORS.text, ...FONTS.body },
  arrow: { marginLeft: 10 }
});

export default AdminDashboardScreen;


