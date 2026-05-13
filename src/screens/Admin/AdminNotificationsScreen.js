import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../api/config';
import { COLORS, SIZES, SHADOWS, FONTS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useAlert } from '../../context/AlertContext';
import AnimatedTouchable from '../../components/AnimatedTouchable';

const AdminNotificationsScreen = ({ navigation }) => {
  const { userToken } = useContext(AuthContext);
  const { showAlert } = useAlert();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const sendNotification = async () => {
    if (!title || !body) {
      showAlert({ title: 'Error', message: 'Please enter title and body', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/users/admin/send-notification`, {
        title, body
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      showAlert({ title: 'Success', message: `Notification sent to ${res.data.successCount} devices!`, type: 'success' });
      setTitle('');
      setBody('');
    } catch (error) {
      console.log(error);
      showAlert({ 
        title: 'Send Failed', 
        message: error.response?.data?.message || 'Server error. Ensure Firebase Admin is setup in backend.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginRight: 15}}>
          <Icon name="arrow-left" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Push Notification</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notification Title</Text>
          <TextInput 
            style={styles.input} 
            value={title} 
            onChangeText={setTitle} 
            placeholder="e.g. Special Offer!" 
            placeholderTextColor={COLORS.secondary} 
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Message Body</Text>
          <TextInput 
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
            value={body} 
            onChangeText={setBody} 
            multiline 
            placeholder="e.g. Get 20% off on all MDF CNC cuts today." 
            placeholderTextColor={COLORS.secondary} 
          />
        </View>

        <AnimatedTouchable style={styles.submitBtn} onPress={sendNotification} disabled={loading}>
          {loading ? <ActivityIndicator color="#000" /> : (
            <>
              <Icon name="paper-plane" size={16} color="#000" style={{ marginRight: 8 }} />
              <Text style={styles.submitBtnText}>Send to All Users</Text>
            </>
          )}
        </AnimatedTouchable>
        
        <View style={styles.infoBox}>
          <Icon name="info-circle" size={16} color={COLORS.secondary} style={{ marginRight: 8 }} />
          <Text style={styles.infoText}>
            Note: This sends a real FCM push notification to all users who have the app installed and are logged in.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: COLORS.text, ...FONTS.h2 },
  form: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { color: COLORS.text, fontWeight: 'bold', marginBottom: 8 },
  input: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusSm, padding: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.surfaceLight },
  submitBtn: { backgroundColor: COLORS.primary, padding: 16, borderRadius: SIZES.radius, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', ...SHADOWS.dark },
  submitBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  infoBox: { flexDirection: 'row', backgroundColor: COLORS.surfaceLight, padding: 15, borderRadius: SIZES.radiusSm, marginTop: 20 },
  infoText: { color: COLORS.secondary, flex: 1, fontSize: 12, lineHeight: 18 }
});

export default AdminNotificationsScreen;
