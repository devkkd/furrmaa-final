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
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../../config/api';

const AddAddressScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const addressId = (route.params as any)?.addressId;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'home',
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    landmark: '',
    isDefault: false,
  });

  React.useEffect(() => {
    if (addressId) {
      fetchAddress();
    }
  }, [addressId]);

  const fetchAddress = async () => {
    try {
      setLoading(true);
      const response = await api.CLIENT.get(`${api.ENDPOINTS.ADDRESSES}/${addressId}`);
      const address = response.data.address;
      setFormData({
        type: address.type || 'home',
        name: address.name || '',
        phone: address.phone || '',
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        zipCode: address.zipCode || '',
        landmark: address.landmark || '',
        isDefault: address.isDefault || false,
      });
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load address');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.phone.trim() || !formData.street.trim() || 
        !formData.city.trim() || !formData.state.trim() || !formData.zipCode.trim()) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    // Validate phone number
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    // Validate zip code
    if (!/^[0-9]{6}$/.test(formData.zipCode.trim())) {
      Alert.alert('Error', 'Please enter a valid 6-digit ZIP code');
      return;
    }

    setLoading(true);
    try {
      let response;
      if (addressId) {
        response = await api.CLIENT.put(`${api.ENDPOINTS.ADDRESSES}/${addressId}`, formData);
        Alert.alert('Success', 'Address updated successfully', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        response = await api.CLIENT.post(api.ENDPOINTS.ADDRESSES, formData);
        const newAddress = response.data?.address;
        
        // If opened from checkout, pass address back
        const returnTo = (route.params as any)?.returnTo;
        if (returnTo === 'checkout' && newAddress) {
          Alert.alert('Success', 'Address added successfully', [
            {
              text: 'OK',
              onPress: () => {
                (navigation as any).navigate('Checkout', { selectedAddress: newAddress });
              },
            },
          ]);
        } else {
          Alert.alert('Success', 'Address added successfully', [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]);
        }
      }
    } catch (error: any) {
      console.error('Address save error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save address. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addressTypes = [
    { label: 'Home', value: 'home' },
    { label: 'Work', value: 'work' },
    { label: 'Other', value: 'other' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {addressId ? 'Edit Address' : 'Add Address'}
        </Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.form}>
        <View style={styles.section}>
          <Text style={styles.label}>Address Type</Text>
          <View style={styles.typeContainer}>
            {addressTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeButton,
                  formData.type === type.value && styles.typeButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, type: type.value })}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    formData.type === type.value && styles.typeButtonTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Enter name"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Phone *</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="Enter phone number"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Street Address *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.street}
            onChangeText={(text) => setFormData({ ...formData, street: text })}
            placeholder="Enter street address"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={2}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>City *</Text>
          <TextInput
            style={styles.input}
            value={formData.city}
            onChangeText={(text) => setFormData({ ...formData, city: text })}
            placeholder="Enter city"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>State *</Text>
          <TextInput
            style={styles.input}
            value={formData.state}
            onChangeText={(text) => setFormData({ ...formData, state: text })}
            placeholder="Enter state"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>ZIP Code *</Text>
          <TextInput
            style={styles.input}
            value={formData.zipCode}
            onChangeText={(text) => setFormData({ ...formData, zipCode: text })}
            placeholder="Enter ZIP code"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Landmark (Optional)</Text>
          <TextInput
            style={styles.input}
            value={formData.landmark}
            onChangeText={(text) => setFormData({ ...formData, landmark: text })}
            placeholder="Enter landmark"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
          >
            <Text style={styles.checkboxLabel}>Set as default address</Text>
            <View
              style={[
                styles.checkbox,
                formData.isDefault && styles.checkboxChecked,
              ]}
            >
              {formData.isDefault && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              {addressId ? 'Update Address' : 'Add Address'}
            </Text>
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
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#1F2937',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddAddressScreen;




