import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';

const HOURLY_OPTIONS = [1, 2, 3, 4, 6, 8, 12];

function isHostelService(serviceType?: string) {
  return /hotel|hostel|boarding/i.test(String(serviceType || ''));
}

function mapBookingServiceType(serviceType?: string) {
  const raw = String(serviceType || 'grooming').toLowerCase();
  if (/hotel|hostel|boarding/.test(raw)) return 'boarding';
  if (/vet|clinic|hospital/.test(raw)) return 'veterinary';
  if (/train/.test(raw)) return 'training';
  if (/groom/.test(raw)) return 'grooming';
  if (/walk/.test(raw)) return 'walking';
  if (/sit/.test(raw)) return 'sitting';
  return 'other';
}

const BookingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { provider, serviceType, pet: routePet } = (route.params as any) || {};
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPet, setSelectedPet] = useState(routePet?._id || '');
  const [hours, setHours] = useState(2);

  const hostelMode = isHostelService(serviceType);
  const hourlyRate = Number(provider?.price) > 0 ? Number(provider.price) : 199;
  const totalAmount = hostelMode ? hourlyRate * hours : hourlyRate;

  useEffect(() => {
    if (routePet?._id) {
      setSelectedPet(routePet._id);
      return;
    }
    api.CLIENT.get(api.ENDPOINTS.USER_PETS)
      .then((res) => {
        const list = res.data?.pets || [];
        setPets(list);
        if (list[0]) setSelectedPet(list[0]._id);
      })
      .catch(() => setPets([]));
  }, [routePet]);

  const confirmBooking = async () => {
    if (!date || !time) {
      Alert.alert('Error', 'Please select date and time');
      return;
    }

    if (!provider?._id) {
      Alert.alert('Error', 'Service provider information not found');
      return;
    }

    if (!selectedPet) {
      Alert.alert('Error', 'Please select a pet for this booking');
      return;
    }

    try {
      setLoading(true);
      const bookingData = {
        serviceProvider: provider._id,
        serviceType: mapBookingServiceType(serviceType),
        date: new Date(`${date}T${time}`),
        time,
        duration: hostelMode ? hours : 1,
        notes: notes.trim() || undefined,
        pet: selectedPet,
        status: 'pending',
        amount: totalAmount,
      };

      const response = await api.CLIENT.post(api.ENDPOINTS.BOOKINGS, bookingData);

      if (response.data.success) {
        Alert.alert(
          'Success',
          hostelMode
            ? `Hourly hostel booking confirmed for ${hours} hour(s). Admin will review soon.`
            : 'Your booking has been confirmed! Admin will review and confirm soon.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('MyBookings' as never, {} as never),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to create booking. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Book {serviceType || 'Service'}</Text>
        {hostelMode ? (
          <Text style={styles.headerSub}>Hourly booking (not full day)</Text>
        ) : null}
      </View>

      <View style={styles.providerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{hostelMode ? '🏨' : '👤'}</Text>
        </View>
        <Text style={styles.providerName}>{provider?.name}</Text>
        <Text style={styles.providerRating}>⭐ {provider?.rating || 0}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Select Pet *</Text>
        {!routePet && pets.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {pets.map((p) => (
              <TouchableOpacity
                key={p._id}
                style={[
                  styles.input,
                  {
                    width: 'auto',
                    paddingHorizontal: 14,
                    backgroundColor: selectedPet === p._id ? '#1F2E46' : '#fff',
                  },
                ]}
                onPress={() => setSelectedPet(p._id)}
              >
                <Text style={{ color: selectedPet === p._id ? '#fff' : '#111' }}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : routePet ? (
          <Text style={styles.providerRating}>{routePet.name}</Text>
        ) : (
          <Text style={styles.providerRating}>Add a pet in My Pets first</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Select Date</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{hostelMode ? 'Start Time' : 'Select Time'}</Text>
        <TextInput
          style={styles.input}
          placeholder="HH:MM"
          value={time}
          onChangeText={setTime}
        />
      </View>

      {hostelMode ? (
        <View style={styles.section}>
          <Text style={styles.label}>Duration (hours) *</Text>
          <Text style={styles.hint}>Book by the hour — not a full-day stay</Text>
          <View style={styles.hoursRow}>
            {HOURLY_OPTIONS.map((h) => (
              <TouchableOpacity
                key={h}
                style={[styles.hourChip, hours === h && styles.hourChipActive]}
                onPress={() => setHours(h)}
              >
                <Text style={[styles.hourChipText, hours === h && styles.hourChipTextActive]}>
                  {h}h
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.label}>Additional Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Any special requirements..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Service</Text>
          <Text style={styles.summaryValue}>{serviceType}</Text>
        </View>
        {hostelMode ? (
          <>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Rate</Text>
              <Text style={styles.summaryValue}>₹{hourlyRate}/hr</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Hours</Text>
              <Text style={styles.summaryValue}>{hours}</Text>
            </View>
          </>
        ) : null}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryValue}>₹{totalAmount}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
        onPress={confirmBooking}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.confirmButtonText}>
            {hostelMode ? `Confirm ${hours}h Booking` : 'Confirm Booking'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSub: {
    marginTop: 6,
    fontSize: 13,
    color: '#1F2E46',
    fontWeight: '600',
  },
  providerCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    margin: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 40,
  },
  providerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  providerRating: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    marginTop: -4,
  },
  hoursRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hourChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  hourChipActive: {
    backgroundColor: '#1F2E46',
    borderColor: '#1F2E46',
  },
  hourChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  hourChipTextActive: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  summary: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    margin: 15,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  confirmButton: {
    backgroundColor: '#1F2E46',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    margin: 20,
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BookingScreen;
