import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Dimensions,
  Modal,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import { getCurrentLocationString } from '../../utils/geolocation';
import leftArrow from '../../assets/images/arrow-left.png';
import locationIcon from '../../assets/images/location.png';
import searchIcon from '../../assets/images/search-normal.png';
import microphoneIcon from '../../assets/images/microphone-2.png';
// Use search icon for sort button if no dedicated sort asset
const sortIcon = searchIcon;

const { width } = Dimensions.get('window');
const cardWidth = (width - 50) / 2;

interface HopePost {
  _id: string;
  id: string;
  name: string;
  age: string;
  location: string;
  image: string;
  type: 'dog' | 'cat' | 'lost' | 'adoption';
  badge?: 'New Listing' | 'Adopt Now';
  badgeColor?: string;
  postType?: 'adoption' | 'lostFound';
  petType?: 'dog' | 'cat';
  petName?: string;
  petAgeText?: string;
  locationText?: string;
  description?: string;
  images?: string[];
  user?: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  createdAt?: string;
}

const HopeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'Dog' | 'Cat' | 'Lost & Found' | 'Adoption'>('Dog');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('');
  const [locLoading, setLocLoading] = useState(true);
  const [posts, setPosts] = useState<HopePost[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterPostType, setFilterPostType] = useState<'all' | 'adoption' | 'lostFound'>('all');
  const [filterPetType, setFilterPetType] = useState<'all' | 'dog' | 'cat'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  useFocusEffect(
    React.useCallback(() => {
      const loc = (route.params as any)?.selectedLocation;
      if (loc) {
        setCurrentLocation(loc);
        setLocLoading(false);
      }
    }, [])
  );

  useEffect(() => {
    if (!(route.params as any)?.selectedLocation) {
      setLocLoading(true);
      getCurrentLocationString()
        .then((addr) => setCurrentLocation(addr || 'Select location'))
        .catch(() => setCurrentLocation(''))
        .finally(() => setLocLoading(false));
    } else {
      setLocLoading(false);
    }
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params: any = { status: 'active' };
      
      // Map category to backend filters
      if (activeCategory === 'Dog') {
        params.petType = 'dog';
        params.postType = 'adoption';
      } else if (activeCategory === 'Cat') {
        params.petType = 'cat';
        params.postType = 'adoption';
      } else if (activeCategory === 'Lost & Found') {
        params.postType = 'lostFound';
      } else if (activeCategory === 'Adoption') {
        params.postType = 'adoption';
      }

      if (currentLocation) {
        params.location = currentLocation;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await api.CLIENT.get(`${api.ENDPOINTS.HOPE}/posts`, { params });
      const fetchedPosts = response.data?.posts || [];
      
      const mapped: HopePost[] = fetchedPosts.map((post: any) => ({
        _id: post._id,
        id: post._id,
        name: post.petName || 'Pet',
        age: post.petAgeText || 'Age not specified',
        location: post.locationText || 'Location not specified',
        image: (post.images && post.images[0]) ? post.images[0] : (post.petType === 'dog' ? '🐕' : post.petType === 'cat' ? '🐱' : '🐾'),
        type: post.postType === 'lostFound' ? 'lost' : 'adoption',
        badge: post.createdAt && new Date(post.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 ? 'New Listing' : 'Adopt Now',
        badgeColor: post.createdAt && new Date(post.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 ? '#10B981' : '#8B5CF6',
        postType: post.postType,
        petType: post.petType,
        petName: post.petName,
        petAgeText: post.petAgeText,
        locationText: post.locationText,
        description: post.description,
        images: post.images,
        user: post.user,
        createdAt: post.createdAt,
      }));

      const sorted = [...mapped].sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return sortOrder === 'newest' ? tb - ta : ta - tb;
      });
      setPosts(sorted);
    } catch (error: any) {
      console.error('Failed to fetch hope posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!locLoading) fetchPosts();
    }, [activeCategory, currentLocation, searchQuery, locLoading, filterPostType, filterPetType, sortOrder])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const categories = ['Dog', 'Cat', 'Lost & Found', 'Adoption'];

  const filteredPets = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.trim().toLowerCase();
    return posts.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        (p.petName && p.petName.toLowerCase().includes(q)) ||
        (p.locationText && p.locationText.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }, [posts, searchQuery]);

  const handlePetPress = (post: HopePost) => {
    navigation.navigate('HopeDetail' as never, { pet: post } as never);
  };

  const renderPetCard = ({ item }: { item: HopePost }) => (
    <TouchableOpacity
      style={styles.petCard}
      onPress={() => handlePetPress(item)}
    >
      <View style={styles.petImageContainer}>
        {typeof item.image === 'string' && (item.image.startsWith('http') || item.image.startsWith('data:')) ? (
          <Image source={{ uri: item.image }} style={styles.petImage} resizeMode="cover" />
        ) : typeof item.image === 'string' ? (
          <Text style={styles.petImageEmoji}>{item.image}</Text>
        ) : (
          <Image source={item.image} style={styles.petImage} resizeMode="cover" />
        )}
        {item.badge && (
          <View style={[styles.badge, { backgroundColor: item.badgeColor }]}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
      </View>
      <View style={styles.petInfo}>
        <Text style={styles.petName}>{item.name}</Text>
        <Text style={styles.petAge}>{item.age}</Text>
        <Text style={styles.petLocation}>{item.location}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={leftArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hope</Text>
        <TouchableOpacity
          style={styles.locationContainer}
          onPress={() => navigation.navigate('HopeChangeLocation' as never)}
        >
          <Image source={locationIcon} style={styles.locationIcon} />
          <Text style={styles.locationText}>
              {locLoading ? 'Getting location...' : (currentLocation || 'Select location')}
            </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Image source={searchIcon} style={styles.searchIconLeft} />

          <TextInput
            style={styles.searchInput}
            placeholder="Search Pet Now"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <View style={styles.verticalDivider} />   
          <TouchableOpacity>
            <Image source={microphoneIcon} style={styles.micIcon} />
          </TouchableOpacity>
        </View>

        {/* Sort Button */}
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortModal(true)}
        >
          <Image source={sortIcon} style={styles.sortIcon} />
        </TouchableOpacity>
    </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryTab,
              activeCategory === category && styles.categoryTabActive,
            ]}
            onPress={() => setActiveCategory(category as any)}
          >
            <Text
              style={[
                styles.categoryTabText,
                activeCategory === category && styles.categoryTabTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Pet Listings Grid / Empty */}
      {filteredPets.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>No Hope Posts in Your Location</Text>
          <Text style={styles.emptyDesc}>
            We couldn&apos;t find any posts for this location right now. Try changing your
            location or check back soon.
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate('HopeChangeLocation' as never)}
          >
            <Text style={styles.emptyBtnText}>Change location →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredPets}
          keyExtractor={(item) => item.id}
          renderItem={renderPetCard}
          numColumns={2}
          contentContainerStyle={styles.petsGrid}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      )}

      {/* Add Post Button */}
      <TouchableOpacity
        style={styles.addPostButton}
        onPress={() => navigation.navigate('AddHopePost' as never, { selectedLocation: currentLocation } as never)}
      >
        <Text style={styles.addPostButtonText}>+ Add Post</Text>
      </TouchableOpacity>

      {/* Location Permission Modal (optional) */}
      <Modal
        animationType="slide"
        transparent
        visible={showLocationModal}
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.locationModalContent}>

            {/* TOP ROW */}
            <View style={styles.topRow}>
              <View style={styles.locationIconCircle}>
                <Image source={locationIcon} style={styles.locationIconModal} />
              </View>

              <TouchableOpacity
                onPress={() => setShowLocationModal(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* TEXT ROW */}
            <Text style={styles.locationModalTitle}>
              Location Access Needed
            </Text>

            <Text style={styles.locationModalDescription}>
              Allow location access to show you the most accurate nearby veterinary services.
            </Text>

            {/* BUTTONS */}
            <View style={styles.locationModalButtons}>
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <Text style={styles.notNowText}>Not Now</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.allowBtn}
                onPress={() => {
                  setShowLocationModal(false);
                  navigation.navigate('HopeChangeLocation' as never);
                }}
              >
                <Text style={styles.allowText}>Allow</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showFilterModal}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={styles.filterModalContent}>
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>
            {[
              { label: 'All post types', value: 'all' as const },
              { label: 'Adoption', value: 'adoption' as const },
              { label: 'Lost & Found', value: 'lostFound' as const },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.filterOption,
                  filterPostType === opt.value && styles.filterOptionOn,
                ]}
                onPress={() => {
                  setFilterPostType(opt.value);
                  setShowFilterModal(false);
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filterPostType === opt.value && styles.filterOptionTextOn,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.filterSubheading}>Pet type</Text>
            {[
              { label: 'All pets', value: 'all' as const },
              { label: 'Dogs', value: 'dog' as const },
              { label: 'Cats', value: 'cat' as const },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.filterOption,
                  filterPetType === opt.value && styles.filterOptionOn,
                ]}
                onPress={() => {
                  setFilterPetType(opt.value);
                  setShowFilterModal(false);
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filterPetType === opt.value && styles.filterOptionTextOn,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sort Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSortModal}
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.sortModalContent}>
            <View style={styles.sortModalHeader}>
              <Text style={styles.sortModalTitle}>Sort By</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>
            {[
              { label: 'Newest first', value: 'newest' as const },
              { label: 'Oldest first', value: 'oldest' as const },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.filterOption,
                  sortOrder === opt.value && styles.filterOptionOn,
                ]}
                onPress={() => {
                  setSortOrder(opt.value);
                  setShowSortModal(false);
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    sortOrder === opt.value && styles.filterOptionTextOn,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',  },
  backIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  locationContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginLeft: 'auto',
    gap: 4,
  },
  locationIcon: {
    height: 18,
    width:18,
    tintColor: '#010610',
  },
  locationText: {
    fontSize: 12,
    color: '#000000',
  },
  searchRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  paddingHorizontal: 16,
  paddingVertical: 14,
},

  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center', 
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  verticalDivider: {
      width: 2,
      backgroundColor: '#D9DCE2',
      alignSelf: 'stretch',
      marginLeft: 4,
    },
  searchIconLeft: {
    width: 30,
    height: 30,
    tintColor: '#9CA3AF',
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },

  micIcon: {
    width: 20,
    height: 20,
    tintColor: '#6B7280',
    marginLeft: 8,
  },

  sortButton: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  sortIcon: {
    width: 20,
    height: 20,
    tintColor: '#374151',
  },

  categoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
    height: 60,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#D9DCE2',
    marginRight: 10,
  },
  categoryTabActive: {
    backgroundColor: '#1F2E46',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
  },
  petsGrid: {
    padding: 20,
    gap: 15,
  },
  petCard: {
    width: cardWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 5,
    borderColor: '#ffffff',
  },
  petImageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  petImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  petImageEmoji: {
    fontSize: 80,
    textAlign: 'center',
    lineHeight: 200,
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#000000',
  },
  petInfo: {
    padding: 12,
  },
  petName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  petAge: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  petLocation: {
    fontSize: 12,
    color: '#6B7280',
  },
  addPostButton: {
    position: 'absolute',
    bottom: 20,
    paddingHorizontal:40,
    backgroundColor: '#1F2E46',
    paddingVertical: 15,
    borderRadius: 999,
    alignItems: 'center',
    elevation: 5,
    alignSelf: 'center',
  },
  addPostButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyWrap: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  emptyBtn: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 30,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.45)',
  justifyContent: 'flex-end',
},

