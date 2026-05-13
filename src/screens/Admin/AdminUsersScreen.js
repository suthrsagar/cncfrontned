import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../api/config';
import { COLORS, SIZES, SHADOWS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useAlert } from '../../context/AlertContext';

const AdminUsersScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userToken } = useContext(AuthContext);
  const { showAlert } = useAlert();

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users/all`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleAdmin = async (userId) => {
    try {
      await axios.put(`${API_URL}/users/${userId}/admin`, {}, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      fetchUsers();
      showAlert({ title: 'Success', message: 'User role updated', type: 'success' });
    } catch (error) {
      console.error(error);
      showAlert({ title: 'Error', message: 'Failed to update role', type: 'error' });
    }
  };

  const handleToggleBan = async (userId) => {
    try {
      await axios.put(`${API_URL}/users/${userId}/block`, {}, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      fetchUsers();
      showAlert({ title: 'Success', message: 'User ban status updated', type: 'success' });
    } catch (error) {
      console.error(error);
      showAlert({ title: 'Error', message: 'Failed to update ban status', type: 'error' });
    }
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.iconContainer}>
        <Icon name="user" size={24} color={item.role === 'blocked' ? COLORS.error : COLORS.primary} />
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name} {item.role === 'admin' ? '(Admin)' : item.role === 'blocked' ? '(Banned)' : ''}</Text>
        <Text style={styles.userDetail}>{item.email}</Text>
        <Text style={styles.userDetail}>{item.phone}</Text>
      </View>
      {item.email !== 'sutharsagar710@gmail.com' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleToggleAdmin(item._id)}>
            <Icon name="user-shield" size={16} color={item.role === 'admin' ? COLORS.primary : COLORS.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleToggleBan(item._id)}>
            <Icon name="ban" size={16} color={item.role === 'blocked' ? COLORS.error : COLORS.secondary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Users</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={renderUserItem}
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
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: 15, borderRadius: SIZES.radius, marginBottom: 15, borderWidth: 1, borderColor: COLORS.surfaceLight, ...SHADOWS.dark },
  iconContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.glassBackground, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  userInfo: { flex: 1 },
  userName: { color: COLORS.text, fontSize: SIZES.fontLg, fontWeight: 'bold', marginBottom: 2 },
  userDetail: { color: COLORS.secondary, fontSize: SIZES.fontSm },
  actions: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { padding: 10, marginLeft: 5, backgroundColor: COLORS.glassBackground, borderRadius: 8 }
});

export default AdminUsersScreen;
