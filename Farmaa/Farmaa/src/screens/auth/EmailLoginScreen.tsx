import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

// @ts-ignore
import logoImage from '../../assets/images/Logo.png';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EmailLoginScreen = () => {
  const navigation = useNavigation();
  const { sendEmailOTP } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmed)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const devOtp = await sendEmailOTP(trimmed);
      (navigation as any).navigate('OTPVerification', {
        email: trimmed,
        devOtp: __DEV__ ? devOtp : undefined,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerLogo}>
              <Image source={logoImage} style={styles.logoImage} resizeMode="contain" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerAppName}>FURRMAA</Text>
              <Text style={styles.headerTagline}>WE CARE FOR YOUR PET WITH LOVE</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.mainTitle}>Login with Email</Text>
          <Text style={styles.description}>
            We will send a 6-digit verification code to your email address.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.nextButton, loading && styles.disabledButton]}
            onPress={handleNext}
            disabled={loading}
          >
            <Text style={styles.nextButtonText}>
              {loading ? 'Sending OTP...' : 'Send OTP →'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.altButton}
            onPress={() => (navigation as any).replace('MobileLogin')}
          >
            <Text style={styles.altButtonText}>Use phone number instead</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1, padding: 20 },
  backButton: { marginTop: 10, marginBottom: 10, width: 40 },
  backArrow: { fontSize: 24, color: '#1F2937', fontWeight: '600' },
  header: { marginBottom: 24 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerLogo: { marginRight: 12 },
  logoImage: { width: 50, height: 50, borderRadius: 25 },
  headerText: { flex: 1 },
  headerAppName: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 2 },
  headerTagline: { fontSize: 10, color: '#6B7280', fontWeight: '300' },
  content: { flex: 1 },
  mainTitle: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 },
  description: { fontSize: 16, color: '#6B7280', lineHeight: 24, marginBottom: 28 },
  inputContainer: { marginBottom: 28 },
  label: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 18,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
  },
  nextButton: {
    backgroundColor: '#1F2937',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 50,
    alignSelf: 'center',
  },
  nextButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  disabledButton: { opacity: 0.6 },
  altButton: { alignItems: 'center', paddingVertical: 12 },
  altButtonText: { fontSize: 15, color: '#1E3A8A', fontWeight: '600' },
});

export default EmailLoginScreen;
