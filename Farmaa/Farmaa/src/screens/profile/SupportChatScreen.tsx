import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../config/api';

interface Message {
  sender: string;
  message: string;
  createdAt: string;
}

interface Chat {
  _id: string;
  subject: string;
  status: string;
  messages: Message[];
  createdAt: string;
}

const SupportChatScreen = () => {
  const navigation = useNavigation();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await api.CLIENT.get(api.ENDPOINTS.SUPPORT);
      setChats(response.data.chats || []);
    } catch (error: any) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = async () => {
    Alert.prompt(
      'New Support Chat',
      'Enter subject for your support request:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async (subject) => {
            if (!subject || !subject.trim()) {
              Alert.alert('Error', 'Subject is required');
              return;
            }

            try {
              setSending(true);
              const response = await api.CLIENT.post(api.ENDPOINTS.SUPPORT, {
                subject: subject.trim(),
                message: 'Initial message',
              });
              Alert.prompt(
                'Initial Message',
                'Enter your message:',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Send',
                    onPress: async (msg) => {
                      if (msg && msg.trim()) {
                        await sendMessage(response.data.chat._id, msg);
                      }
                      fetchChats();
                    },
                  },
                ]
              );
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to create chat');
            } finally {
              setSending(false);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const sendMessage = async (chatId: string, msg?: string) => {
    const messageText = msg || message.trim();
    if (!messageText) return;

    try {
      setSending(true);
      await api.CLIENT.post(`${api.ENDPOINTS.SUPPORT}/${chatId}/message`, {
        message: messageText,
      });
      setMessage('');
      if (selectedChat) {
        fetchChats();
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading && chats.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Loading chats...</Text>
      </View>
    );
  }

  if (selectedChat) {
    const chat = chats.find((c) => c._id === selectedChat._id) || selectedChat;
    const messages = chat.messages || [];

    const groupedMessages: { [key: string]: Message[] } = {};
    messages.forEach((msg) => {
      const dateKey = new Date(msg.createdAt).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      if (!groupedMessages[dateKey]) {
        groupedMessages[dateKey] = [];
      }
      groupedMessages[dateKey].push(msg);
    });

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedChat(null)}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat With Us</Text>
          <View style={{ width: 30 }} />
        </View>

        {messages.length === 0 && (
          <View style={styles.emptyChatHint}>
            <Text style={styles.emptyChatText}>No messages yet. Say hello!</Text>
          </View>
        )}
        <FlatList
          data={Object.keys(groupedMessages)}
          keyExtractor={(dateKey) => dateKey}
          renderItem={({ item: dateKey }) => (
            <View>
              <View style={styles.dateSeparator}>
                <Text style={styles.dateText}>{dateKey}</Text>
              </View>
              {groupedMessages[dateKey].map((msg, index) => (
                <View
                  key={`${dateKey}-${index}`}
                  style={[
                    styles.messageBubble,
                    msg.sender === 'user' ? styles.userMessage : styles.adminMessage,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      msg.sender === 'user' ? styles.userMessageText : styles.adminMessageText,
                    ]}
                  >
                    {msg.message}
                  </Text>
                  <Text
                    style={[
                      styles.messageTime,
                      msg.sender === 'user' ? styles.userMessageTime : styles.adminMessageTime,
                    ]}
                  >
                    {new Date(msg.createdAt)
                      .toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })
                      .toLowerCase()}
                  </Text>
                </View>
              ))}
            </View>
          )}
          contentContainerStyle={styles.messagesContainer}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Write your message"
            placeholderTextColor="#9CA3AF"
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, sending && styles.sendButtonDisabled]}
            onPress={() => sendMessage(chat._id)}
            disabled={sending || !message.trim()}
          >
            <Text style={styles.sendButtonIcon}>✈</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (chats.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat With Us</Text>
          <TouchableOpacity onPress={createNewChat}>
            <Text style={styles.newChatButton}>+ New</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>No support chats yet</Text>
          <Text style={styles.emptySubtext}>Start a conversation with our team</Text>
          <TouchableOpacity style={styles.createChatButton} onPress={createNewChat}>
            <Text style={styles.createChatButtonText}>Start Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat With Us</Text>
        <TouchableOpacity onPress={createNewChat}>
          <Text style={styles.newChatButton}>+ New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={chats}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.chatCard} onPress={() => setSelectedChat(item)}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatSubject}>{item.subject}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.chatPreview}>
              {item.messages[item.messages.length - 1]?.message || 'No messages'}
            </Text>
            <Text style={styles.chatDate}>
              {new Date(item.createdAt).toLocaleDateString('en-IN')}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );

  function getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      open: '#F59E0B',
      in_progress: '#3B82F6',
      resolved: '#10B981',
      closed: '#6B7280',
    };
    return colors[status] || '#6B7280';
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 10, fontSize: 14, color: '#6B7280' },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#6B7280', marginBottom: 20, textAlign: 'center' },
  createChatButton: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createChatButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  emptyChatHint: { padding: 24, alignItems: 'center' },
  emptyChatText: { fontSize: 14, color: '#9CA3AF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: { fontSize: 24, color: '#1F2937', fontWeight: 'bold' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  newChatButton: { fontSize: 16, fontWeight: '600', color: '#1E3A8A' },
  listContent: { padding: 15 },
  chatCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chatSubject: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1F2937' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { color: '#FFFFFF', fontSize: 10, fontWeight: '600' },
  chatPreview: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  chatDate: { fontSize: 12, color: '#9CA3AF' },
  messagesContainer: { padding: 15, paddingBottom: 80 },
  dateSeparator: { alignItems: 'center', marginVertical: 16 },
  dateText: { fontSize: 14, color: '#9CA3AF' },
  messageBubble: { maxWidth: '75%', padding: 12, borderRadius: 12, marginBottom: 12 },
  userMessage: { alignSelf: 'flex-end', backgroundColor: '#1E3A8A' },
  adminMessage: { alignSelf: 'flex-start', backgroundColor: '#F3F4F6' },
  messageText: { fontSize: 14, marginBottom: 4 },
  userMessageText: { color: '#FFFFFF' },
  adminMessageText: { color: '#1F2937' },
  messageTime: { fontSize: 12 },
  userMessageTime: { color: '#FFFFFF', alignSelf: 'flex-end', opacity: 0.8 },
  adminMessageTime: { color: '#6B7280', alignSelf: 'flex-start' },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    marginRight: 10,
    fontSize: 14,
    color: '#1F2937',
  },
  sendButton: {
    backgroundColor: '#1E3A8A',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: { opacity: 0.6 },
  sendButtonIcon: { color: '#FFFFFF', fontSize: 18 },
});

export default SupportChatScreen;
