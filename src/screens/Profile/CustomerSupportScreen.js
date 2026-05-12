import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Image } from 'react-native';
import axios from 'axios';
import { API_URL, AuthContext } from '../../context/AuthContext';
import { COLORS, SIZES, SHADOWS, FONTS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/FontAwesome5';

const CustomerSupportScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const { userToken, userInfo } = useContext(AuthContext);
  const flatListRef = useRef();

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_URL}/chat/my`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      setMessages(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Simple polling for real-time feel
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    
    const tempMsg = { _id: Date.now().toString(), text: inputText, sender: { _id: userInfo._id, name: userInfo.name }, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);
    setInputText('');

    try {
      await axios.post(`${API_URL}/chat/send`, { text: tempMsg.text }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      fetchMessages();
    } catch (error) {
      console.error(error);
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender._id === userInfo._id;
    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.adminMessage]}>
        {!isMe && <Text style={styles.senderName}>Support Team</Text>}
        <Text style={[styles.messageText, isMe ? styles.myMessageText : {}]}>{item.text}</Text>
        <Text style={styles.timeText}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginRight: 15}}>
          <Icon name="arrow-left" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer Support</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachBtn}>
            <Icon name="paperclip" size={20} color={COLORS.secondary} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor={COLORS.secondary}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Icon name="paper-plane" size={18} color="#000" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.surfaceLight },
  headerTitle: { color: COLORS.text, ...FONTS.h2 },
  chatContainer: { padding: 15, paddingBottom: 20 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 20, marginBottom: 10 },
  myMessage: { alignSelf: 'flex-end', backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  adminMessage: { alignSelf: 'flex-start', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceLight, borderBottomLeftRadius: 4 },
  messageText: { color: COLORS.text, ...FONTS.body },
  myMessageText: { color: '#000', fontWeight: '500' },
  senderName: { color: COLORS.primary, fontSize: 10, fontWeight: 'bold', marginBottom: 2 },
  timeText: { fontSize: 10, color: 'rgba(0,0,0,0.5)', alignSelf: 'flex-end', marginTop: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.surfaceLight },
  attachBtn: { marginRight: 10, padding: 5 },
  input: { flex: 1, backgroundColor: COLORS.background, color: COLORS.text, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, ...FONTS.body },
  sendBtn: { backgroundColor: COLORS.primary, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 10 }
});

export default CustomerSupportScreen;
