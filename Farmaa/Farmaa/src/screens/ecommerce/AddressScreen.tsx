import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import api from '../../config/api';
import leftArrow from '../../assets/images/arrow-left.png';

interface Address {
  _id: string;
  type: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  landmark?: string;
  isDefault: boolean;
}

const AddressScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const returnTo = (route.params as any)?.returnTo; // Checkout screen for address selection

  useFocusEffect(
    React.useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await api.CLIENT.get(api.ENDPOINTS.ADDRESSES);
      const fetchedAddresses = response.data?.addresses || [];
      setAddresses(fetchedAddresses);
      
      // Auto-select default address or first address
      if (fetchedAddresses.length > 0 && !selectedAddress) {
        const defaultAddr = fetchedAddresses.find((a: Address) => a.isDefault) || fetchedAddresses[0];
        setSelectedAddress(defaultAddr._id);
      }
    } catch (error: any) {
      console.error('Failed to fetch addresses:', error);
      if (error.response?.status !== 401) {
        Alert.alert('Error', 'Failed to load addresses');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address._id);
    // If this screen was opened from checkout, pass address back via params
    if (returnTo === 'checkout') {
      // Use navigation state or route params to pass back
      (navigation as any).navigate('Checkout', { selectedAddress: address });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Image source={leftArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Address</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.loadingText}>Loading addresses...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Address Cards */}
          <View style={styles.content}>
            {addresses.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No addresses found</Text>
                <Text style={styles.emptySubtext}>Add an address to continue</Text>
              </View>
            ) : (
              addresses.map((address) => (
                <TouchableOpacity
                  key={address._id}
                  style={[
                    styles.addressCard,
                    selectedAddress === address._id && styles.addressCardSelected,
                  ]}
                  onPress={() => handleSelectAddress(address)}
                >
                  <View style={styles.addressHeader}>
                    <View style={styles.addressInfo}>
                      <Text style={styles.addressType}>{address.type?.toUpperCase() || 'HOME'}</Text>
                      <Text style={styles.addressName}>{address.name}</Text>
                    </View>
                    {selectedAddress === address._id && (
                      <View style={styles.selectedBadge}>
                        <Text style={styles.selectedText}>✓</Text>
                      </View>
                    )}
                    {address.isDefault && !selectedAddress && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>DEFAULT</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addressPhone}>{address.phone}</Text>
                  <Text style={styles.addressText}>
                    {address.street}, {address.city}, {address.state} - {address.zipCode}
                  </Text>
                  {address.landmark && (
                    <Text style={styles.landmarkText}>Landmark: {address.landmark}</Text>
                  )}
                </TouchableOpacity>
              ))
            )}

            {/* Add Address Button */}
            <TouchableOpacity
              style={styles.addAddressButton}
              onPress={() => {
                (navigation as any).navigate('AddAddress', { returnTo: returnTo || 'address' });
              }}
            >
              <Text style={styles.addAddressIcon}>+</Text>
              <Text style={styles.addAddressText}>Add New Address</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Bottom Button */}
      {!loading && addresses.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => {
              if (selectedAddress) {
                const selected = addresses.find(a => a._id === selectedAddress);
                if (selected) {
                  if (returnTo === 'checkout') {
                    // Pass selected address back to checkout
                    (navigation as any).navigate('Checkout', { selectedAddress: selected });
                  } else {
                    (navigation as any).navigate('Checkout');
                  }
                }
              } else {
                Alert.alert('Error', 'Please select an address');
              }
            }}
          >
            <Text style={styles.selectButtonText}>
              {returnTo === 'checkout' ? 'Use Selected Address' : 'Proceed to Checkout'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 5,
  },
  backIcon: {
    width: 30,
    height: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  placeholder: {
    width: 34,
  },
  content: {
    padding: 15,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  addressInfo: {
    flex: 1,
  },
  addressType: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  defaultBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 10,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  landmarkText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  addAddressIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    marginRight: 8,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  addressCardSelected: {
    borderColor: '#D9DCE2',
    backgroundColor: '#F9FBFF',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  addressPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  addAddressButton: {
    backgroundColor: '#95E562',
    paddingVertical: 15,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 10,
  },
  addAddressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  addAddressButton: {
    backgroundColor: '#10B981',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  selectButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    alignSelf: 'center',
  },
});

export default AddressScreen;

