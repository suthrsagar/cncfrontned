import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Image, ScrollView } from 'react-native';
import axios from 'axios';
import { API_URL, AuthContext } from '../../context/AuthContext';
import { COLORS, SIZES, SHADOWS, FONTS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { launchImageLibrary } from 'react-native-image-picker';

const AdminAddPostScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { userToken } = useContext(AuthContext);

  const selectImages = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8, selectionLimit: 5 }, (response) => {
      if (!response.didCancel && response.assets && response.assets.length > 0) {
        setImages([...images, ...response.assets]);
      }
    });
  };

  const handleUpload = async () => {
    if (!title || !category || images.length === 0) {
      Alert.alert('Error', 'Please fill all fields and select at least one image.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      
      images.forEach((img, index) => {
        formData.append('images', {
          uri: img.uri,
          type: img.type,
          name: img.fileName || `design-${index}.jpg`,
        });
      });

      await axios.post(`${API_URL}/designs`, formData, {
        headers: { 
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      Alert.alert('Success', 'Design posted successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Could not upload design.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Design</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
          {images.map((img, idx) => (
            <Image key={idx} source={{ uri: img.uri }} style={styles.previewImage} />
          ))}
          <TouchableOpacity style={styles.imageUploadBtn} onPress={selectImages}>
            <Icon name="plus" size={30} color={COLORS.primary} />
            <Text style={styles.uploadText}>Add Image</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Design Title</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholderTextColor={COLORS.secondary} placeholder="e.g. Royal Door Design" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholderTextColor={COLORS.secondary} placeholder="e.g. Door Designs, Wall Art" />
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleUpload} disabled={loading}>
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.submitBtnText}>Post Design</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  backBtn: { marginRight: 15 },
  headerTitle: { color: COLORS.text, ...FONTS.h2 },
  content: { padding: 20 },
  imageScroll: { marginBottom: 25 },
  previewImage: { width: 200, height: 250, borderRadius: SIZES.radiusSm, marginRight: 15, borderWidth: 1, borderColor: COLORS.surfaceLight },
  imageUploadBtn: { width: 200, height: 250, backgroundColor: COLORS.surface, borderRadius: SIZES.radiusSm, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.primary, borderStyle: 'dashed' },
  uploadText: { color: COLORS.primary, marginTop: 10, ...FONTS.bodySm, fontWeight: 'bold' },
  inputGroup: { marginBottom: 20 },
  label: { color: COLORS.secondary, marginBottom: 8, ...FONTS.body, fontWeight: 'bold' },
  input: { backgroundColor: COLORS.surface, color: COLORS.text, padding: 15, borderRadius: SIZES.radiusSm, borderWidth: 1, borderColor: COLORS.surfaceLight, ...FONTS.body },
  submitBtn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: SIZES.radius, alignItems: 'center', marginTop: 10, ...SHADOWS.dark },
  submitBtnText: { color: '#000', ...FONTS.h3 }
});

export default AdminAddPostScreen;
