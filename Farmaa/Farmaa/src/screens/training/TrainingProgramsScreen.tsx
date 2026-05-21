import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../../config/api';

interface Trainer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  rating?: number;
  specialization?: string;
}

const TrainingProgramsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { program } = route.params as any;
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const response = await api.CLIENT.get(api.ENDPOINTS.SERVICE_PROVIDERS, {
        params: { serviceType: 'training' },
      });
      setTrainers(response.data?.providers || []);
    } catch (error: any) {
      console.error('Failed to fetch trainers:', error);
      setTrainers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{program || 'Training Programs'}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.loadingText}>Loading trainers...</Text>
        </View>
      ) : trainers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No trainers available</Text>
        </View>
      ) : (
        trainers.map((trainer) => (
        <TouchableOpacity
          key={trainer.id}
          style={styles.trainerCard}
          onPress={() => (navigation as any).navigate('Booking' as never, { provider: trainer, serviceType: 'Training' } as never)}
        >
          <View style={styles.trainerInfo}>
            <Text style={styles.trainerName}>{trainer.name}</Text>
            <Text style={styles.trainerRating}>⭐ {trainer.rating}</Text>
            <Text style={styles.trainerSessions}>{trainer.sessions} sessions</Text>
          </View>
          <Text style={styles.trainerPrice}>
            {trainer.specialization || 'Expert Trainer'}
          </Text>
        </TouchableOpacity>
        ))
      )}
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
  trainerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 20,
    margin: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  trainerInfo: {
    flex: 1,
  },
  trainerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  trainerRating: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  trainerSessions: {
    fontSize: 12,
    color: '#999',
  },
  trainerPrice: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
});

export default TrainingProgramsScreen;

