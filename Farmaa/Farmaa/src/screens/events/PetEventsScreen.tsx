import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import leftArrow from '../../assets/images/arrow-left.png';
import locationIcon from '../../assets/images/location.png';
import {
  getCurrentLocationString,
  primaryLocationLabel,
} from '../../utils/geolocation';

const NAVY = '#1F2E46';

type PetEvent = {
  id: string;
  title: string;
  date: string;
  venue: string;
  timing?: string;
  city: string;
  posterUrl?: string;
  images?: string[];
  about: string;
};

const PetEventsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const selectedFromRoute = (route.params as any)?.selectedLocation as string | undefined;

  const [location, setLocation] = useState(
    selectedFromRoute || user?.address?.city || ''
  );
  const [locLoading, setLocLoading] = useState(!selectedFromRoute && !user?.address?.city);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<PetEvent[]>([]);

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
    if (selectedFromRoute || user?.address?.city) return;
    setLocLoading(true);
    getCurrentLocationString()
      .then((addr) => setLocation(addr || ''))
      .catch(() => setLocation(''))
      .finally(() => setLocLoading(false));
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (location?.trim()) params.location = location.trim();
      if (q.trim()) params.search = q.trim();
      const res = await api.CLIENT.get(api.ENDPOINTS.PET_EVENTS, { params });
      const list = (res.data?.events || []) as any[];
      const mapped: PetEvent[] = list.map((e: any) => ({
        id: e._id,
        title: e.title,
        date: e.dateText,
        venue: e.venue,
        city: e.city,
        posterUrl: e.posterUrl || e.images?.[0],
        images: e.images || (e.posterUrl ? [e.posterUrl] : []),
        about: e.description || '',
      }));
      setEvents(mapped);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!locLoading) fetchEvents();
  }, [location, locLoading]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return events;
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(s) ||
        e.venue.toLowerCase().includes(s) ||
        e.city.toLowerCase().includes(s) ||
        (e.about && e.about.toLowerCase().includes(s))
    );
  }, [events, q]);

  const openDetail = (event: PetEvent) => {
    (navigation as any).navigate('PetEventDetail' as never, { event, eventId: event.id } as never);
  };

  const renderItem = ({ item }: { item: PetEvent }) => (
    <TouchableOpacity style={styles.card} onPress={() => openDetail(item)}>
      <View style={styles.poster}>
        {item.posterUrl ? (
          <Image source={{ uri: item.posterUrl }} style={styles.posterImage} />
        ) : (
          <View style={styles.posterPlaceholder}>
            <Text style={styles.posterEmoji}>🐶🎉</Text>
          </View>
        )}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.title} numberOfLines={3}>
          {item.title}
        </Text>
        <Text style={styles.meta}>{item.date}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {item.venue}
        </Text>
        <Text style={styles.meta}>{item.city}</Text>
      </View>
    </TouchableOpacity>
  );

  const locationLabel = locLoading
    ? 'Locating...'
    : primaryLocationLabel(location || 'Select location');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={leftArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pet Events</Text>
        <TouchableOpacity
          style={styles.locationPill}
          onPress={() => (navigation as any).navigate('PetEventsChangeLocation' as never)}
        >
          <Image source={locationIcon} style={styles.locationIconImg} />
          <Text style={styles.locationText} numberOfLines={1}>
            {locationLabel}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search Pet Events"
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            returnKeyType="search"
            onSubmitEditing={() => fetchEvents()}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => fetchEvents()}>
          <Text style={styles.filterIcon}>↻</Text>
        </TouchableOpacity>
      </View>

      {loading && events.length === 0 ? (
        <View style={styles.emptyWrap}>
          <ActivityIndicator size="large" color={NAVY} />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>No Pet Events Available</Text>
          <Text style={styles.emptyDesc}>
            {location?.trim()
              ? `No events in ${primaryLocationLabel(location)} right now. Try another location or check back later.`
              : 'Select your location to see pet events near you.'}
            {'\n'}
            <Text style={styles.emptySubDesc}>Every great adventure begins with a wag or a purr.</Text>
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => (navigation as any).navigate('PetEventsChangeLocation' as never)}
          >
            <Text style={styles.emptyBtnText}>Change location →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchEvents}
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
  backIcon: { width: 30, height: 30 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827', flex: 1 },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    maxWidth: 160,
  },
  locationIconImg: { width: 18, height: 18 },
  locationText: { fontSize: 12, color: '#111827', fontWeight: '700', flexShrink: 1 },
  searchRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: { fontSize: 16, color: '#6B7280' },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterIcon: { fontSize: 18, color: '#111827' },
  listContent: { padding: 16, paddingBottom: 24, gap: 14 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  poster: {
    height: 425,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  posterImage: { width: '100%', height: '100%', borderRadius: 14 },
  posterPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6' },
  posterEmoji: { fontSize: 80 },
  cardBody: { padding: 12 },
  title: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 6 },
  meta: { fontSize: 12, color: '#000000', marginBottom: 4 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 10 },
  emptyDesc: { fontSize: 13, color: '#000000', textAlign: 'center', lineHeight: 18, marginBottom: 18 },
  emptySubDesc: {
    fontSize: 13,
    color: '#121418',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    fontWeight: '600',
  },
  emptyBtn: {
    backgroundColor: NAVY,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 60,
  },
  emptyBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  loadingText: { marginTop: 10, fontSize: 14, color: '#6B7280' },
});

export default PetEventsScreen;
