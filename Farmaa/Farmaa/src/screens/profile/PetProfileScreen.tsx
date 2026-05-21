import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import api from '../../config/api';
import profilePic from '../../assets/images/feedProfImage.png';
import eyeIcon from '../../assets/images/eye.png';
import leftArrow from '../../assets/images/arrow-left.png';
import editIcon from '../../assets/images/edit-2.png';

const { width } = Dimensions.get('window');
const imageSize = (width - 12) / 3;

const PetProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const routePetId = (route.params as any)?.petId;
  const [petsList, setPetsList] = useState<any[]>([]);
  const [activePetId, setActivePetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [petPosts, setPetPosts] = useState<any[]>([]);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const res = await api.CLIENT.get(api.ENDPOINTS.USER_PETS);
      const list = res.data?.pets || [];
      setPetsList(list);
      if (list.length) {
        const pick =
          routePetId && list.find((p: any) => p._id === routePetId)
            ? routePetId
            : list[0]._id;
        setActivePetId(pick);
      } else {
        setActivePetId(null);
      }
    } catch {
      setPetsList([]);
      setActivePetId(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchPetPosts = async (petId: string) => {
    try {
      const res = await api.CLIENT.get(api.ENDPOINTS.SOCIAL);
      const all = res.data?.posts || [];
      const filtered = all.filter(
        (p: any) => (p.pet?._id || p.pet)?.toString() === petId
      );
      setPetPosts(
        filtered.map((p: any) => ({
          id: p._id,
          image: p.videos?.[0]
            ? { uri: p.videos[0] }
            : p.images?.[0]
              ? { uri: p.images[0] }
              : profilePic,
          views: Array.isArray(p.likes) ? p.likes.length : 0,
        }))
      );
    } catch {
      setPetPosts([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPets();
    }, [routePetId])
  );

  useFocusEffect(
    useCallback(() => {
      if (activePetId) fetchPetPosts(activePetId);
      else setPetPosts([]);
    }, [activePetId])
  );

  const currentPetRaw = petsList.find((p) => p._id === activePetId);
  const currentPet = currentPetRaw
    ? {
        _id: currentPetRaw._id,
        name: currentPetRaw.name,
        age: currentPetRaw.age
          ? `${currentPetRaw.age} ${currentPetRaw.age === 1 ? 'Year' : 'Years'}`
          : '—',
        description: currentPetRaw.description || 'No description yet.',
        profileImage: currentPetRaw.images?.[0]
          ? { uri: currentPetRaw.images[0] }
          : profilePic,
        posts: petPosts,
      }
    : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={leftArrow} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pet Profile</Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddPetProfile' as never)}
        >
          <Text style={styles.addButtonText}>+ Add Profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Text style={styles.loadingText}>Loading pets...</Text>
        ) : petsList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Pet Profile Found</Text>
            <Text style={styles.emptyDescription}>
              Add your pet's details to unlock personalized recommendations and features.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('AddPetProfile' as never)}
            >
              <Text style={styles.emptyButtonText}>Add Pet Profile →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {petsList.length > 1 && (
              <View style={styles.tabsContainer}>
                {petsList.map((p) => (
                  <TouchableOpacity
                    key={p._id}
                    style={[styles.tab, activePetId === p._id && styles.tabActive]}
                    onPress={() => setActivePetId(p._id)}
                  >
                    <Text
                      style={[styles.tabText, activePetId === p._id && styles.tabTextActive]}
                    >
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {currentPet && (
              <>
                <View style={styles.profileHeader}>
                  <View style={styles.topRow}>
                    <Image source={currentPet.profileImage} style={styles.profileImage} />
                    <View style={styles.profileInfo}>
                      <View style={styles.nameRow}>
                        <View>
                          <Text style={styles.petName}>{currentPet.name}</Text>
                          <Text style={styles.petAge}>{currentPet.age}</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() =>
                            (navigation as any).navigate('EditPetProfile' as never, {
                              petId: currentPet._id,
                              petName: currentPet.name,
                            } as never)
                          }
                        >
                          <Image source={editIcon} style={styles.editIcon} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.petDescription}>{currentPet.description}</Text>
                </View>

                {currentPet.posts.length === 0 ? (
                  <Text style={styles.emptySubtext}>No photos uploaded for this pet.</Text>
                ) : (
                  <View style={styles.postsGrid}>
                    {currentPet.posts.map((post) => (
                      <TouchableOpacity
                        key={post.id}
                        style={styles.postItem}
                        onPress={() =>
                          (navigation as any).navigate('ViewVideo' as never, {
                            postId: post.id,
                          } as never)
                        }
                      >
                        <View style={styles.postImage}>
                          <Image source={post.image} style={styles.postEmoji} />
                          <View style={styles.viewOverlay}>
                            <Image source={eyeIcon} style={styles.viewIcon} />
                            <Text style={styles.viewCount}>{post.views}</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 18,
    backgroundColor: '#FFFFFF',
  },
  leftSection: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backIcon: { width: 30, height: 30 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  addButton: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 30,
  },
  addButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  content: { flex: 1 },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#8E939A',
  },
  tab: { paddingBottom: 10 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#1E3A8A' },
  tabText: { fontSize: 16, color: '#9CA3AF', fontWeight: '500' },
  tabTextActive: { fontSize: 16, color: '#1F2937', fontWeight: '600' },
  profileHeader: { padding: 20 },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  profileImage: { width: 72, height: 72, borderRadius: 36, marginRight: 12 },
  profileInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  petName: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  petAge: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  editButton: { padding: 4 },
  editIcon: { width: 22, height: 22 },
  petDescription: { marginTop: 12, fontSize: 14, color: '#4B5563', lineHeight: 20 },
  postsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 2 },
  postItem: { width: imageSize, aspectRatio: 3 / 4, margin: 1 },
  postImage: { width: '100%', height: '100%', position: 'relative', overflow: 'hidden' },
  postEmoji: { width: '100%', height: '100%', resizeMode: 'cover' },
  viewOverlay: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  viewIcon: { width: 18, height: 18 },
  viewCount: { fontSize: 12, color: '#FFFFFF', fontWeight: '600' },
  loadingText: { textAlign: 'center', padding: 24, fontSize: 16, color: '#6B7280' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    paddingTop: 100,
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  emptyButton: {
    backgroundColor: '#1F2937',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  emptyButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
});

export default PetProfileScreen;
