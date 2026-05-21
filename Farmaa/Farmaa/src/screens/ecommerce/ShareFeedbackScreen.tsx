import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import leftArrow from '../../assets/images/arrow-left.png';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';

type FeedbackType = 'Bug Report' | 'Feature Request' | 'App Experience';

const typeToApi: Record<FeedbackType, string> = {
  'Bug Report': 'bug',
  'Feature Request': 'feature',
  'App Experience': 'experience',
};

const ShareFeedbackScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [feedback, setFeedback] = useState('');
  const [type, setType] = useState<FeedbackType | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!isFormValid || !type) return;
    setLoading(true);
    try {
      await api.CLIENT.post(api.ENDPOINTS.FEEDBACK, {
        name: name.trim(),
        email: email.trim(),
        subject: type,
        message: feedback.trim(),
        type: typeToApi[type],
      });
      setShowSuccess(true);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };
  const isFormValid = useMemo(() => {
    return (
      name.trim().length > 0 &&
      email.trim().length > 0 &&
      feedback.trim().length > 0 &&
      type !== null
    );
  }, [name, email, feedback, type]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
        <Image source={leftArrow} style={styles.back} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Your Feedback</Text>
      </View>

      <Text style={styles.title}>Help us improve your experience</Text>
      <Text style={styles.subtitle}>
        We value your input. Share your thoughts, report an issue, or suggest
        new features to help us make Furrmaa better for you and your pets.
      </Text>

      {/* Name */}
      <Text style={styles.label}>Your Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Your Name"
        value={name}
        onChangeText={setName}
      />

      {/* Email */}
      <Text style={styles.label}>Email Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Your Name"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Feedback Type */}
      <Text style={styles.label}>Feedback Type</Text>
      <View style={styles.typeRow}>
        {(['Bug Report', 'Feature Request', 'App Experience'] as FeedbackType[]).map(
          item => (
            <TouchableOpacity
              key={item}
              style={[
                styles.typeChip,
                type === item && styles.typeChipActive,
              ]}
              onPress={() => setType(item)}
            >
              <Text
                style={[
                  styles.typeText,
                  type === item && styles.typeTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ),
        )}
      </View>

      {/* Feedback */}
      <Text style={styles.label}>Your Feedback</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Tell us what happened or how we can improve..."
        value={feedback}
        onChangeText={setFeedback}
        multiline
        textAlignVertical="top"
      />

      {/* Submit */}
      <TouchableOpacity
        style={[
          styles.submitBtn,
          (!isFormValid || loading) && styles.submitBtnDisabled,
        ]}
        disabled={!isFormValid || loading}
        onPress={handleSubmit}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitText}>Submit Feedback →</Text>
        )}
      </TouchableOpacity>
      <Modal
        visible={showSuccess}
        transparent
        // animationType="fade"
        >
        <View style={styles.overlay}>
            <View style={styles.successModal}>
            {/* Header */}
            <View style={styles.successHeader}>
                <View style={styles.successIcon}>
                <Text style={styles.check}>✓</Text>
                </View>
                <TouchableOpacity onPress={() => setShowSuccess(false)}>
                <Text style={styles.close}>✕</Text>
                </TouchableOpacity>
            </View>

            {/* Message */}
            <Text style={styles.successText}>
                Thank you for your feedback. Our team will review it and continue
                improving the Furrmaa experience.
            </Text>
            </View>
        </View>
        </Modal>
    </ScrollView>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 50,
  },
  back: {
    height: 30,
    width: 30,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 15,
    marginTop: 12,
  },
  input: {
    height: 54,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  typeChip: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: '#E5E7EB',
    borderRadius: 18,
  },
  typeChipActive: {
    backgroundColor: '#1F2E46',
  },
  typeText: {
    fontSize: 12,
    color: '#374151',
  },
  typeTextActive: {
    color: '#FFFFFF',
  },
  textArea: {
    height: 140,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  submitBtn: {
    marginTop: 30,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1F2E46',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },

  successModal: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  successHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  successIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#95E562',
    alignItems: 'center',
    justifyContent: 'center',
  },

  check: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },

  close: {
    fontSize: 18,
    color: '#000000',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  successText: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 18,
  },
});

export default ShareFeedbackScreen;