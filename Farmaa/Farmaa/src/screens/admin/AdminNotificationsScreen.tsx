import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import api from '../../config/api';
import AdminTextInput from './AdminTextInput';

interface AdminNotification {
  _id: string;
  title: string;
  message: string;
  type?: string;
  createdAt: string;
  user?: { name?: string; email?: string };
}

const AdminNotificationsScreen = () => {
  const navigation = useNavigation();
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sendModal, setSendModal] = useState(false);
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const load = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await api.CLIENT.get(api.ENDPOINTS.ADMIN.NOTIFICATIONS);
      setItems(res.data?.notifications || []);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to load notifications');
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const resetForm = () => {
    setUserId('');
    setTitle('');
    setMessage('');
  };

  const handleSendToUser = async () => {
    if (!userId.trim() || !title.trim() || !message.trim()) {
      Alert.alert('Error', 'User ID, title, and message are required');
      return;
    }
    try {
      setSending(true);
      await api.CLIENT.post(api.ENDPOINTS.ADMIN.NOTIFICATIONS_SEND, {
        userId: userId.trim(),
        title: title.trim(),
        message: message.trim(),
        type: 'system',
      });
      Alert.alert('Success', 'Notification sent');
      setSendModal(false);
      resetForm();
      load(true);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const handleBroadcast = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert('Error', 'Title and message are required');
      return;
    }
    Alert.alert('Broadcast', 'Send this notification to all active users?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Send',
        onPress: async () => {
          try {
            setSending(true);
            const res = await api.CLIENT.post(api.ENDPOINTS.ADMIN.NOTIFICATIONS_BROADCAST, {
              title: title.trim(),
              message: message.trim(),
              type: 'system',
            });
            Alert.alert('Success', res.data?.message || 'Broadcast sent');
            setBroadcastModal(false);
            resetForm();
            load(true);
          } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Broadcast failed');
          } finally {
            setSending(false);
          }
        },
      },
    ]);
  };

  const renderFormModal = (
    visible: boolean,
    onClose: () => void,
    onSubmit: () => void,
    showUserId: boolean
  ) => (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{showUserId ? 'Send to user' : 'Broadcast'}</Text>
          {showUserId && (
            <AdminTextInput
              style={styles.input}
              placeholder="User ID"
              value={userId}
              onChangeText={setUserId}
              autoCapitalize="none"
            />
          )}
          <AdminTextInput
            style={styles.input}
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
          />
          <AdminTextInput
            style={[styles.input, styles.messageInput]}
            placeholder="Message"
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={sending}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={onSubmit} disabled={sending}>
              {sending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitBtnText}>Send</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => {
            resetForm();
            setSendModal(true);
          }}
        >
          <Text style={styles.actionBtnText}>Send to user</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnAlt]}
          onPress={() => {
            resetForm();
            setBroadcastModal(true);
          }}
        >
          <Text style={styles.actionBtnTextAlt}>Broadcast</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1E3A8A" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
          ListEmptyComponent={
            <Text style={styles.empty}>No notifications yet</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMessage}>{item.message}</Text>
              {item.user?.name ? (
                <Text style={styles.cardMeta}>
                  {item.user.name}
                  {item.user.email ? ` · ${item.user.email}` : ''}
                </Text>
              ) : null}
              <Text style={styles.cardDate}>
                {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
              </Text>
            </View>
          )}
        />
      )}

      {renderFormModal(sendModal, () => setSendModal(false), handleSendToUser, true)}
      {renderFormModal(broadcastModal, () => setBroadcastModal(false), handleBroadcast, false)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
  },
  back: { fontSize: 24, color: '#1E3A8A' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  actionRow: { flexDirection: 'row', padding: 12, gap: 10 },
  actionBtn: {
    flex: 1,
    backgroundColor: '#1E3A8A',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnAlt: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#1E3A8A' },
  actionBtnText: { color: '#FFF', fontWeight: '600' },
  actionBtnTextAlt: { color: '#1E3A8A', fontWeight: '600' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', color: '#888', marginTop: 40 },
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 14,
    borderRadius: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cardMessage: { fontSize: 14, color: '#555', marginTop: 6 },
  cardMeta: { fontSize: 12, color: '#1E3A8A', marginTop: 8 },
  cardDate: { fontSize: 11, color: '#999', marginTop: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  messageInput: { minHeight: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#EEE',
  },
  cancelBtnText: { color: '#333' },
  submitBtn: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#1E3A8A',
  },
  submitBtnText: { color: '#FFF', fontWeight: '600' },
});

export default AdminNotificationsScreen;
