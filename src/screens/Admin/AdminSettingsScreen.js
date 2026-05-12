import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SIZES, SHADOWS, FONTS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/FontAwesome5';

const AdminSettingsScreen = ({ navigation }) => {
  const { logout } = useContext(AuthContext);

  const renderSettingItem = (icon, title, value) => (
    <TouchableOpacity style={styles.settingItem}>
      <View style={styles.iconContainer}>
        <Icon name={icon} size={20} color={COLORS.primary} />
      </View>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingValue}>{value}</Text>
      </View>
      <Icon name="chevron-right" size={14} color={COLORS.secondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginRight: 15}}>
          <Icon name="arrow-left" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Account</Text>
        {renderSettingItem('lock', 'Change Password', 'Update your admin password')}
        {renderSettingItem('envelope', 'Admin Email', 'sutharsagar710@gmail.com')}

        <Text style={styles.sectionTitle}>Workshop Info</Text>
        {renderSettingItem('whatsapp', 'WhatsApp Number', '+91 98765 43210')}
        {renderSettingItem('map-marker-alt', 'Workshop Address', 'Update location details')}
        {renderSettingItem('instagram', 'Instagram Link', '@aurawoodcnc')}

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Icon name="sign-out-alt" size={20} color="#000" style={{marginRight: 10}} />
          <Text style={styles.logoutText}>Logout Admin</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: COLORS.text, ...FONTS.h2 },
  content: { padding: 20 },
  sectionTitle: { color: COLORS.text, ...FONTS.h3, marginBottom: 15, marginTop: 10 },
  settingItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: 15, borderRadius: SIZES.radiusSm, marginBottom: 12, borderWidth: 1, borderColor: COLORS.surfaceLight },
  iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.glassBackground, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  settingText: { flex: 1 },
  settingTitle: { color: COLORS.text, ...FONTS.body, fontWeight: 'bold' },
  settingValue: { color: COLORS.secondary, ...FONTS.bodySm, marginTop: 2 },
  logoutBtn: { flexDirection: 'row', backgroundColor: COLORS.primary, padding: 15, borderRadius: SIZES.radiusSm, justifyContent: 'center', alignItems: 'center', marginTop: 30, ...SHADOWS.dark },
  logoutText: { color: '#000', ...FONTS.h3 }
});

export default AdminSettingsScreen;
