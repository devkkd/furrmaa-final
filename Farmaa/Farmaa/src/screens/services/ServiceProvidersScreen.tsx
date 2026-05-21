import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../../config/api';

interface Provider {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  address?: any;
}

const ServiceProvidersScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { serviceType } = route.params as any;
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await api.CLIENT.get(api.ENDPOINTS.SERVICE_PROVIDERS);
      setProviders(response.data?.providers || []);
    } catch (error: any) {
      console.error('Failed to fetch providers:', error);
      setProviders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProviders();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{serviceType} Providers</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Loading providers...</Text>
        </View>
      ) : providers.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No service providers available</Text>
          <Text style={styles.emptySubtext}>Check back later!</Text>
        </View>
      ) : (
        <FlatList
          data={providers}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.providerCard}
              onPress={() => navigation.navigate('Booking' as never, { provider: item, serviceType } as never)}
            >
              <View style={styles.providerInfo}>
                <View style={styles.avatar}>
                  {item.profileImage ? (
                    <Text style={styles.avatarText}>📷</Text>
                  ) : (
                    <Text style={styles.avatarText}>👤</Text>
                  )}
                </View>
                <View style={styles.providerDetails}>
                  <Text style={styles.providerName}>{item.name}</Text>
                  {item.phone && (
                    <Text style={styles.providerPhone}>{item.phone}</Text>
                  )}
                  {item.email && (
                    <Text style={styles.providerEmail}>{item.email}</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 15,
    margin: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  providerInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 30,
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  providerRating: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  providerExperience: {
    fontSize: 12,
    color: '#999',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  priceLabel: {
    fontSize: 12,
    color: '#999',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
  providerPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  providerEmail: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});

export default ServiceProvidersScreen;

