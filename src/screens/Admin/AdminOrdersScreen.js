import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { API_URL, AuthContext } from '../../context/AuthContext';
import { COLORS, SIZES, SHADOWS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/FontAwesome5';

const AdminOrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userToken } = useContext(AuthContext);

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/orders/all`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      setOrders(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const updateStatus = async (id, currentStatus) => {
    const statuses = ['Pending', 'Accepted', 'In Progress', 'Cutting', 'Polishing', 'Ready', 'Completed', 'Delivered', 'Cancelled'];
    const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];

    try {
      await axios.put(`${API_URL}/orders/${id}/status`, { status: nextStatus }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      fetchAllOrders();
    } catch (error) {
      Alert.alert('Error', 'Could not update status');
    }
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => navigation.navigate('AdminOrderDetail', { orderId: item._id })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item._id.slice(-6).toUpperCase()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: COLORS.primary + '20' }]}>
          <Text style={[styles.statusText, { color: COLORS.primary }]}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.orderDetails}>
        <Text style={styles.detailText}><Text style={{fontWeight: 'bold', color: COLORS.text}}>User:</Text> {item.user?.name} ({item.user?.phone})</Text>
        <Text style={styles.detailText}><Text style={{fontWeight: 'bold', color: COLORS.text}}>Material:</Text> {item.material}</Text>
        <Text style={styles.detailText}><Text style={{fontWeight: 'bold', color: COLORS.text}}>Size:</Text> {item.width}x{item.height} inches</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Orders</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  backBtn: { marginRight: 15 },
  headerTitle: { color: COLORS.text, fontSize: SIZES.fontXl, fontWeight: 'bold' },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  orderCard: { backgroundColor: COLORS.surface, borderRadius: SIZES.radius, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: COLORS.surfaceLight, ...SHADOWS.dark },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderId: { color: COLORS.text, fontSize: SIZES.fontLg, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: COLORS.primary },
  statusText: { fontSize: SIZES.fontSm, fontWeight: 'bold' },
  orderDetails: { marginTop: 5 },
  detailText: { color: COLORS.secondary, fontSize: SIZES.fontMd, marginBottom: 5 }
});

export default AdminOrdersScreen;