locationModalContent: {
  backgroundColor: '#FFFFFF',
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  padding: 20,
},
topRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
},

locationIconCircle: {
  width: 55,
  height: 55,
  borderRadius: 999,
  backgroundColor: '#95E562',
  alignItems: 'center',
  justifyContent: 'center',
},

locationIconModal: {
  width: 30,
  height: 30,
},
closeBtn: {
  position: 'absolute',
  right: 16,
  top: 16,
  zIndex: 10,
  borderWidth: 2,
  borderColor: '#000000',
  padding: 4,
  borderRadius: 999,
  paddingHorizontal: 6,
  paddingVertical: 2,
},
closeText: {
  fontSize: 18,
  color: '#111827',
},

locationModalTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#111827',
  marginBottom: 6,
},

locationModalDescription: {
  fontSize: 13,
  color: '#000000',
  lineHeight: 18,
},

locationModalButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 24,
},

notNowText: {
  fontSize: 15,
  color: '#000000',
  fontWeight: '900',
},

allowBtn: {
  backgroundColor: '#1F2937',
  paddingHorizontal: 44,
  paddingVertical: 14,
  borderRadius: 999,
},

allowText: {
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: '600',
},


headerRow: {
  flexDirection: 'row',
  gap: 12,
  marginTop: 10,
},


  filterModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 25,
    maxHeight: '80%',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalCloseButton: {
    fontSize: 24,
    color: '#6B7280',
  },
  filterOption: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterOptionOn: { backgroundColor: '#1F2E46', borderColor: '#1F2E46' },
  filterOptionText: { fontSize: 15, color: '#374151' },
  filterOptionTextOn: { color: '#FFFFFF', fontWeight: '600' },
  filterSubheading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 8,
  },
  filterPlaceholder: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 40,
  },
  sortModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 25,
    maxHeight: '80%',
  },
  sortModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sortModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  sortPlaceholder: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 40,
  },
});

export default HopeScreen;

