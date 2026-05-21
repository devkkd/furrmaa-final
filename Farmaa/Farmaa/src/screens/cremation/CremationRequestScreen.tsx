import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Modal,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import leftArrow from '../../assets/images/arrow-left.png';

const NAVY = '#1F2E46';

const CremationRequestScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { center } = (route.params as any) || {};

  const [fullName, setFullName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.phone || '');
  const [address, setAddress] = useState(
    user?.address ? `${user.address.street || ''}, ${user.address.city || ''}, ${user.address.state || ''}`.trim().replace(/^,\s*|,\s*$/g, '') : ''
  );

  const [pickupLocation, setPickupLocation] = useState('');
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState<'dog' | 'cat' | 'other'>('dog');
  const [petBreed, setPetBreed] = useState('');
  const [ageYears, setAgeYears] = useState('');
  const [sex, setSex] = useState<'male' | 'female' | 'unknown'>('unknown');
  const [notes, setNotes] = useState('');

  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load user profile data if available
  useEffect(() => {
    if (user) {
      if (!fullName && user.name) setFullName(user.name);
      if (!mobile && user.phone) setMobile(user.phone);
      if (!address && user.address) {
        const addr = `${user.address.street || ''}, ${user.address.city || ''}, ${user.address.state || ''}`.trim().replace(/^,\s*|,\s*$/g, '');
        setAddress(addr);
      }
    }
  }, [user]);

  const canSubmit = useMemo(() => {
    return (
      fullName.trim() &&
      mobile.trim() &&
      address.trim() &&
      // pickupLocation.trim() &&
      petName.trim()
    );
  }, [fullName, mobile, address, pickupLocation, petName]);

  const submit = async () => {
    if (!canSubmit || !user) {
      Alert.alert('Error', 'Please fill all required fields and login to submit request');
      return;
    }

    try {
      setLoading(true);

      const requestData = {
        center: center?._id || center?.id,
        ownerInformation: {
          fullName: fullName.trim(),
          mobileNumber: mobile.trim(),
          address: address.trim(),
        },
        petInformation: {
          petName: petName.trim(),
          petType,
          petBreed: petBreed.trim() || undefined,
          ageYears: ageYears.trim() || undefined,
          sex,
        },
        pickupLocation: pickupLocation.trim(),
        notes: notes.trim() || undefined,
      };

      const response = await api.CLIENT.post(`${api.ENDPOINTS.CREMATION}/requests`, requestData);

      if (response.data?.request) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigation.goBack();
        }, 2000);
      }
    } catch (error: any) {
      console.error('Failed to submit cremation request:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={leftArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Request for Cremation</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Owner Information */}
        <Text style={styles.sectionTitle}>Owner Information</Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Full Name"
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>Mobile Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Phone Number"
          keyboardType="phone-pad"
          value={mobile}
          onChangeText={setMobile}
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Address"
          value={address}
          onChangeText={setAddress}
        />

        {/* Pet Information */}
        <Text style={styles.sectionTitle}>Pet Information</Text>

        <Text style={styles.label}>Pet Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Pet Name"
          value={petName}
          onChangeText={setPetName}
        />

        <Text style={styles.sectionTitle}>Pet Species</Text>
        <View style={styles.pillRow}>
          {(['dog', 'cat', 'other'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.pill, petType === t && styles.pillActive]}
              onPress={() => setPetType(t)}
            >
              <Text style={[styles.pillText, petType === t && styles.pillTextActive]}>
                {t === 'dog' ? 'Dog' : t === 'cat' ? 'Cat' : 'Others'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput style={styles.input} placeholder="Pet Breed (Optional)" value={petBreed} onChangeText={setPetBreed} />
        <TextInput style={styles.input} placeholder="Age (Years)" value={ageYears} onChangeText={setAgeYears} keyboardType="numeric" />

        <Text style={styles.sectionTitle}>Sex</Text>
        <View style={styles.pillRow}>
          {(['male', 'female', 'unknown'] as const).map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.pill, sex === s && styles.pillActive]}
              onPress={() => setSex(s)}
            >
              <Text style={[styles.pillText, sex === s && styles.pillTextActive]}>
                {s === 'male' ? 'Male' : s === 'female' ? 'Female' : 'Unknown'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Additional Notes (Optional)"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.submitBtn, (!canSubmit || loading) && styles.submitBtnDisabled]}
          onPress={submit}
          disabled={!canSubmit || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>Submit Request for Cremation →</Text>
          )}
        </TouchableOpacity>
      </ScrollView>


      <Modal transparent animationType="fade" visible={showSuccess} onRequestClose={() => setShowSuccess(false)}>
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <View style={styles.tickCircle}>
              <Text style={styles.tick}>✓</Text>
            </View>
            <Text style={styles.successTitle}>Thank you</Text>
            <Text style={styles.successDesc}>
              Your request has been submitted successfully.{'\n'}
              Our team will review the details and contact you shortly to guide you through the next steps.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
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
    // justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  backIcon: { width: 30, height: 30, color: '#111827',marginRight: 14, resizeMode: 'contain' },
  title: { fontSize: 18, fontWeight: '500', color: '#111827' },
  headerSpacer: { width: 24 },
  content: {
  padding: 16,
  paddingBottom: 50,
},

sectionTitle: {
  fontSize: 14,
  fontWeight: '700',
  color: '#111827',
  marginTop: 18,
  marginBottom: 12,
},

label: {
  fontSize: 12,
  fontWeight: '500',
  color: '#374151',
  marginBottom: 6,
},

input: {
  backgroundColor: '#F9FAFB',
  borderWidth: 1,
  borderColor: '#E5E7EB',
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 14,
  fontSize: 14,
  color: '#1F2E46',
  marginBottom: 14,
},
textArea: {
  minHeight: 100,
  textAlignVertical: 'top',
},

pillRow: {
  flexDirection: 'row',
  gap: 10,
  marginBottom: 14,
},

pill: {
  paddingHorizontal: 24,
  paddingVertical: 10,
  borderRadius: 20,
  backgroundColor: '#E5E7EB',
},

pillActive: {
  backgroundColor: NAVY,
},

pillText: {
  fontSize: 13,
  fontWeight: '600',
  color: '#374151',
},

pillTextActive: {
  color: '#FFFFFF',
},

submitBtn: {
  marginTop: 20,
  backgroundColor: '#1F2E46',
  paddingVertical: 16,
  borderRadius: 999,
  alignItems: 'center',
},

submitBtnDisabled: {
  backgroundColor: '#9CA3AF',
},

submitText: {
  fontSize: 14,
  fontWeight: '700',
  color: '#FFFFFF',
},

  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  successCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
  },
  tickCircle: {
    width: 35,
    height: 35,
    borderRadius: 26,
    backgroundColor: '#95E562',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  tick: { color: '#000000', fontSize: 24, fontWeight: '900' },
  successTitle: { fontSize: 16, fontWeight: '900', color: '#111827', marginBottom: 10 },
  successDesc: { fontSize: 13, color: '#000000',  lineHeight: 18,paddingBottom: 20},
});

export default CremationRequestScreen;


