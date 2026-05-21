import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import gpsIcon from '../../assets/images/gps.png';
import { getCurrentLocationString, searchLocations, type LocationSuggestion } from '../../utils/geolocation';
import microphoneIcon from '../../assets/images/microphone-2.png';
import leftArrow from '../../assets/images/arrow-left.png';

const SEARCH_DEBOUNCE_MS = 500;

const HopeChangeLocationScreen = () => {
  const navigation = useNavigation();
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<LocationSuggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const s = q.trim();
    if (s.length < 2) {
      setSearchResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchLocations(s);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  const selectLocation = (loc: string) => {
    (navigation as any).navigate('Hope' as never, { selectedLocation: loc } as never);
  };

  const handleUseTypedLocation = () => {
    const typed = q.trim();
    if (typed) selectLocation(typed);
  };

  const handleUseCurrentLocation = async () => {
    setLoading(true);
    try {
      const address = await getCurrentLocationString();
      selectLocation(address);
    } catch (e: any) {
      const isDenied = e?.code === 1 || (e?.message && /denied|access|permission/i.test(e.message));
      const msg = isDenied
        ? 'Location access was denied. Turn on Location in device Settings, or search and select your place above.'
        : e?.message || 'Could not get location. Search for your city above or use "Use this address".';
      Alert.alert('Location', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={leftArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Select Location</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search or type location (e.g. Jaipur, Rajasthan)"
            placeholderTextColor="#9CA3AF"
            value={q}
            onChangeText={setQ}
            autoFocus
          />
         <View style={styles.verticalDivider} />
                 <TouchableOpacity style={styles.micButton}>
                   <Image source={microphoneIcon} style={styles.micIcon} />
                 </TouchableOpacity>
        </View>
      </View>
      {q.trim().length > 0 && (
        <TouchableOpacity style={styles.useTypedBtn} onPress={handleUseTypedLocation}>
          <Text style={styles.useTypedBtnText}>Use this address</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.currentLocBtn, loading && { opacity: 0.7 }]}
        onPress={handleUseCurrentLocation}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#1E3A8A" />
        ) : (
          <View style={styles.currentLocIcon}>
            <Image source={gpsIcon} style={styles.pin} />
          </View>
        )}
        <Text style={styles.currentLocText}>
          {loading ? 'Getting location...' : 'Use my Current Location'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.searchHint}>
        {q.trim().length >= 2
          ? searchLoading
            ? 'Searching...'
            : searchResults.length
              ? 'Select a location'
              : 'No results – try another search or use "Use this address"'
          : 'Search for a city or area (min 2 characters)'}
      </Text>
      <FlatList
        data={searchResults}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.locRow} onPress={() => selectLocation(item.displayName)}>
            <Text style={styles.locTitle} numberOfLines={2}>{item.displayName}</Text>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={null}
      />
    </KeyboardAvoidingView>
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
    backgroundColor: '#FFFFFF',
  },
  backIcon: { height: 30, width: 30,marginRight:10 },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  headerSpacer: { width: 24 },
  searchWrap: { flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#D9DCE2',
    maxHeight: 56,
    marginHorizontal: 15, },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },

  micButton: {
    padding: 8,
  },
  micIcon: { width: 30,
    height: 30, },
  searchInput: { flex: 1,
    fontSize: 14,
    color: '#1F2937', },
  currentLocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    marginTop: 15,
    gap: 10,
    elevation: 0.5,
    marginHorizontal: 15,
    borderRadius: 16,
  },
  verticalDivider: {
    width: 2,
    backgroundColor: '#D9DCE2',
    alignSelf: 'stretch',
    marginLeft: 4,
    marginVertical: 5,
  },
  currentLocIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: { width: 24,
    height: 24, },
  currentLocText: { fontSize: 14, fontWeight: '700', color: '#111827' },
  useTypedBtn: {
    marginTop: 12,
    marginHorizontal: 15,
    paddingVertical: 14,
    backgroundColor: '#E0E7FF',
    borderRadius: 12,
    alignItems: 'center',
  },
  useTypedBtnText: { fontSize: 15, fontWeight: '600', color: '#3730A3' },
  searchHint: {
    fontSize: 13,
    color: '#6B7280',
    marginHorizontal: 15,
    marginTop: 8,
    marginBottom: 4,
  },
  listContent: { padding: 20, paddingTop: 10, paddingBottom: 24 },
  locRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  locTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  locSub: { fontSize: 12, color: '#6B7280', marginTop: 4 },
});

export default HopeChangeLocationScreen;


