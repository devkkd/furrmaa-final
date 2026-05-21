import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
  Image,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import { getCurrentLocationString, primaryLocationLabel } from '../../utils/geolocation';
import leftArrow from '../../assets/images/arrow-left.png';
import locationIcon from '../../assets/images/location.png';
import searchIcon from '../../assets/images/search-normal.png';
import microphoneIcon from '../../assets/images/microphone-2.png';

const NAVY = '#1F2E46';

type Center = {
  _id: string;
  id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  phone?: string;
  distance?: string;
  poster?: string;
};

const CremationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const selectedLocation = (route.params as any)?.selectedLocation as string | undefined;

  const [q, setQ] = useState('');
  const [location, setLocation] = useState(selectedLocation || user?.address?.city || '');
  const [locLoading, setLocLoading] = useState(!selectedLocation && !user?.address?.city);
  const [loading, setLoading] = useState(false);
  const [centers, setCenters] = useState<Center[]>([]);

  // Calculate distance (simplified - in real app, use geolocation API)
  const calculateDistance = (centerCity: string, userCity: string): string => {
    // Simple matching - if same city, show nearby
    if (centerCity?.toLowerCase() === userCity?.toLowerCase()) {
      return '0.5 - 5 km';
    }
    return '10+ km';
  };

  useEffect(() => {
    if (selectedLocation || user?.address?.city) return;
    setLocLoading(true);
    getCurrentLocationString()
      .then((addr) => setLocation(addr || ''))
      .catch(() => setLocation(''))
      .finally(() => setLocLoading(false));
  }, []);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (location?.trim()) params.location = location.trim();
      const res = await api.CLIENT.get(`${api.ENDPOINTS.CREMATION}/centers`, { params });
      const list = (res.data?.centers || []) as any[];

      const mapped: Center[] = list.map((c: any) => ({
        _id: c._id,
        id: c._id,
        name: c.name || 'Cremation Center',
        address: `${c.address || ''}, ${c.city || ''}, ${c.state || ''}`.trim().replace(/^,\s*|,\s*$/g, ''),
        city: c.city,
        state: c.state,
        phone: c.phone,
        distance: calculateDistance(c.city, location),
        poster: c.image || undefined,
      }));

      // Sort by distance (nearest first)
      setCenters(mapped);
    } catch (e: any) {
      console.error('Failed to fetch cremation centers:', e);
      setCenters([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const loc = (route.params as any)?.selectedLocation;
      if (loc) {
        setLocation(loc);
        setLocLoading(false);
      }
    }, [(route.params as any)?.selectedLocation])
  );

  useEffect(() => {
    if (!locLoading) fetchCenters();
  }, [location, locLoading]);


  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const base = centers;
    if (!s) return base;
    return base.filter(
      (c) => c.name.toLowerCase().includes(s) || c.address.toLowerCase().includes(s),
    );
  }, [q, centers]);

  const openRequest = (center: Center) => {
    (navigation as any).navigate('CremationRequest' as never, { center } as never);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={leftArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Cremation</Text>
        <TouchableOpacity style={styles.locationPill} onPress={() => navigation.navigate('CremationChangeLocation' as never)}>
          <Image source={locationIcon} style={styles.locationIcon} />
          <Text style={styles.locationText} numberOfLines={1}>
            {locLoading ? 'Locating...' : primaryLocationLabel(location || 'Select location')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Image source={searchIcon} style={styles.searchIconLeft} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Cremation"
            placeholderTextColor="#9CA3AF"
            value={q}
            onChangeText={setQ}
          />
          <View style={styles.verticalDivider} />   
          <TouchableOpacity>
            <Image source={microphoneIcon} style={styles.micIcon} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => fetchCenters()}>
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>
      

      {loading && centers.length === 0 ? (
        <View style={styles.emptyWrap}>
          <ActivityIndicator size="large" color={NAVY} />
          <Text style={styles.emptyTitle}>Loading Centers...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>No Cremation Services Available</Text>
          <Text style={styles.emptyDesc}>
            We couldn’t find any cremation services in your current area. Please change your location or check back later as we continue to add more trusted providers.{'\n'}
            <Text style={{color: '#000000',fontWeight: 'bold'}}>Honoring every beloved companion with dignity and care.</Text>
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate('CremationChangeLocation' as never)}
          >
            <Text style={styles.emptyBtnText}>Change location →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchCenters}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.poster}>
                {item.poster ? (
                  <Image source={{ uri: item.poster }} style={styles.posterImage} />
                ) : (
                  <Text style={styles.posterEmoji}>🕊️🐾</Text>
                )}
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.centerName}>{item.name}</Text>
                <Text style={styles.distance}>{item.distance} away</Text>
                <Text style={styles.address} numberOfLines={2}>
                  {item.address}
                </Text>
                <View style={styles.actionsRow}>
                  {item.phone && (
                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() => Linking.openURL(`tel:${item.phone}`)}
                    >
                      <Text style={styles.icon}>📞</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => {
                      const address = encodeURIComponent(item.address);
                      Linking.openURL(`https://maps.google.com/?q=${address}`);
                    }}
                  >
                    <Text style={styles.icon}>🧭</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.primaryBtn} onPress={() => openRequest(item)}>
                    <Text style={styles.primaryBtnText}>Send Request for Cremation</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Bottom CTA */}
              <TouchableOpacity
                style={styles.bottomLink}
                onPress={() => openRequest(item)}
              >
                <Text style={styles.bottomLinkText}>
                  Send Request for Cremation →
                </Text>
              </TouchableOpacity>
            </View>
  )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  backIcon: { width: 30, height: 30},
  title: { fontSize: 18, fontWeight: '800', color: '#111827', flex: 1 },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    maxWidth: 170,
  },
  locationIcon: { width: 20, height: 20 },
  locationText: { fontSize: 12, fontWeight: '700', color: '#111827' },
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
  searchIconLeft: {
    width: 30,
    height: 30,
    tintColor: '#9CA3AF',
    marginRight: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
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
    micIcon: {
    width: 20,
    height: 20,
    tintColor: '#6B7280',
    marginLeft: 8,
  },
  verticalDivider: {
      width: 2,
      backgroundColor: '#D9DCE2',
      alignSelf: 'stretch',
      marginLeft: 4,
    },
listContent: {
  padding: 10,
  paddingBottom: 32,
  gap: 16,
},

card: {
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  padding: 12,
},

row: {
  flexDirection: 'row',
  gap: 12,
},

poster: {
  width: 90,
  height: 120,
  borderRadius: 12,
  backgroundColor: '#111827',
  alignItems: 'center',
  justifyContent: 'center',
},

posterImage: { width: '100%', height: '100%', borderRadius: 12 },
posterEmoji: { fontSize: 36 },

cardBody: {
  flex: 1,
},

centerName: {
  fontSize: 16,
  fontWeight: '700',
  color: '#111827',
  marginBottom: 4,
},

distance: {
  fontSize: 12,
  color: '#6B7280',
  marginBottom: 4,
},

address: {
  fontSize: 12,
  color: '#6B7280',
  lineHeight: 16,
  marginBottom: 8,
},

actionsRow: {
  flexDirection: 'row',
  gap: 12,
},

actionBtn: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#8B5FBF',
  paddingHorizontal: 15,
  paddingVertical: 6,
  borderRadius: 20,
},
directionBtn: {
  flexDirection: 'row',
  alignItems: 'center',
},
actionIcon: {
  width: 20,
  height: 20,
  marginRight: 6,
},
actionText: {
  fontSize: 13,
  color: '#ffffff',
  fontWeight: '600',
},

bottomLink: {
  marginTop: 10,
},

bottomLinkText: {
  fontSize: 13,
  fontWeight: '600',
  color: '#111827',
}, emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 10, textAlign: 'center' },
  emptyDesc: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 18, marginBottom: 18 },
  emptyBtn: { backgroundColor: NAVY, paddingHorizontal: 30, paddingVertical: 20, borderRadius: 30 },
  emptyBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14,lineHeight: 22   },
});

export default CremationScreen;


