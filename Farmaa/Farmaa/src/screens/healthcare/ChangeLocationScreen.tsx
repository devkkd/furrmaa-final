import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import gpsIcon from '../../assets/images/gps.png';
import microphoneIcon from '../../assets/images/microphone-2.png';
import leftArrow from '../../assets/images/arrow-left.png';
import { getCurrentLocationWithCoords, searchLocations, type LocationSuggestion } from '../../utils/geolocation';

const SEARCH_DEBOUNCE_MS = 500;

const ChangeLocationScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<LocationSuggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchLocations(q);
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
  }, [searchQuery]);

  const handleUseCurrentLocation = async () => {
    setLoading(true);
    try {
      const { address, lat, lng } = await getCurrentLocationWithCoords();
      (navigation as any).navigate('Veterinarians' as never, {
        selectedLocation: address,
        selectedCoords: { lat, lng },
      } as never);
    } catch (e: any) {
      const isDenied = e?.code === 1 || (e?.message && /denied|access|permission/i.test(e.message));
      const msg = isDenied
        ? 'Location access was denied. Please turn on Location in your device Settings, or search and select your place above.'
        : e?.message || 'Could not get your location. Search for your city above or use "Use this address".';
      Alert.alert('Location', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = (location: string, coords?: { lat: number; lng: number }) => {
    (navigation as any).navigate('Veterinarians' as never, {
      selectedLocation: location,
      ...(coords && { selectedCoords: coords }),
    } as never);
  };

  const handleSelectSearchResult = (item: LocationSuggestion) => {
    handleSelectLocation(item.displayName, { lat: item.lat, lng: item.lng });
  };

  const handleUseTypedLocation = () => {
    const typed = searchQuery.trim();
    if (typed) handleSelectLocation(typed);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={leftArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Location</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchBox}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search or type location (e.g. Jaipur, Rajasthan)"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View style={styles.verticalDivider} />
          <TouchableOpacity style={styles.micButton}>
            <Image source={microphoneIcon} style={styles.micIcon} />
          </TouchableOpacity>
        </View>
      </View>

      {searchQuery.trim().length > 0 && (
        <TouchableOpacity
          style={styles.useTypedButton}
          onPress={handleUseTypedLocation}
        >
          <Text style={styles.useTypedButtonText}>Use this address</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.currentLocationButton, loading && styles.buttonDisabled]}
        onPress={handleUseCurrentLocation}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#1F2E46" />
        ) : (
          <Image source={gpsIcon} style={styles.locationIcon} />
        )}
        <Text style={styles.currentLocationText}>
          {loading ? 'Getting location...' : 'Use my Current Location'}
        </Text>
      </TouchableOpacity>

      <ScrollView style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>
          {searchQuery.trim().length >= 2
            ? searchLoading
              ? 'Searching...'
              : searchResults.length
                ? 'Select a location'
                : 'No results – try another search or use "Use this address"'
            : 'Search for a city or area (min 2 characters)'}
        </Text>
        {!searchLoading && searchResults.length > 0 && (
          <>
            {searchResults.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.locRow}
                onPress={() => handleSelectSearchResult(item)}
              >
                <Text style={styles.locTitle} numberOfLines={2}>{item.displayName}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
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
    backgroundColor: '#FFFFFF',
  },
  backIcon: {
    width: 30,
    height: 30,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 24,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#D9DCE2',
    maxHeight: 56,
    marginHorizontal: 15,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  verticalDivider: {
    width: 2,
    backgroundColor: '#D9DCE2',
    alignSelf: 'stretch',
    marginLeft: 4,
    marginVertical: 5,
  },
  micButton: {
    padding: 8,
  },
  micIcon: {
    width: 30,
    height: 30,
  },
  useTypedButton: {
    marginTop: 12,
    marginHorizontal: 15,
    paddingVertical: 14,
    backgroundColor: '#E0E7FF',
    borderRadius: 12,
    alignItems: 'center',
  },
  useTypedButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3730A3',
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    marginTop: 15,
    gap: 10,
    elevation: 1,
    marginHorizontal: 15,
    borderRadius: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  locationIcon: {
    width: 24,
    height: 24,
  },
  currentLocationText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  suggestionsContainer: {
    flex: 1,
    padding: 20,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  locRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  locTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  locSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
});

export default ChangeLocationScreen;
