import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { API_URL, AuthContext } from '../../context/AuthContext';
import { COLORS, SIZES, SHADOWS, FONTS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/FontAwesome5';

const AdminSupportChatsScreen = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userToken } = useContext(AuthContext);

  const fetchChats = async () => {
    try {
      const res = await axios.get(`${API_URL}/chat/admin/list`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      setChats(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  const renderChatItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.chatCard}
      onPress={() => navigation.navigate('AdminChatRoom', { user: item.user })}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.user.name.charAt(0)}</Text>
      </View>
      <View style={styles.chatInfo}>
        <Text style={styles.userName}>{item.user.name}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage.text}</Text>
      </View>
      <View style={styles.chatMeta}>
        <Text style={styles.timeText}>{new Date(item.lastMessage.createdAt).toLocaleDateString()}</Text>
        {item.unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginRight: 15}}>
          <Icon name="arrow-left" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support Chats</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.user._id}
          renderItem={renderChatItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  headerTitle: { color: COLORS.text, ...FONTS.h2 },
  listContainer: { padding: 15 },
  chatCard: { flexDirection: 'row', backgroundColor: COLORS.surface, padding: 15, borderRadius: SIZES.radiusSm, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.surfaceLight, ...SHADOWS.dark },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.glassBackground, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: COLORS.primary, ...FONTS.h2 },
  chatInfo: { flex: 1 },
  userName: { color: COLORS.text, ...FONTS.body, fontWeight: 'bold' },
  lastMessage: { color: COLORS.secondary, ...FONTS.bodySm, marginTop: 4 },
  chatMeta: { alignItems: 'flex-end' },
  timeText: { color: COLORS.secondary, fontSize: 10, marginBottom: 5 },
  badge: { backgroundColor: COLORS.error, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' }
});

export default AdminSupportChatsScreen;
