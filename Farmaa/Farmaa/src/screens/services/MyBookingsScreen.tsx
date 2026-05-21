import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import api from '../../config/api';

interface Booking {
  _id: string;
  serviceType: string;
  serviceProvider: {
    name: string;
  };
  date: string;
  time: string;
  status: string;
  pet?: {
    name: string;
  };
}

const MyBookingsScreen = () => {
  const navigation = useNavigation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchBookings();
    }, [])
  );

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.CLIENT.get(api.ENDPOINTS.MY_BOOKINGS);
      if (response.data?.bookings) {
        setBookings(response.data.bookings);
      }
    } catch (error: any) {
      console.error('Failed to fetch bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#4ECDC4';
      case 'pending': return '#FFE66D';
      case 'completed': return '#96CEB4';
      default: return '#999';
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Loading bookings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      {bookings.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No Bookings Yet</Text>
          <Text style={styles.emptySubtext}>
            Book a service to see your appointments here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <Text style={styles.serviceName}>
                  {item.serviceType.charAt(0).toUpperCase() + item.serviceType.slice(1)}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
              {item.serviceProvider && (
                <Text style={styles.providerName}>Provider: {item.serviceProvider.name}</Text>
              )}
              {item.pet && (
                <Text style={styles.petName}>Pet: {item.pet.name}</Text>
              )}
              <Text style={styles.bookingDate}>Date: {formatDate(item.date)}</Text>
              <Text style={styles.bookingTime}>Time: {item.time}</Text>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  petName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
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
  bookingCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    margin: 15,
    borderRadius: 12,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  serviceName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  providerName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  bookingDate: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  bookingTime: {
    fontSize: 14,
    color: '#999',
  },
});

export default MyBookingsScreen;

