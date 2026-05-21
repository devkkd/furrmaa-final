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
import { useNavigation } from '@react-navigation/native';
import api from '../../config/api';

interface Pet {
  _id: string;
  name: string;
  type: string;
  breed: string;
  age: number;
  gender: string;
  images?: string[];
  description?: string;
  owner?: any;
}

const AdoptionScreen = () => {
  const navigation = useNavigation();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const response = await api.CLIENT.get(api.ENDPOINTS.ADOPTION_PETS);
      setPets(response.data?.pets || []);
    } catch (error: any) {
      console.error('Failed to fetch pets:', error);
      // Fallback to empty array on error
      setPets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPets();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Adopt a Pet</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Loading pets...</Text>
        </View>
      ) : pets.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No pets available for adoption</Text>
          <Text style={styles.emptySubtext}>Check back later!</Text>
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.petsList}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.petCard}
              onPress={() => navigation.navigate('PetDetail' as never, { pet: item } as never)}
            >
              <View style={styles.petImage}>
                {item.images && item.images.length > 0 ? (
                  <Text style={styles.petEmoji}>📷</Text>
                ) : (
                  <Text style={styles.petEmoji}>
                    {item.type === 'dog' ? '🐕' : '🐱'}
                  </Text>
                )}
              </View>
              <Text style={styles.petName}>{item.name}</Text>
              <Text style={styles.petBreed}>{item.breed || 'Mixed'}</Text>
              <Text style={styles.petAge}>
                {item.age ? `${item.age} years old` : 'Age not specified'}
              </Text>
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
  petsList: {
    padding: 15,
  },
  row: {
    justifyContent: 'space-between',
  },
  petCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  petImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  petEmoji: {
    fontSize: 60,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  petBreed: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  petAge: {
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
});

export default AdoptionScreen;

