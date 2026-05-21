import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import leftArrow from '../../assets/images/arrow-left.png';
import searchIcon from '../../assets/images/search-normal.png';
import sortIcon from '../../assets/images/arrow-3.png';
import microphoneIcon from '../../assets/images/microphone-2.png';
import gpsIcon from '../../assets/images/gps.png';
import { getCurrentLocationString, searchLocations, type LocationSuggestion } from '../../utils/geolocation';

const SEARCH_DEBOUNCE_MS = 500;

const CremationChangeLocationScreen = () => {
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

  const select = (location: string) => {
    (navigation as any).navigate('Cremation' as never, { selectedLocation: location } as never);
  };

  const handleUseTypedLocation = () => {
    const typed = q.trim();
    if (typed) select(typed);
  };

  const handleUseCurrentLocation = async () => {
    setLoading(true);
    try {
      const address = await getCurrentLocationString();
      select(address);
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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={leftArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Select Location</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Image source={searchIcon} style={styles.searchIconLeft} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search or type location (e.g. Jaipur, Rajasthan)"
            placeholderTextColor="#9CA3AF"
            value={q}
            onChangeText={setQ}
          />
          <View style={styles.verticalDivider} />   
          <TouchableOpacity>
            <Image source={microphoneIcon} style={styles.micIcon} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.sortButton} onPress={() => {}}>
        <Image source={sortIcon} style={styles.sortIcon} />
        </TouchableOpacity>
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
          <ActivityIndicator size="small" color="#1F2E46" />
        ) : (
          <View style={styles.currentLocIcon}>
            <Image source={gpsIcon} style={{ height: 26, width: 26 }} />
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
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.locRow} onPress={() => select(item.displayName)}>
            <Text style={styles.locTitle} numberOfLines={2}>{item.displayName}</Text>
          </TouchableOpacity>
        )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  backIcon: { width: 30, height: 30, color: '#111827', resizeMode: 'contain',marginRight:14 },
  title: { fontSize: 18, fontWeight: '800', color: '#111827' },
  headerSpacer: { width: 24 },
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
  useTypedBtn: {
    marginTop: 12,
    marginHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#E0E7FF',
    borderRadius: 12,
    alignItems: 'center',
  },
  useTypedBtnText: { fontSize: 15, fontWeight: '600', color: '#3730A3' },
  searchHint: {
    fontSize: 13,
    color: '#6B7280',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  currentLocBtn: {
    marginHorizontal: 16,
    marginTop: 6,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    elevation: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    
  },
  currentLocIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: { height: 18, width: 18  },
  currentLocText: { fontSize: 14, fontWeight: '800', color: '#111827' },
  listContent: { padding: 20, paddingTop: 10, paddingBottom: 24 },
  locRow: { paddingVertical: 14 },
  locTitle: { fontSize: 15, fontWeight: '800', color: '#111827' },
  locSub: { fontSize: 12, color: '#6B7280', marginTop: 4 },
});

export default CremationChangeLocationScreen;


