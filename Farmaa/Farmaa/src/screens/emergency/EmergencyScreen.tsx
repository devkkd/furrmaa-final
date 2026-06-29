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
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';

interface Pet {
  _id: string;
  name: string;
}

const EmergencyScreen = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [petId, setPetId] = useState('');
  const [emergencyType, setEmergencyType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.CLIENT.get(api.ENDPOINTS.USER_PETS)
      .then((res) => {
        const list = res.data?.pets || [];
        setPets(list);
        if (list[0]) setPetId(list[0]._id);
      })
      .catch(() => setPets([]));
  }, []);

  const emergencyTypes = [
    { id: 'medical', name: 'Medical Emergency', icon: '🏥' },
    { id: 'lost', name: 'Lost Pet', icon: '🔍' },
    { id: 'accident', name: 'Accident', icon: '🚨' },
    { id: 'other', name: 'Other', icon: '⚠️' },
  ];

  const submitEmergency = async () => {
    if (!emergencyType || !petId || !description.trim()) {
      Alert.alert('Error', 'Please select pet, type and describe the emergency');
      return;
    }

    try {
      setLoading(true);
      const emergencyData = {
        pet: petId,
        type: emergencyType,
        description: description.trim(),
        location: location.trim() ? { address: location.trim() } : undefined,
        status: 'active',
        priority: emergencyType === 'medical' ? 'high' : 'medium',
      };

      const response = await api.CLIENT.post(api.ENDPOINTS.EMERGENCY, emergencyData);
      
      if (response.data.success) {
        Alert.alert(
          'Success',
          'Emergency request submitted successfully! Help is on the way. Admin has been notified.',
          [{ text: 'OK' }]
        );
        // Reset form
        setEmergencyType('');
        setDescription('');
        setLocation('');
      }
    } catch (error: any) {
      console.error('Emergency submission error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to submit emergency request. Please try again or call the emergency number.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Emergency</Text>
        <Text style={styles.headerSubtitle}>We're here to help 24/7</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Emergency Type</Text>
        <View style={styles.emergencyTypes}>
          {emergencyTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.emergencyTypeCard,
                emergencyType === type.id && styles.emergencyTypeCardActive,
              ]}
              onPress={() => setEmergencyType(type.id)}
            >
              <Text style={styles.emergencyIcon}>{type.icon}</Text>
              <Text style={styles.emergencyTypeName}>{type.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Select Pet *</Text>
        {pets.length === 0 ? (
          <Text style={styles.hint}>Add a pet in My Pets first.</Text>
        ) : (
          <View style={styles.petRow}>
            {pets.map((p) => (
              <TouchableOpacity
                key={p._id}
                style={[styles.petChip, petId === p._id && styles.petChipActive]}
                onPress={() => setPetId(p._id)}
              >
                <Text style={[styles.petChipText, petId === p._id && styles.petChipTextActive]}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Describe the Emergency *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Please provide details..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={6}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Location (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your location..."
          value={location}
          onChangeText={setLocation}
        />
      </View>

      <TouchableOpacity
        style={[styles.emergencyButton, loading && styles.emergencyButtonDisabled]}
        onPress={submitEmergency}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.emergencyButtonText}>🚨 Request Emergency Help</Text>
        )}
      </TouchableOpacity>

      <View style={styles.helpSection}>
        <Text style={styles.helpTitle}>Need Immediate Help?</Text>
        <Text style={styles.helpNumber}>📞 Call: 1800-PET-HELP</Text>
      </View>
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
    backgroundColor: '#FF6B6B',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 15,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  emergencyTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emergencyTypeCard: {
    width: '48%',
    backgroundColor: '#F5F5F5',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  emergencyTypeCardActive: {
    backgroundColor: '#FF6B6B',
  },
  emergencyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emergencyTypeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  hint: { color: '#b45309', fontSize: 14 },
  petRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  petChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6' },
  petChipActive: { backgroundColor: '#1F2E46' },
  petChipText: { color: '#374151', fontWeight: '600' },
  petChipTextActive: { color: '#fff' },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
  },
  textArea: {
    height: 150,
    textAlignVertical: 'top',
  },
  emergencyButton: {
    backgroundColor: '#FF6B6B',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    margin: 20,
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  helpSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    margin: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  helpNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
});

export default EmergencyScreen;

