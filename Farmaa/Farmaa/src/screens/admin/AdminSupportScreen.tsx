import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../config/api';
import AdminTextInput from './AdminTextInput';

interface SupportChat {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  subject: string;
  messages: Array<{
    sender: string;
    message: string;
    timestamp: string;
  }>;
  status: string;
  createdAt: string;
}

const AdminSupportScreen = () => {
  const navigation = useNavigation();
  const [chats, setChats] = useState<SupportChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<SupportChat | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchChats();
  }, [statusFilter]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const response = await api.CLIENT.get(api.ENDPOINTS.ADMIN.SUPPORT, { params });
      setChats(response.data.chats || []);
    } catch (err: any) {
      console.error('Failed to fetch support chats:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to load support chats');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedChat || !messageText.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    try {
      setLoading(true);
      await api.CLIENT.post(
        api.ENDPOINTS.ADMIN.SUPPORT_MESSAGE.replace(':id', selectedChat._id),
        { message: messageText.trim() }
      );
      Alert.alert('Success', 'Message sent successfully!');
      setMessageText('');
      fetchChats();
      // Refresh selected chat
      const updatedChat = await api.CLIENT.get(api.ENDPOINTS.ADMIN.SUPPORT.replace('/support', `/support/${selectedChat._id}`));
      setSelectedChat(updatedChat.data.chat);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (chatId: string, newStatus: string) => {
    try {
      setLoading(true);
      await api.CLIENT.put(
        api.ENDPOINTS.ADMIN.SUPPORT_STATUS.replace(':id', chatId),
        { status: newStatus }
      );
      Alert.alert('Success', 'Status updated successfully!');
      fetchChats();
      if (selectedChat?._id === chatId) {
        setSelectedChat({ ...selectedChat, status: newStatus });
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const openChatModal = async (chat: SupportChat) => {
    try {
      setLoading(true);
      const response = await api.CLIENT.get(api.ENDPOINTS.ADMIN.SUPPORT.replace('/support', `/support/${chat._id}`));
      setSelectedChat(response.data.chat);
      setModalVisible(true);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to load chat details');
    } finally {
      setLoading(false);
    }
  };

  const renderChatItem = ({ item }: { item: SupportChat }) => (
    <TouchableOpacity
      style={styles.chatCard}
      onPress={() => openChatModal(item)}
    >
      <View style={styles.chatHeader}>
        <View>
          <Text style={styles.userName}>{item.user.name}</Text>
          <Text style={styles.userEmail}>{item.user.email}</Text>
        </View>
        <View style={[styles.statusBadge, getStatusBadgeStyle(item.status)]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.subject}>{item.subject}</Text>
      {item.messages && item.messages.length > 0 && (
        <Text style={styles.lastMessage} numberOfLines={2}>
          {item.messages[item.messages.length - 1].message}
        </Text>
      )}
      <Text style={styles.date}>
        {new Date(item.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </Text>
    </TouchableOpacity>
  );

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'open':
        return styles.openBadge;
      case 'in_progress':
        return styles.inProgressBadge;
      case 'resolved':
        return styles.resolvedBadge;
      case 'closed':
        return styles.closedBadge;
      default:
        return styles.openBadge;
    }
  };

  if (loading && chats.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Loading support chats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support Chats</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.filters}>
        <View style={styles.statusFilters}>
          {['all', 'open', 'in_progress', 'resolved', 'closed'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.statusFilter, statusFilter === status && styles.statusFilterActive]}
              onPress={() => setStatusFilter(status)}
            >
              <Text style={[styles.statusFilterText, statusFilter === status && styles.statusFilterTextActive]}>
                {status.replace('_', ' ').toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {chats.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No support chats found.</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={fetchChats}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                {selectedChat && (
                  <>
                    <Text style={styles.modalTitle}>{selectedChat.user.name}</Text>
                    <Text style={styles.modalSubtitle}>{selectedChat.subject}</Text>
                  </>
                )}
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedChat && (
              <>
                <ScrollView style={styles.messagesContainer}>
                  {selectedChat.messages?.map((msg, index) => (
                    <View
                      key={index}
                      style={[
                        styles.messageBubble,
                        msg.sender === 'admin' ? styles.adminMessage : styles.userMessage,
                      ]}
                    >
                      <Text style={styles.messageText}>{msg.message}</Text>
                      <Text style={styles.messageTime}>
                        {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.statusSelector}>
                  <Text style={styles.label}>Update Status:</Text>
                  <View style={styles.statusButtons}>
                    {['open', 'in_progress', 'resolved', 'closed'].map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.statusButton,
                          selectedChat.status === status && styles.statusButtonActive,
                        ]}
                        onPress={() => handleUpdateStatus(selectedChat._id, status)}
                      >
                        <Text
                          style={[
                            styles.statusButtonText,
                            selectedChat.status === status && styles.statusButtonTextActive,
                          ]}
                        >
                          {status.replace('_', ' ').toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <AdminTextInput
                    style={styles.messageInput}
                    placeholder="Type a message..."
                    value={messageText}
                    onChangeText={setMessageText}
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSendMessage}
                    disabled={loading || !messageText.trim()}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.sendButtonText}>Send</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    fontSize: 24,
    color: '#1E3A8A',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  filters: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statusFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusFilter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusFilterActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  statusFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  statusFilterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 15,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  chatCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  openBadge: {
    backgroundColor: '#FEF3C7',
  },
  inProgressBadge: {
    backgroundColor: '#DBEAFE',
  },
  resolvedBadge: {
    backgroundColor: '#D1FAE5',
  },
  closedBadge: {
    backgroundColor: '#E5E7EB',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  subject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalClose: {
    fontSize: 24,
    color: '#6B7280',
  },
  messagesContainer: {
    maxHeight: 400,
    marginBottom: 15,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: '80%',
  },
  adminMessage: {
    backgroundColor: '#1E3A8A',
    alignSelf: 'flex-end',
  },
  userMessage: {
    backgroundColor: '#F3F4F6',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 10,
    color: '#6B7280',
    alignSelf: 'flex-end',
  },
  statusSelector: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusButtonActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  statusButtonTextActive: {
    color: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-end',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 14,
    color: '#111827',
  },
  sendButton: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminSupportScreen;








