import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInputProps,
} from 'react-native';
import { searchLocations, type LocationSuggestion } from '../utils/geolocation';
import { isGooglePlacesConfigured } from '../utils/googlePlaces';

const DEBOUNCE_MS = 450;

type Props = Omit<TextInputProps, 'value' | 'onChangeText' | 'editable'> & {
  value: string;
  onChangeText: (text: string) => void;
  onSelectSuggestion?: (item: LocationSuggestion) => void;
  inputStyle?: object;
  containerStyle?: object;
};

/**
 * Location search that stays editable while suggestions load.
 * Do not bind Google Autocomplete widgets that set readonly.
 */
export default function LocationAutocompleteInput({
  value,
  onChangeText,
  onSelectSuggestion,
  placeholder = 'Search address or place',
  inputStyle,
  containerStyle,
  ...textInputProps
}: Props) {
  const [results, setResults] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = value.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const reqId = ++reqIdRef.current;
      setLoading(true);
      try {
        const list = await searchLocations(q);
        if (reqId === reqIdRef.current) setResults(list);
      } catch {
        if (reqId === reqIdRef.current) setResults([]);
      } finally {
        if (reqId === reqIdRef.current) setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  const pick = (item: LocationSuggestion) => {
    onChangeText(item.displayName);
    onSelectSuggestion?.(item);
    setResults([]);
  };

  return (
    <View style={[styles.wrap, containerStyle]}>
      <TextInput
        {...textInputProps}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        style={[styles.input, inputStyle]}
        editable
        autoCorrect={false}
        autoCapitalize="words"
        keyboardType="default"
      />
      {isGooglePlacesConfigured() ? (
        <Text style={styles.hint}>
          {loading ? 'Searching…' : 'Type freely, or pick a suggestion'}
        </Text>
      ) : (
        <Text style={styles.hint}>Type 2+ characters for location suggestions</Text>
      )}
      {loading && (
        <ActivityIndicator size="small" color="#1F2E46" style={styles.loader} />
      )}
      {results.length > 0 && (
        <View style={styles.list}>
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.row} onPress={() => pick(item)}>
                <Text style={styles.rowText} numberOfLines={2}>
                  {item.displayName}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative', zIndex: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#fff',
  },
  hint: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
  loader: { marginTop: 6 },
  list: {
    marginTop: 6,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  row: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
  },
  rowText: { fontSize: 14, color: '#374151' },
});
