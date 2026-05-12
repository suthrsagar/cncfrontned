import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator, TextInput, ScrollView, Alert, Image } from 'react-native';
import axios from 'axios';
import { API_URL, AuthContext } from '../../context/AuthContext';
import { COLORS, SIZES, SHADOWS, FONTS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { launchImageLibrary } from 'react-native-image-picker';

const OrdersScreen = ({ route, navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { userToken } = useContext(AuthContext);

  // New Order State
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [material, setMaterial] = useState('');
  const [notes, setNotes] = useState('');
  const [customImage, setCustomImage] = useState(null);
  const [referenceDesign, setReferenceDesign] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/orders/myorders`, {
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
    fetchOrders();
  }, []);

  useEffect(() => {
    if (route.params?.referenceDesign) {
      setIsCreating(true);
      setReferenceDesign(route.params.referenceDesign);
    }
  }, [route.params?.referenceDesign]);

  const selectImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (!response.didCancel && response.assets && response.assets.length > 0) {
        setCustomImage(response.assets[0]);
      }
    });
  };

  const submitOrder = async () => {
    if (!width || !height || !material || (!customImage && !referenceDesign)) {
      Alert.alert('Error', 'Please fill all required fields and select an image.');
      return;
    }
    setSubmitting(true);
    try {
      if (customImage) {
        const formData = new FormData();
        formData.append('width', width);
        formData.append('height', height);
        formData.append('material', material);
        formData.append('notes', notes);
        
        if (referenceDesign) {
          formData.append('referenceDesign', referenceDesign._id);
        }
        
        formData.append('customImage', {
          uri: customImage.uri,
          type: customImage.type,
          name: customImage.fileName || 'custom.jpg',
        });

        await axios.post(`${API_URL}/orders`, formData, {
          headers: { 
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        const jsonData = {
          width,
          height,
          material,
          notes,
          referenceDesign: referenceDesign ? referenceDesign._id : undefined
        };
        await axios.post(`${API_URL}/orders`, jsonData, {
          headers: { 
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          }
        });
      }
      
      Alert.alert('Success', 'Order created successfully!');
      setIsCreating(false);
      // Reset form
      setWidth(''); setHeight(''); setMaterial(''); setNotes(''); setCustomImage(null); setReferenceDesign(null);
      fetchOrders();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const [expandedOrder, setExpandedOrder] = useState(null);

  const STATUS_STEPS = ['Pending', 'Accepted', 'In Progress', 'Cutting', 'Polishing', 'Ready', 'Delivered'];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return COLORS.primary;
      case 'In Progress': return '#3b82f6';
      case 'Completed': return COLORS.success;
      case 'Delivered': return COLORS.success;
      case 'Cancelled': return COLORS.error;
      default: return COLORS.secondary;
    }
  };

  const renderTimeline = (currentStatus) => {
    const currentIndex = STATUS_STEPS.indexOf(currentStatus);
    
    return (
      <View style={styles.timelineContainer}>
        {STATUS_STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isActive = index === currentIndex;
          return (
            <View key={step} style={styles.timelineStep}>
              <View style={[styles.timelineDot, isCompleted && styles.timelineDotCompleted, isActive && styles.timelineDotActive]} />
              {index < STATUS_STEPS.length - 1 && (
                <View style={[styles.timelineLine, isCompleted && index < currentIndex && styles.timelineLineCompleted]} />
              )}
              <Text style={[styles.timelineText, isActive && styles.timelineTextActive]}>{step}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderOrderItem = ({ item, index }) => {
    return (
      <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderId}>Order #{item._id.slice(-6).toUpperCase()}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
            </View>
          </View>
          <View style={styles.orderDetails}>
            <View style={styles.detailRow}>
              <Icon name="calendar-alt" size={14} color={COLORS.secondary} style={styles.icon} />
              <Text style={styles.detailText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="layer-group" size={14} color={COLORS.secondary} style={styles.icon} />
              <Text style={styles.detailText}>{item.material} ({item.width}x{item.height})</Text>
            </View>
          </View>
          
          <View style={styles.orderFooter}>
            <Text style={styles.price}>₹{item.priceQuote || 'Pending Quote'}</Text>
            <TouchableOpacity style={styles.trackBtn} onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}>
              <Text style={styles.trackBtnText}>Track Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  if (isCreating) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { setIsCreating(false); setReferenceDesign(null); setCustomImage(null); }} style={styles.backBtn}>
            <Icon name="arrow-left" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Custom Order</Text>
        </View>
        <ScrollView style={styles.formContainer}>
          <TouchableOpacity style={styles.imageUpload} onPress={selectImage}>
            {customImage ? (
              <Image source={{ uri: customImage.uri }} style={styles.previewImage} />
            ) : referenceDesign ? (
              <Image source={{ uri: referenceDesign.imageUrl || (referenceDesign.imageUrls && referenceDesign.imageUrls[0]) }} style={styles.previewImage} />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Icon name="cloud-upload-alt" size={40} color={COLORS.primary} />
                <Text style={styles.uploadText}>{referenceDesign ? 'Tap to change image' : 'Upload Reference Image'}</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Width (inches)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={width} onChangeText={setWidth} placeholderTextColor={COLORS.secondary} placeholder="e.g. 24" />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Height (inches)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={height} onChangeText={setHeight} placeholderTextColor={COLORS.secondary} placeholder="e.g. 48" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Material</Text>
            <TextInput style={styles.input} value={material} onChangeText={setMaterial} placeholderTextColor={COLORS.secondary} placeholder="e.g. MDF, Teak Wood, Acrylic" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Additional Notes (Optional)</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              multiline 
              numberOfLines={4} 
              value={notes} 
              onChangeText={setNotes} 
              placeholderTextColor={COLORS.secondary} 
              placeholder="Any specific design instructions..." 
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={submitOrder} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#000" /> : <Text style={styles.submitBtnText}>Submit Order</Text>}
          </TouchableOpacity>
          <View style={{height: 100}} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <TouchableOpacity style={styles.createBtn} onPress={() => setIsCreating(true)}>
          <Icon name="plus" size={16} color="#000" />
          <Text style={styles.createBtnText}>New Order</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="clipboard-list" size={50} color={COLORS.surfaceLight} />
              <Text style={styles.emptyText}>No orders yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { color: COLORS.text, fontSize: SIZES.fontXl, fontWeight: 'bold' },
  createBtn: { flexDirection: 'row', backgroundColor: COLORS.primary, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, alignItems: 'center' },
  createBtnText: { color: '#000', fontWeight: 'bold', marginLeft: 8 },
  backBtn: { marginRight: 15 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  orderCard: { backgroundColor: COLORS.surface, borderRadius: SIZES.radius, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: COLORS.surfaceLight, ...SHADOWS.dark },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  orderId: { color: COLORS.text, fontSize: SIZES.fontLg, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: SIZES.fontSm, fontWeight: 'bold' },
  orderDetails: { marginBottom: 15 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  icon: { width: 20 },
  detailText: { color: COLORS.secondary, fontSize: SIZES.fontMd },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.surfaceLight, paddingTop: 15 },
  price: { color: COLORS.primary, fontSize: SIZES.fontLg, fontWeight: 'bold' },
  trackBtn: { backgroundColor: COLORS.surfaceLight, paddingHorizontal: 15, paddingVertical: 8, borderRadius: SIZES.radiusSm },
  trackBtnText: { color: COLORS.text, fontWeight: '600' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { color: COLORS.secondary, marginTop: 10, fontSize: SIZES.fontMd },
  // Form Styles
  formContainer: { paddingHorizontal: 20 },
  imageUpload: { height: 200, backgroundColor: COLORS.surface, borderRadius: SIZES.radius, justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: COLORS.surfaceLight, borderStyle: 'dashed', overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
  uploadPlaceholder: { alignItems: 'center' },
  uploadText: { color: COLORS.secondary, marginTop: 10 },
  row: { flexDirection: 'row' },
  inputGroup: { marginBottom: 20 },
  label: { color: COLORS.secondary, marginBottom: 8, fontSize: SIZES.fontSm },
  input: { backgroundColor: COLORS.surface, color: COLORS.text, padding: 15, borderRadius: SIZES.radiusSm, borderWidth: 1, borderColor: COLORS.surfaceLight },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: SIZES.radius, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#000', fontSize: SIZES.fontLg, fontWeight: 'bold' },
  // Timeline Styles
  timelineContainer: { marginTop: 10, marginBottom: 20, paddingHorizontal: 10, borderTopWidth: 1, borderTopColor: COLORS.surfaceLight, paddingTop: 15 },
  timelineStep: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, position: 'relative' },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.surfaceLight, zIndex: 2 },
  timelineDotCompleted: { backgroundColor: COLORS.primary },
  timelineDotActive: { backgroundColor: COLORS.primary, width: 16, height: 16, borderRadius: 8, borderWidth: 3, borderColor: COLORS.primary + '50', marginLeft: -2 },
  timelineLine: { position: 'absolute', left: 5, top: 12, bottom: -15, width: 2, backgroundColor: COLORS.surfaceLight, zIndex: 1 },
  timelineLineCompleted: { backgroundColor: COLORS.primary },
  timelineText: { marginLeft: 15, color: COLORS.secondary, ...FONTS.bodySm },
  timelineTextActive: { color: COLORS.primary, fontWeight: 'bold' }
});

export default OrdersScreen;
