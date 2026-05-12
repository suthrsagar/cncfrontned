import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../api/config';
import { COLORS, SIZES, SHADOWS, FONTS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useTranslation } from 'react-i18next';

const STATUS_STEPS = ['Pending', 'Accepted', 'In Review', 'Design Approved', 'Cutting', 'Polishing', 'Finishing', 'Ready', 'Out for Delivery', 'Delivered'];

const OrderDetailScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userToken } = useContext(AuthContext);

  const fetchOrderDetails = async () => {
    try {
      const res = await axios.get(`${API_URL}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      setOrder(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
    const interval = setInterval(fetchOrderDetails, 10000); // Poll for live updates
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    if (status === 'Cancelled') return COLORS.error;
    if (status === 'Delivered') return COLORS.success;
    return COLORS.primary;
  };

  const getTranslatedStatus = (status) => {
    const key = `status_${status.toLowerCase().replace(' ', '_')}`;
    return t(key) !== key ? t(key) : status;
  };

  const renderTimeline = (currentStatus, history) => {
    if (currentStatus === 'Cancelled') {
      return (
        <View style={styles.cancelledBox}>
          <Icon name="times-circle" size={30} color={COLORS.error} />
          <Text style={styles.cancelledText}>This order was cancelled.</Text>
        </View>
      );
    }

    const currentIndex = STATUS_STEPS.indexOf(currentStatus);
    
    return (
      <View style={styles.timelineContainer}>
        {STATUS_STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isActive = index === currentIndex;
          const historyEntry = history?.find(h => h.status === step);

          return (
            <View key={step} style={styles.timelineStep}>
              <View style={[styles.timelineDot, isCompleted && styles.timelineDotCompleted, isActive && styles.timelineDotActive]} />
              {index < STATUS_STEPS.length - 1 && (
                <View style={[styles.timelineLine, isCompleted && index < currentIndex && styles.timelineLineCompleted]} />
              )}
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineText, isActive && styles.timelineTextActive]}>{getTranslatedStatus(step)}</Text>
                {historyEntry && (
                  <Text style={styles.timelineTime}>
                    {new Date(historyEntry.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </Text>
                )}
                {historyEntry?.note && <Text style={styles.timelineNote}>{historyEntry.note}</Text>}
              </View>
            </View>
          );
        })}
      </View>
    );
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
        <Text style={styles.headerTitle}>Order #{order._id.slice(-6).toUpperCase()}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          {displayImage && <Image source={{ uri: displayImage }} style={styles.previewImage} />}
          <View style={styles.cardInfo}>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>{order.status}</Text>
              </View>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Material</Text>
              <Text style={styles.value}>{order.material}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Dimensions</Text>
              <Text style={styles.value}>{order.width}" x {order.height}"</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Estimated Price</Text>
              <Text style={styles.priceValue}>₹{order.priceQuote || 'Pending'}</Text>
            </View>
            {order.finalPrice && (
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Final Price</Text>
                <Text style={styles.priceValue}>₹{order.finalPrice}</Text>
              </View>
            )}
            {order.estimatedCompletionDate && (
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Est. Completion</Text>
                <Text style={styles.value}>{new Date(order.estimatedCompletionDate).toLocaleDateString()}</Text>
              </View>
            )}
          </View>
        </View>

        {order.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Notes</Text>
            <Text style={styles.notesText}>{order.notes}</Text>
          </View>
        )}

        {order.adminNotes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admin Notes</Text>
            <View style={styles.adminNoteBox}>
              <Icon name="info-circle" size={16} color={COLORS.primary} style={{marginRight: 8}} />
              <Text style={styles.adminNoteText}>{order.adminNotes}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tracking Timeline</Text>
          {renderTimeline(order.status, order.statusHistory)}
        </View>

      </ScrollView>
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
  previewImage: { width: '100%', height: 200, resizeMode: 'cover' },
  cardInfo: { padding: 20 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  label: { color: COLORS.secondary, ...FONTS.body },
  value: { color: COLORS.text, ...FONTS.body, fontWeight: 'bold' },
  priceValue: { color: COLORS.primary, ...FONTS.h3 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: SIZES.fontSm, fontWeight: 'bold' },
  section: { marginBottom: 25 },
  sectionTitle: { color: COLORS.text, ...FONTS.h3, marginBottom: 15 },
  notesText: { color: COLORS.text, ...FONTS.body, backgroundColor: COLORS.surface, padding: 15, borderRadius: SIZES.radiusSm },
  adminNoteBox: { flexDirection: 'row', backgroundColor: COLORS.primary + '10', padding: 15, borderRadius: SIZES.radiusSm, borderWidth: 1, borderColor: COLORS.primary + '30' },
  adminNoteText: { color: COLORS.text, flex: 1, ...FONTS.body },
  cancelledBox: { alignItems: 'center', padding: 30, backgroundColor: COLORS.surface, borderRadius: SIZES.radiusSm },
  cancelledText: { color: COLORS.error, ...FONTS.h3, marginTop: 10 },
  // Timeline
  timelineContainer: { paddingLeft: 10 },
  timelineStep: { flexDirection: 'row', marginBottom: 25, position: 'relative' },
  timelineDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.surfaceLight, zIndex: 2, marginTop: 4 },
  timelineDotCompleted: { backgroundColor: COLORS.primary },
  timelineDotActive: { backgroundColor: COLORS.primary, width: 20, height: 20, borderRadius: 10, borderWidth: 4, borderColor: COLORS.primary + '40', marginLeft: -3, marginTop: 1 },
  timelineLine: { position: 'absolute', left: 6, top: 18, bottom: -25, width: 2, backgroundColor: COLORS.surfaceLight, zIndex: 1 },
  timelineLineCompleted: { backgroundColor: COLORS.primary },
  timelineContent: { marginLeft: 20, flex: 1 },
  timelineText: { color: COLORS.secondary, ...FONTS.h3, fontSize: 16 },
  timelineTextActive: { color: COLORS.primary, fontWeight: 'bold' },
  timelineTime: { color: 'rgba(0,0,0,0.5)', fontSize: 12, marginTop: 4 },
  timelineNote: { color: COLORS.text, fontSize: 13, marginTop: 6, backgroundColor: COLORS.surface, padding: 8, borderRadius: 8 }
});

export default OrderDetailScreen;
