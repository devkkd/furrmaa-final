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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';

interface Pet {
  _id: string;
  name: string;
  type: 'dog' | 'cat';
  breed?: string;
  age?: number;
  gender?: string;
  images?: string[];
}

const MyPetsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchPets();
    }, [])
  );

  const fetchPets = async () => {
    try {
      setLoading(true);
      // Try fetching from pets endpoint first
      try {
        const petResponse = await api.CLIENT.get(api.ENDPOINTS.USER_PETS);
        if (petResponse.data?.pets) {
          setPets(petResponse.data.pets);
        }
      } catch (petError: any) {
        // Fallback to user profile endpoint
        const response = await api.CLIENT.get(api.ENDPOINTS.USER_PROFILE);
        if (response.data?.user?.pets) {
          setPets(response.data.user.pets);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch pets:', error);
      setPets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPets();
  };

  if (loading && pets.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Loading pets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Pets</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddPetProfile' as never)}>
          <Text style={styles.addButton}>+ Add Pet</Text>
        </TouchableOpacity>
      </View>

      {pets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Pets Added</Text>
          <Text style={styles.emptyDescription}>
            Add your first pet to get started with personalized care and services.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('AddPetProfile' as never)}
          >
            <Text style={styles.emptyButtonText}>Add Your First Pet →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.petCard}
              onPress={() => navigation.navigate('PetProfile' as never, { petId: item._id } as never)}
            >
              <View style={styles.petImage}>
                <Text style={styles.petEmoji}>
                  {item.type === 'dog' ? '🐕' : item.type === 'cat' ? '🐱' : '🐾'}
                </Text>
              </View>
              <View style={styles.petInfo}>
                <Text style={styles.petName}>{item.name}</Text>
                {item.breed && <Text style={styles.petBreed}>{item.breed}</Text>}
                {item.age && <Text style={styles.petAge}>{item.age} years old</Text>}
              </View>
            </TouchableOpacity>
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
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  emptyButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  petCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 15,
    margin: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  petImage: {
    width: 80,
    height: 80,
    backgroundColor: '#F5F5F5',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  petEmoji: {
    fontSize: 40,
  },
  petInfo: {
    flex: 1,
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
});

export default MyPetsScreen;

