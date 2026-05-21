import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../config/api';

interface ServiceTile {
  id: number;
  name: string;
  icon: string;
  color: string;
  description: string;
  type: string;
}

const BASE_SERVICES: ServiceTile[] = [
  { id: 1, name: 'Grooming', icon: '✂️', color: '#FF6B6B', description: 'Professional pet grooming', type: 'grooming' },
  { id: 2, name: 'Training', icon: '🎓', color: '#4ECDC4', description: 'Expert pet training', type: 'training' },
  { id: 3, name: 'Walking', icon: '🚶', color: '#45B7D1', description: 'Daily dog walking', type: 'walking' },
  { id: 4, name: 'Sitting', icon: '🏠', color: '#96CEB4', description: 'Pet sitting services', type: 'sitting' },
  { id: 5, name: 'Boarding', icon: '🏨', color: '#FFE66D', description: 'Pet boarding facilities', type: 'boarding' },
  { id: 6, name: 'Veterinary', icon: '🏥', color: '#FF6B6B', description: 'Vet appointments', type: 'veterinary' },
];

function countProvidersForType(providers: any[], type: string): number {
  return providers.filter((p) => {
    const types: string[] = p.serviceTypes || p.serviceType ? [p.serviceType] : [];
    const list = Array.isArray(p.serviceTypes) ? p.serviceTypes : types;
    return list.some(
      (t) => String(t).toLowerCase() === type.toLowerCase() || String(t).toLowerCase().includes(type)
    );
  }).length;
}

const ServicesScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [providerCounts, setProviderCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.CLIENT.get(api.ENDPOINTS.SERVICE_PROVIDERS);
        const providers = res.data?.providers || res.data?.serviceProviders || [];
        const counts: Record<string, number> = {};
        BASE_SERVICES.forEach((s) => {
          counts[s.type] = countProvidersForType(providers, s.type);
        });
        setProviderCounts(counts);
      } catch {
        setProviderCounts({});
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Services</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#FF6B6B" style={{ marginTop: 8 }} />
        ) : null}
      </View>

      <View style={styles.servicesGrid}>
        {BASE_SERVICES.map((service) => {
          const count = providerCounts[service.type];
          const desc =
            count != null && count > 0
              ? `${service.description}\n${count} provider${count === 1 ? '' : 's'}`
              : service.description;
          return (
            <TouchableOpacity
              key={service.id}
              style={[styles.serviceCard, { backgroundColor: service.color }]}
              onPress={() =>
                navigation.navigate('ServiceProviders' as never, { serviceType: service.type } as never)
              }
            >
              <Text style={styles.serviceIcon}>{service.icon}</Text>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceDescription}>{desc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.myBookingsButton}
        onPress={() => navigation.navigate('MyBookings' as never)}
      >
        <Text style={styles.myBookingsText}>My Bookings</Text>
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
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  serviceIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  serviceDescription: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  myBookingsButton: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  myBookingsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
});

export default ServicesScreen;
