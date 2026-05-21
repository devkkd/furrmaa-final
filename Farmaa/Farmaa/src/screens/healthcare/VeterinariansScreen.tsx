import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Image,
  Linking,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import api from '../../config/api';
import {
  getCurrentLocationString,
  getCurrentLocationWithCoords,
  forwardGeocode,
  distanceKm,
} from '../../utils/geolocation';
import { VET_SERVICE_TYPES } from '../../constants/vetServiceTypes';
import locationIcon from '../../assets/images/location.png';
import searchIcon from '../../assets/images/search-normal.png';
import microphoneIcon from '../../assets/images/microphone-2.png';
import sortIcon from '../../assets/images/setting-4.png';
import directonIcon from '../../assets/images/routing.png';

export interface VetServiceItem {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  serviceType: string;
  image?: string;
  distance: string;
  distanceKm?: number;
  specialization?: string;
  clinicName?: string;
  qualification?: string;
  experience?: number;
  rating?: number;
  totalReviews?: number;
}

const VeterinariansScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const selectedLocationParam = (route.params as any)?.selectedLocation;
  const selectedCoordsParam = (route.params as any)?.selectedCoords as { lat: number; lng: number } | undefined;
  const [showLocationModal, setShowLocationModal] = useState(true);
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState(selectedLocationParam || '');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(
    selectedCoordsParam ? { lat: selectedCoordsParam.lat, lng: selectedCoordsParam.lng } : null
  );
  const [locLoading, setLocLoading] = useState(!selectedLocationParam);
  const [sortBy, setSortBy] = useState<'Nearest to Farthest' | 'Farthest to Nearest'>('Nearest to Farthest');
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [services, setServices] = useState<VetServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [typeList, setTypeList] = useState<{ name: string; slug: string; source: string }[]>([]);

  const city = currentLocation?.split(',')[0]?.trim() || undefined;
  const categoryList = typeList.length
    ? ['All', ...typeList.map((t) => t.name)]
    : ['All', ...VET_SERVICE_TYPES];

  useEffect(() => {
    api.CLIENT.get(api.ENDPOINTS.VET_SERVICE_TYPES)
      .then((res) => {
        const types = res.data?.types || [];
        if (types.length)
          setTypeList(types.map((t: any) => ({ name: t.name, slug: t.slug || t.name, source: t.source })));
        else
          setTypeList(
            VET_SERVICE_TYPES.slice(1).map((name) => ({
              name,
              slug: name,
              source: name === 'Veterinarians' ? 'veterinarian' : name === 'Pet Cremation' ? 'cremation' : 'service_provider',
            }))
          );
      })
      .catch(() =>
        setTypeList(
          VET_SERVICE_TYPES.slice(1).map((name) => ({
            name,
            slug: name,
            source: name === 'Veterinarians' ? 'veterinarian' : name === 'Pet Cremation' ? 'cremation' : 'service_provider',
          }))
        )
      );
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const loc = (route.params as any)?.selectedLocation;
      const coords = (route.params as any)?.selectedCoords as { lat: number; lng: number } | undefined;
      if (loc) {
        setCurrentLocation(loc);
        setLocLoading(false);
        if (coords) {
          setUserCoords({ lat: coords.lat, lng: coords.lng });
        } else {
          forwardGeocode(loc).then((c) => setUserCoords(c));
        }
      }
    }, [route.params])
  );

  useEffect(() => {
    if (!selectedLocationParam) {
      setLocLoading(true);
      getCurrentLocationWithCoords()
        .then(({ address, lat, lng }) => {
          setCurrentLocation(address);
          setUserCoords({ lat, lng });
        })
        .catch(() => {})
        .finally(() => setLocLoading(false));
    } else {
      setLocLoading(false);
      if (selectedCoordsParam) setUserCoords(selectedCoordsParam);
    }
  }, []);

  useEffect(() => {
    if (currentLocation || !locLoading) fetchAllVetServices();
  }, [currentLocation, locLoading, selectedCategory, typeList, userCoords]);

  useEffect(() => {
    setServices((prev) =>
      sortBy === 'Farthest to Nearest'
        ? [...prev].sort((a, b) => (b.distanceKm ?? 9999) - (a.distanceKm ?? 9999))
        : [...prev].sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999))
    );
  }, [sortBy]);

  const getDistanceForItem = (
    itemLat: number | undefined,
    itemLng: number | undefined
  ): { distance: string; distanceKm: number } => {
    if (userCoords && itemLat != null && itemLng != null) {
      const km = distanceKm(userCoords.lat, userCoords.lng, itemLat, itemLng);
      return { distance: `${km.toFixed(1)} km away`, distanceKm: km };
    }
    return { distance: '— km', distanceKm: 9999 };
  };

  const fetchAllVetServices = async () => {
    const typesToUse = typeList.length
      ? typeList
      : VET_SERVICE_TYPES.slice(1).map((name) => ({
          name,
          slug: name,
          source: name === 'Veterinarians' ? 'veterinarian' : name === 'Pet Cremation' ? 'cremation' : 'service_provider',
        }));
    // Specific tab = sirf us type ki list; All = saari types alag-alag fetch karke merge
    const listToFetch =
      selectedCategory === 'All'
        ? typesToUse
        : typesToUse.filter((t) => t.name === selectedCategory);

    try {
      setLoading(true);
      const all: VetServiceItem[] = [];
      let index = 0;

      for (const t of listToFetch) {
        const slug = (t.slug || t.name || '').trim();
        if (t.source === 'cremation') {
          try {
            const params = city ? { city } : {};
            const res = await api.CLIENT.get(api.ENDPOINTS.CREMATION_CENTERS, { params });
            const centers = res.data?.centers || [];
            centers.forEach((c: any) => {
              const addressStr =
                [c.address, c.city, c.state].filter(Boolean).join(', ') || 'Address not available';
              const { distance, distanceKm: dKm } = getDistanceForItem(
                c.latitude,
                c.longitude
              );
              all.push({
                id: c._id,
                name: c.name || 'Cremation Center',
                address: addressStr,
                phone: c.phone,
                serviceType: t.name,
                distance,
                distanceKm: dKm,
              });
              index++;
            });
          } catch (_) {}
        } else {
          // Har type ke liye dono: veterinarians (serviceType) + service providers (serviceType) – filter type ke hisaab se
          try {
            const vetParams: Record<string, string> = city ? { city } : {};
            if (slug && slug !== 'All') vetParams.serviceType = slug;
            const vetRes = await api.CLIENT.get(api.ENDPOINTS.VETERINARIANS, { params: vetParams });
            const vets = vetRes.data?.veterinarians || [];
            vets.forEach((v: any) => {
              const addr = v.address;
              const addressStr = addr
                ? [addr.street, addr.city, addr.state].filter(Boolean).join(', ')
                : 'Address not available';
              const { distance, distanceKm: dKm } = getDistanceForItem(
                addr?.latitude,
                addr?.longitude
              );
              all.push({
                id: v._id,
                name: v.name || v.clinicName || 'Veterinarian',
                address: addressStr,
                phone: v.phone,
                email: v.email,
                serviceType: t.name,
                image: v.profileImage,
                distance,
                distanceKm: dKm,
                specialization: v.specialization,
                clinicName: v.clinicName,
                qualification: v.qualification,
                experience: v.experience,
                rating: v.rating || 0,
                totalReviews: v.totalReviews || 0,
              });
              index++;
            });
          } catch (_) {}
          try {
            const provParams = slug && slug !== 'All' ? { serviceType: slug } : {};
            const provRes = await api.CLIENT.get(api.ENDPOINTS.SERVICE_PROVIDERS, { params: provParams });
            const providers = provRes.data?.providers || [];
            providers.forEach((p: any) => {
              const addr = typeof p.address === 'object' ? p.address : null;
              const addressStr =
                addr
                  ? [addr?.street, addr?.city, addr?.state].filter(Boolean).join(', ')
                  : (typeof p.address === 'string' ? p.address : null) || 'Address not available';
              const { distance, distanceKm: dKm } = getDistanceForItem(
                addr?.latitude,
                addr?.longitude
              );
              all.push({
                id: p._id,
                name: p.name || 'Service',
                address: addressStr,
                phone: p.phone,
                serviceType: t.name,
                image: p.profileImage,
                distance,
                distanceKm: dKm,
                rating: p.rating || 0,
                totalReviews: p.totalReviews || 0,
              });
              index++;
            });
          } catch (_) {}
        }
      }

      const sorted =
        sortBy === 'Farthest to Nearest'
          ? [...all].sort((a, b) => (b.distanceKm ?? 9999) - (a.distanceKm ?? 9999))
          : [...all].sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
      setServices(sorted);
    } catch (e) {
      setServices([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllVetServices();
  };

  let filteredServices = [...services];
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredServices = filteredServices.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.address && s.address.toLowerCase().includes(q)) ||
        (s.serviceType && s.serviceType.toLowerCase().includes(q))
    );
  }
  if (sortBy === 'Farthest to Nearest') {
    filteredServices = [...filteredServices].reverse();
  }

  const shouldShowEmpty = showEmptyState || filteredServices.length === 0;

  const handleCall = (phone: string) => {
    if (!phone) return;
    const num = String(phone).replace(/\s/g, '').trim();
    if (num) Linking.openURL(`tel:${num}`);
  };

  const handleDirection = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || '')}`;
    Linking.openURL(url);
  };

  const handleSearch = () => {
    (navigation as any).navigate('VetSearch' as never, { searchQuery } as never);
  };

  const renderServiceItem = ({ item }: { item: VetServiceItem }) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceImage}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.serviceImagePhoto} resizeMode="cover" />
        ) : (
          <Text style={styles.serviceImageEmoji}>{item.serviceType === 'Pet Cremation' ? '🕯️' : '🏥'}</Text>
        )}
      </View>
      <View style={styles.serviceInfo}>
        <View style={styles.serviceNameRow}>
          <Text style={styles.serviceName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{item.serviceType}</Text>
          </View>
        </View>
        {item.clinicName && item.clinicName !== item.name && (
          <Text style={styles.clinicName}>{item.clinicName}</Text>
        )}
        <View style={styles.ratingContainer}>
          <Text style={styles.serviceDistance}>{item.distance}</Text>
          {item.rating != null && item.rating > 0 && (
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>⭐ {item.rating.toFixed(1)}</Text>
              {item.totalReviews != null && item.totalReviews > 0 && (
                <Text style={styles.reviewsText}>({item.totalReviews})</Text>
              )}
            </View>
          )}
        </View>
        {item.specialization && (
          <Text style={styles.specialization}>{item.specialization}</Text>
        )}
        {item.qualification && (
          <Text style={styles.qualification}>{item.qualification}</Text>
        )}
        {item.experience && (
          <Text style={styles.experience}>{item.experience} years experience</Text>
        )}
        <Text style={styles.serviceAddress}>{item.address}</Text>
        <View style={styles.serviceActions}>
          {item.phone && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleCall(item.phone)}
            >
              <Text style={styles.actionButtonIcon}>📞</Text>
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.directionsButton}
            onPress={() => handleDirection(item.address)}
          >
            <Image source={directonIcon} style={styles.actionButtonIcon} />
            <Text style={styles.directionsText}>Direction</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vet Services</Text>
        <TouchableOpacity
          style={styles.locationContainer}
          onPress={() => (navigation as any).navigate('ChangeLocation' as never)}
        >
          <Image source={locationIcon} style={styles.locationIcon} />
          <Text style={styles.locationText}>
              {locLoading ? 'Getting location...' : (currentLocation || 'Select location')}
            </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchRow}>
        {/* Search Box */}
        <View style={styles.searchBox}>
          <Image source={searchIcon} style={styles.searchIconLeft} />

          <TextInput
            style={styles.searchInput}
            placeholder="Search Vet Services"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
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


      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categoryList.map((category, idx) => (
          <TouchableOpacity
            key={`${category}-${idx}`}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonSelected,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === category &&
                  styles.categoryButtonTextSelected,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Services List or Empty State */}
      {loading && services.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.loadingText}>Loading vet services...</Text>
        </View>
      ) : shouldShowEmpty ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Vet Services Nearby</Text>
          <Text style={styles.emptyDescription}>
            We couldn't find any veterinary services in your current area. Try
            changing your location to discover available options.
          </Text>
          <Text style={styles.emptySubtext}>
            Healthy pets start with the right care.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('ChangeLocation' as never)}
          >
            <Text style={styles.emptyButtonText}>Change Location →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item.id}
          renderItem={renderServiceItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Location Permission Modal */}
      <Modal
        visible={showLocationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.locationModalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.locationIconContainer}>
                <Image source={locationIcon} style={styles.locationModalIcon} />
              </View>
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <Text style={styles.closeModalIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalTitle}>Location Access Needed</Text>
            <Text style={styles.modalDescription}>
              Allow location access to show you the most accurate nearby
              veterinary services.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.notNowButton}
                onPress={() => setShowLocationModal(false)}
              >
                <Text style={styles.notNowButtonText}>Not Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.allowButton}
                onPress={() => setShowLocationModal(false)}
              >
                <Text style={styles.allowButtonText}>Allow</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sort By Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="slide"
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
                <View style={styles.closeSortButton}>
                  <Text style={styles.closeSortIcon}>✕</Text>
                </View>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => {
                setSortBy('Nearest to Farthest');
                setShowSortModal(false);
              }}
            >
              <View
                style={[
                  styles.radioButton,
                  sortBy === 'Nearest to Farthest' && {
                    backgroundColor: '#111827',
                  },
                ]}
              >
                {sortBy === 'Nearest to Farthest' && (
                  <View style={styles.radioButtonSelected} />
                )}
              
              </View>
              <Text style={styles.sortOptionText}>Nearest to Farthest</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => {
                setSortBy('Farthest to Nearest');
                setShowSortModal(false);
              }}
            >
              <View
                style={[
                  styles.radioButton,
                  sortBy === 'Farthest to Nearest' && {
                    backgroundColor: '#111827',
                  },
                ]}
              >
                {sortBy === 'Farthest to Nearest' && (
                  <View style={styles.radioButtonSelected} />
                )}
              
              </View>
              <Text style={styles.sortOptionText}>Farthest to Nearest</Text>
            </TouchableOpacity>
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
      alignItems: 'stretch',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationIcon: {
    width: 20,
    height: 20,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    height: 60,
    marginBottom: 20,
  },

  categoryButton: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    height: 44,      
    borderRadius: 999,        
    backgroundColor: '#D9DCE2', 
    alignItems: 'center',
    marginRight: 10,
  },

  categoryButtonSelected: {
    backgroundColor: '#1F2E46',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  categoryButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  servicesList: {
    padding: 20,
    paddingBottom: 100,
    justifyContent: 'flex-start',
    flexGrow: 1, 
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
    justifyContent: 'flex-start',
    flexGrow: 1, 
  },
  serviceImage: {
    width: 120,
    height: 160,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
  },
  serviceImagePhoto: {
    width: 120,
    height: 160,
    borderRadius: 8,
  },
  serviceImageEmoji: {
    fontSize: 60,
    textAlign: 'center',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 8,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  typeBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  clinicName: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  serviceDistance: {
    fontSize: 14,
    color: '#8E939A',
    fontWeight: '600',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  reviewsText: {
    fontSize: 11,
    color: '#92400E',
    marginLeft: 4,
  },
  specialization: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
    marginBottom: 4,
  },
  qualification: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  experience: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  serviceAddress: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  serviceActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E3A8A',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
    gap: 6,
    minWidth: 90,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 30,
    gap: 6,
    color: '#1F2937',
  },
  directionsText: {
    color: '#000000',
    fontSize: 16,
  },
    
  actionButtonIcon: {
    width: 18,
    height: 18
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  locationModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  locationIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#95E562',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationModalIcon: {
    width: 30,
    height: 30,
    tintColor: '#000000',
  },
  closeModalIcon: {
    fontSize: 16,
    color: '#000000',
    fontWeight: 'bold',
    borderWidth: 3,
    borderColor: '#000000',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
    marginBottom: 30,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  notNowButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  notNowButtonText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '800',
  },
  allowButton: {
    backgroundColor: '#1F2E46',
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 30,
  },
  allowButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sortModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  sortModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  sortModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeSortButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  closeSortIcon: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#1F2E46',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF', 
  },

  sortOptionText: {
    fontSize: 18,
    color: '#1F2937',
    fontWeight: '500',
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
  padding: 40,
  alignItems: 'center',
},

  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 15,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  emptyButton: {
    backgroundColor: '#1F2E46',
    paddingVertical: 20,
    paddingHorizontal: 34,
    borderRadius: 30,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default VeterinariansScreen;
