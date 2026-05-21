import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';

type ChatMsg = {
  id: string;
  text: string;
  isMe: boolean;
  timestamp?: Date;
};

const NAVY = '#1F2E46';

const HopeChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { name, postId, chatId } = (route.params as any) || {};
  const flatListRef = useRef<FlatList>(null);

  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(chatId || null);

  const quickChip = useMemo(() => 'Hi! I saw your post about your pet.', []);

  useEffect(() => {
    if (chatId) {
      fetchChat();
    } else if (postId && user) {
      startChat();
    }
  }, [chatId, postId]);

  const startChat = async () => {
    try {
      setLoading(true);
      const response = await api.CLIENT.post(`${api.ENDPOINTS.HOPE}/chats/${postId}/start`);
      if (response.data?.chat) {
        setCurrentChatId(response.data.chat._id);
        setMsgs(response.data.chat.messages?.map((msg: any) => ({
          id: msg._id || Date.now().toString(),
          text: msg.content,
          isMe: msg.sender._id === user?.id,
          timestamp: new Date(msg.timestamp),
        })) || []);
      }
    } catch (error: any) {
      console.error('Failed to start chat:', error);
      // Fallback to local messages
    } finally {
      setLoading(false);
    }
  };

  const fetchChat = async () => {
    if (!currentChatId) return;
    
    try {
      setLoading(true);
      const response = await api.CLIENT.get(`${api.ENDPOINTS.HOPE}/chats/${currentChatId}`);
      if (response.data?.chat) {
        setMsgs(response.data.chat.messages?.map((msg: any) => ({
          id: msg._id || Date.now().toString(),
          text: msg.content,
          isMe: msg.sender._id === user?.id,
          timestamp: new Date(msg.timestamp),
        })) || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const send = async () => {
    const t = input.trim();
    if (!t || sending || !user) return;

    const userMsg: ChatMsg = {
      id: String(Date.now()),
      text: t,
      isMe: true,
      timestamp: new Date(),
    };

    setMsgs((p) => [...p, userMsg]);
    setInput('');
    setSending(true);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      if (currentChatId) {
        const response = await api.CLIENT.post(`${api.ENDPOINTS.HOPE}/chats/${currentChatId}/message`, {
          content: t,
        });
        
        if (response.data?.message) {
          // Update message with server response
          setMsgs((prev) => prev.map(msg => 
            msg.id === userMsg.id 
              ? { ...userMsg, id: response.data.message._id }
              : msg
          ));
        }
      } else {
        // If no chat ID, start chat first
        await startChat();
        if (currentChatId) {
          await api.CLIENT.post(`${api.ENDPOINTS.HOPE}/chats/${currentChatId}/message`, {
            content: t,
          });
        }
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      // Remove failed message
      setMsgs((prev) => prev.filter(msg => msg.id !== userMsg.id));
    } finally {
      setSending(false);
    }
  };

  const onChip = () => {
    if (quickChip) {
      setInput(quickChip);
      // Auto send quick chip
      setTimeout(() => send(), 100);
    }
  };

  const renderItem = ({ item }: { item: ChatMsg }) => (
    <View>
    <View style={[styles.bubble, item.isMe ? styles.bubbleMe : styles.bubbleOther]}>
      <Text style={[styles.bubbleText, item.isMe ? styles.bubbleTextMe : styles.bubbleTextOther]}>
        {item.text}
      </Text>
    </View>
    <Text style={{alignSelf: item.isMe ? 'flex-end' : 'flex-start',marginTop:5}}>10:01 AM</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
           <Image source={leftArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <Image source={ownerIcon} style={{ width: 36, height: 36, borderRadius: 30 }} />
        <Text style={styles.title} numberOfLines={1}>
          {name || 'Hope Chat'}
        </Text>

      </View>

      <View style={styles.body}>
        {loading && msgs.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={NAVY} />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={msgs}
            keyExtractor={(i) => i.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {/* <View style={styles.centerChipWrap}>
          <TouchableOpacity style={styles.centerChip} onPress={onChip}>
            <Text style={styles.centerChipText}>{quickChip}</Text>
          </TouchableOpacity>
        </View> */}
      </View>

      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.attachBtn}>
          <Image source={attachIcon} style={styles.attachIcon} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message"
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]} onPress={send}>
          <Image source={sendIcon} style={styles.sendIcon} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  backIcon: { width: 30, height: 30, marginRight: 10 },
  title: { fontSize: 18, fontWeight: '700', color: '#111827', flex: 1, marginLeft: 10 },
  headerRight: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  headerIconBtn: { padding: 6 },
  headerIcon: { fontSize: 18, color: '#111827' },
  body: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 100 },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 10,
  },
  bubbleMe: { alignSelf: 'flex-end',  backgroundColor: '#D9DCE2',borderRadius: 15,paddingVertical:15,},
  bubbleOther: { alignSelf: 'flex-start',  },
  bubbleText: { fontSize: 14, lineHeight: 18 },
  bubbleTextMe: { color: '#000000', fontWeight: '600' },
  bubbleTextOther: { color: '#000000', fontWeight: '500' },
  centerChipWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '45%',
    alignItems: 'center',
  },
  time: {
    fontSize: 10,
    color: '#000000',
    // marginTop: 4,
    alignSelf: 'flex-end',
  },
  centerChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  centerChipText: { fontSize: 12, fontWeight: '800', color: '#111827', letterSpacing: 0.6 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    gap: 10,
    marginBottom: 10,
  },
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachIcon: { width: 24, height: 24, },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendIcon: { width: 20, height: 20, },
});

export default HopeChatScreen;


