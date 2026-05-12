import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, ActivityIndicator, TextInput, Alert, Modal } from 'react-native';
import axios from 'axios';
import { API_URL, AuthContext } from '../../context/AuthContext';
import { COLORS, SIZES, SHADOWS, FONTS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/FontAwesome5';

const STATUS_STEPS = ['Pending', 'Accepted', 'In Review', 'Design Approved', 'Cutting', 'Polishing', 'Finishing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'];

const AdminOrderDetailScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Edit states
  const [status, setStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [priceQuote, setPriceQuote] = useState('');
  const [finalPrice, setFinalPrice] = useState('');
  
  const [modalVisible, setModalVisible] = useState(false);

  const { userToken } = useContext(AuthContext);

  const fetchOrderDetails = async () => {
    try {
      const res = await axios.get(`${API_URL}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      const data = res.data;
      setOrder(data);
      setStatus(data.status);
      setAdminNotes(data.adminNotes || '');
      setPriceQuote(data.priceQuote ? data.priceQuote.toString() : '');
      setFinalPrice(data.finalPrice ? data.finalPrice.toString() : '');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  const saveUpdates = async () => {
    setUpdating(true);
    try {
      const payload = {
        status,
        statusNote,
        adminNotes
      };
      
      if (priceQuote && !isNaN(Number(priceQuote))) {
        payload.priceQuote = Number(priceQuote);
      }
      if (finalPrice && !isNaN(Number(finalPrice))) {
        payload.finalPrice = Number(finalPrice);
      }

      await axios.put(`${API_URL}/orders/${orderId}/status`, payload, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      Alert.alert('Success', 'Order updated successfully');
      setModalVisible(false);
      setStatusNote('');
      fetchOrderDetails();
    } catch (error) {
      Alert.alert('Error', 'Could not update order');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (s) => {
    if (s === 'Cancelled') return COLORS.error;
    if (s === 'Delivered') return COLORS.success;
    return COLORS.primary;
  };

  if (loading || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: '50%' }} />
      </SafeAreaView>
    );
  }

  const displayImage = order.customImageUrl || (order.referenceDesign && order.referenceDesign.imageUrl);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Order #{order._id.slice(-6).toUpperCase()}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          {displayImage && <Image source={{ uri: displayImage }} style={styles.previewImage} />}
          <View style={styles.cardInfo}>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Current Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>{order.status}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <Text style={styles.sectionTitle}>Customer Details</Text>
            <Text style={styles.value}>{order.user?.name}</Text>
            <Text style={styles.text}>{order.user?.email}</Text>
            <Text style={styles.text}>{order.user?.phone}</Text>
            
            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Order Specs</Text>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Material</Text>
              <Text style={styles.value}>{order.material}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Dimensions</Text>
              <Text style={styles.value}>{order.width}" x {order.height}"</Text>
            </View>
            {order.notes && (
              <View style={{marginTop: 10}}>
                <Text style={styles.label}>Customer Notes:</Text>
                <Text style={styles.text}>{order.notes}</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.updateBtn} onPress={() => setModalVisible(true)}>
          <Icon name="edit" size={16} color="#000" style={{marginRight: 10}} />
          <Text style={styles.updateBtnText}>Update Order</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Order</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="times" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.statusGrid}>
                {STATUS_STEPS.map(s => (
                  <TouchableOpacity 
                    key={s} 
                    style={[styles.statusOption, status === s && styles.statusOptionActive]}
                    onPress={() => setStatus(s)}
                  >
                    <Text style={[styles.statusOptionText, status === s && styles.statusOptionTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Status Note (Optional - visible to user)</Text>
              <TextInput style={styles.input} value={statusNote} onChangeText={setStatusNote} placeholderTextColor={COLORS.secondary} placeholder="e.g. Started carving the main base..." />

              <View style={styles.row}>
                <View style={{flex: 1, marginRight: 10}}>
                  <Text style={styles.label}>Estimated Price (₹)</Text>
                  <TextInput style={styles.input} value={priceQuote} onChangeText={setPriceQuote} keyboardType="numeric" placeholderTextColor={COLORS.secondary} placeholder="e.g. 5000" />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.label}>Final Price (₹)</Text>
                  <TextInput style={styles.input} value={finalPrice} onChangeText={setFinalPrice} keyboardType="numeric" placeholderTextColor={COLORS.secondary} placeholder="e.g. 5500" />
                </View>
              </View>

              <Text style={styles.label}>Admin Notes (Internal / Status visible)</Text>
              <TextInput style={[styles.input, {height: 80}]} multiline value={adminNotes} onChangeText={setAdminNotes} placeholderTextColor={COLORS.secondary} placeholder="Add private notes..." />

              <TouchableOpacity style={styles.saveBtn} onPress={saveUpdates} disabled={updating}>
                {updating ? <ActivityIndicator color="#000" /> : <Text style={styles.saveBtnText}>Save Updates</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.surfaceLight },
  backBtn: { marginRight: 15, padding: 5 },
  headerTitle: { color: COLORS.text, ...FONTS.h2 },
  content: { padding: 20 },
  card: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusLg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.surfaceLight, ...SHADOWS.dark, marginBottom: 20 },
  previewImage: { width: '100%', height: 250, resizeMode: 'cover' },
  cardInfo: { padding: 20 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  label: { color: COLORS.secondary, ...FONTS.bodySm, marginBottom: 5 },
  value: { color: COLORS.text, ...FONTS.body, fontWeight: 'bold' },
  text: { color: COLORS.text, ...FONTS.body, marginBottom: 4 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: SIZES.fontSm, fontWeight: 'bold' },
  sectionTitle: { color: COLORS.primary, ...FONTS.h3, marginBottom: 10 },
  divider: { height: 1, backgroundColor: COLORS.surfaceLight, marginVertical: 15 },
  updateBtn: { flexDirection: 'row', backgroundColor: COLORS.primary, padding: 18, borderRadius: SIZES.radius, alignItems: 'center', justifyContent: 'center', ...SHADOWS.dark },
  updateBtnText: { color: '#000', ...FONTS.h3 },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, height: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: COLORS.text, ...FONTS.h2 },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20, marginHorizontal: -5 },
  statusOption: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: COLORS.background, borderRadius: 20, margin: 5, borderWidth: 1, borderColor: COLORS.surfaceLight },
  statusOptionActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  statusOptionText: { color: COLORS.secondary, fontSize: 12, fontWeight: 'bold' },
  statusOptionTextActive: { color: '#000' },
  input: { backgroundColor: COLORS.background, color: COLORS.text, padding: 15, borderRadius: SIZES.radiusSm, borderWidth: 1, borderColor: COLORS.surfaceLight, marginBottom: 15 },
  row: { flexDirection: 'row' },
  saveBtn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: SIZES.radius, alignItems: 'center', marginTop: 10, marginBottom: 30 },
  saveBtnText: { color: '#000', ...FONTS.h3 }
});

export default AdminOrderDetailScreen;
