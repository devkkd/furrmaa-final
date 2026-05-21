import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';

const AddPetScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'dog',
    breed: '',
    age: '',
    weight: '',
    gender: '',
    color: '',
    description: '',
  });

  const savePet = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Pet name is required');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please login to add a pet');
      return;
    }

    try {
      setLoading(true);
      
      const payload: any = {
        name: formData.name.trim(),
        type: formData.type,
        owner: user.id, // Current logged-in user
      };

      if (formData.breed.trim()) payload.breed = formData.breed.trim();
      if (formData.age.trim()) payload.age = parseInt(formData.age) || 0;
      if (formData.weight.trim()) payload.weight = parseFloat(formData.weight) || 0;
      if (formData.gender) payload.gender = formData.gender;
      if (formData.color.trim()) payload.color = formData.color.trim();
      if (formData.description.trim()) payload.description = formData.description.trim();

      // Create pet via pets endpoint
      const response = await api.CLIENT.post(api.ENDPOINTS.USER_PETS || '/api/pets', payload);
      
      if (response.data?.pet) {
        Alert.alert('Success', 'Pet added successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error: any) {
      console.error('Failed to save pet:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add pet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Pet</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Pet Name</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Enter pet name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Type</Text>
          <View style={styles.typeButtons}>
            <TouchableOpacity
              style={[styles.typeButton, formData.type === 'dog' && styles.typeButtonActive]}
              onPress={() => setFormData({ ...formData, type: 'dog' })}
            >
              <Text style={styles.typeButtonText}>🐕 Dog</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, formData.type === 'cat' && styles.typeButtonActive]}
              onPress={() => setFormData({ ...formData, type: 'cat' })}
            >
              <Text style={styles.typeButtonText}>🐱 Cat</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Breed</Text>
          <TextInput
            style={styles.input}
            value={formData.breed}
            onChangeText={(text) => setFormData({ ...formData, breed: text })}
            placeholder="Enter breed"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Age (years)</Text>
          <TextInput
            style={styles.input}
            value={formData.age}
            onChangeText={(text) => setFormData({ ...formData, age: text })}
            keyboardType="numeric"
            placeholder="Enter age"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            value={formData.weight}
            onChangeText={(text) => setFormData({ ...formData, weight: text })}
            keyboardType="numeric"
            placeholder="Enter weight"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.typeButtons}>
            <TouchableOpacity
              style={[styles.typeButton, formData.gender === 'male' && styles.typeButtonActive]}
              onPress={() => setFormData({ ...formData, gender: 'male' })}
            >
              <Text style={[styles.typeButtonText, formData.gender === 'male' && styles.typeButtonTextActive]}>♂️ Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, formData.gender === 'female' && styles.typeButtonActive]}
              onPress={() => setFormData({ ...formData, gender: 'female' })}
            >
              <Text style={[styles.typeButtonText, formData.gender === 'female' && styles.typeButtonTextActive]}>♀️ Female</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Color</Text>
          <TextInput
            style={styles.input}
            value={formData.color}
            onChangeText={(text) => setFormData({ ...formData, color: text })}
            placeholder="Enter color (optional)"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Add description (optional)"
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={savePet}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Pet</Text>
          )}
        </TouchableOpacity>
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 15,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  typeButtonText: {
    fontSize: 16,
    color: '#333',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#FF6B6B',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddPetScreen;

