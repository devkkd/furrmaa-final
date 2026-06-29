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

  const normalizedServiceType = String(serviceType || 'grooming').toLowerCase();

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
        serviceType: normalizedServiceType,
        date: new Date(`${date}T${time}`),
        time,
        notes: notes.trim() || undefined,
        pet: selectedPet,
        status: 'pending',
        amount: provider.price || 0,
      };

      const response = await api.CLIENT.post(api.ENDPOINTS.BOOKINGS, bookingData);
      
      if (response.data.success) {
        Alert.alert(
          'Success',
          'Your booking has been confirmed! Admin will review and confirm soon.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('MyBookings' as never, {} as never),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Booking error:', error);
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
        <Text style={styles.headerTitle}>Book {serviceType}</Text>
      </View>

      <View style={styles.providerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.providerName}>{provider?.name}</Text>
        <Text style={styles.providerRating}>⭐ {provider?.rating}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Select Pet *</Text>
        {!routePet && pets.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {pets.map((p) => (
              <TouchableOpacity
                key={p._id}
                style={[styles.input, { width: 'auto', paddingHorizontal: 14, backgroundColor: selectedPet === p._id ? '#1F2E46' : '#fff' }]}
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
        <Text style={styles.label}>Select Time</Text>
        <TextInput
          style={styles.input}
          placeholder="HH:MM"
          value={time}
          onChangeText={setTime}
        />
      </View>

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
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Price</Text>
          <Text style={styles.summaryValue}>₹{provider?.price}</Text>
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
          <Text style={styles.confirmButtonText}>Confirm Booking</Text>
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
    backgroundColor: '#FF6B6B',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    margin: 20,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BookingScreen;

