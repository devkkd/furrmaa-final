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

interface Feedback {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  subject: string;
  message: string;
  rating?: number;
  status: string;
  adminResponse?: string;
  createdAt: string;
}

const AdminFeedbackScreen = () => {
  const navigation = useNavigation();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchFeedbacks();
  }, [statusFilter]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const response = await api.CLIENT.get(api.ENDPOINTS.ADMIN.FEEDBACK, { params });
      setFeedbacks(response.data.feedbacks || []);
    } catch (err: any) {
      console.error('Failed to fetch feedbacks:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to load feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!selectedFeedback || !responseText.trim()) {
      Alert.alert('Error', 'Please enter a response');
      return;
    }

    try {
      setLoading(true);
      await api.CLIENT.put(`${api.ENDPOINTS.ADMIN.FEEDBACK_RESPOND.replace(':id', selectedFeedback._id)}`, {
        adminResponse: responseText.trim(),
        status: 'responded',
      });
      Alert.alert('Success', 'Response sent successfully!');
      setModalVisible(false);
      setResponseText('');
      setSelectedFeedback(null);
      fetchFeedbacks();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to send response');
    } finally {
      setLoading(false);
    }
  };

  const openResponseModal = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setResponseText(feedback.adminResponse || '');
    setModalVisible(true);
  };

  const renderFeedbackItem = ({ item }: { item: Feedback }) => (
    <View style={styles.feedbackCard}>
      <View style={styles.feedbackHeader}>
        <View>
          <Text style={styles.userName}>{item.user.name}</Text>
          <Text style={styles.userEmail}>{item.user.email}</Text>
        </View>
        <View style={[styles.statusBadge, item.status === 'responded' ? styles.respondedBadge : styles.pendingBadge]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      {item.rating && (
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>Rating: {'⭐'.repeat(item.rating)}</Text>
        </View>
      )}
      <Text style={styles.subject}>{item.subject}</Text>
      <Text style={styles.message}>{item.message}</Text>
      {item.adminResponse && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseLabel}>Admin Response:</Text>
          <Text style={styles.responseText}>{item.adminResponse}</Text>
        </View>
      )}
      <Text style={styles.date}>
        {new Date(item.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </Text>
      {!item.adminResponse && (
        <TouchableOpacity
          style={styles.respondButton}
          onPress={() => openResponseModal(item)}
        >
          <Text style={styles.respondButtonText}>Respond</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && feedbacks.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Loading feedbacks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Feedback</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.filters}>
        <View style={styles.statusFilters}>
          {['all', 'pending', 'responded'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.statusFilter, statusFilter === status && styles.statusFilterActive]}
              onPress={() => setStatusFilter(status)}
            >
              <Text style={[styles.statusFilterText, statusFilter === status && styles.statusFilterTextActive]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {feedbacks.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No feedbacks found.</Text>
        </View>
      ) : (
        <FlatList
          data={feedbacks}
          renderItem={renderFeedbackItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={fetchFeedbacks}
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
              <Text style={styles.modalTitle}>Respond to Feedback</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {selectedFeedback && (
              <>
                <Text style={styles.modalUser}>{selectedFeedback.user.name}</Text>
                <Text style={styles.modalSubject}>{selectedFeedback.subject}</Text>
                <Text style={styles.modalMessage}>{selectedFeedback.message}</Text>
                <AdminTextInput
                  style={styles.responseInput}
                  placeholder="Enter your response..."
                  value={responseText}
                  onChangeText={setResponseText}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelModalButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelModalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.submitModalButton}
                    onPress={handleRespond}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.submitModalButtonText}>Send Response</Text>
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
    gap: 10,
  },
  statusFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusFilterActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  statusFilterText: {
    fontSize: 14,
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
  feedbackCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  feedbackHeader: {
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
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  respondedBadge: {
    backgroundColor: '#D1FAE5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  ratingContainer: {
    marginBottom: 10,
  },
  ratingText: {
    fontSize: 14,
    color: '#F59E0B',
  },
  subject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 10,
  },
  responseContainer: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  responseLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  responseText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 10,
  },
  respondButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  respondButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalClose: {
    fontSize: 24,
    color: '#6B7280',
  },
  modalUser: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  modalSubject: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 20,
    lineHeight: 20,
  },
  responseInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
    fontSize: 14,
    color: '#111827',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelModalButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelModalButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },
  submitModalButton: {
    flex: 1,
    backgroundColor: '#1E3A8A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminFeedbackScreen;








