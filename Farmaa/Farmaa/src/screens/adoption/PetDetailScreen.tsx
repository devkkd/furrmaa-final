import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../../config/api';

const PetDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const routePet = (route.params as any)?.pet;
  const petId = routePet?._id || routePet?.id;
  const [pet, setPet] = useState<any>(routePet || null);
  const [loading, setLoading] = useState(!!petId && !routePet?.description);

  useEffect(() => {
    if (!petId) return;
    (async () => {
      try {
        setLoading(true);
        const res = await api.CLIENT.get(`${api.ENDPOINTS.ADOPTION_PET}/${petId}`);
        if (res.data?.pet) setPet(res.data.pet);
      } catch {
        if (routePet) setPet(routePet);
      } finally {
        setLoading(false);
      }
    })();
  }, [petId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  const imageUri = pet?.images?.[0];
  const description =
    pet?.description ||
    `${pet?.name || 'This pet'} is looking for a loving home. Contact us to learn more.`;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <View style={styles.petImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.petImageFile} resizeMode="cover" />
          ) : (
            <Text style={styles.petEmoji}>{pet?.type === 'cat' ? '🐱' : '🐕'}</Text>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.petName}>{pet?.name}</Text>
        <Text style={styles.petBreed}>{pet?.breed || pet?.type}</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Age</Text>
            <Text style={styles.infoValue}>
              {pet?.age != null ? `${pet.age} yr` : '—'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Gender</Text>
            <Text style={styles.infoValue}>{pet?.gender || '—'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        <TouchableOpacity
          style={styles.adoptButton}
          onPress={() => navigation.navigate('AdoptionForm' as never, { pet } as never)}
        >
          <Text style={styles.adoptButtonText}>Adopt Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  imageContainer: { backgroundColor: '#F9FAFB', padding: 20 },
  petImage: {
    height: 280,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  petImageFile: { width: '100%', height: '100%' },
  petEmoji: { fontSize: 80 },
  content: { padding: 20 },
  petName: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  petBreed: { fontSize: 16, color: '#6B7280', marginBottom: 16 },
  infoRow: { flexDirection: 'row', marginBottom: 20 },
  infoItem: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  description: { fontSize: 14, color: '#4B5563', lineHeight: 22 },
  adoptButton: {
    backgroundColor: '#1F2E46',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  adoptButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default PetDetailScreen;
