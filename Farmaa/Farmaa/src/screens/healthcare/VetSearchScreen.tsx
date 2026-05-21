import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import microphoneIcon from '../../assets/images/microphone-2.png';
import leftArrow from '../../assets/images/arrow-left.png';

const VetSearchScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { searchQuery: initialQuery } = route.params as any;
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');

  const searchResults: any[] = []; // Empty for now
  const hasResults = searchResults.length > 0 && searchQuery.trim().length > 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header with Search */}
      <View style={styles.header}>
        <View style={styles.searchBox}>
          
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={leftArrow} style={styles.backIcon} />
        </TouchableOpacity>
        
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Vet Services"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          <View style={styles.verticalDivider} />
        <TouchableOpacity style={styles.micButton}>
          <Image source={microphoneIcon} style={styles.micIcon} />
        </TouchableOpacity>
        </View>
        </View>
        
      </View>

      {/* Search Results or Empty State */}
      {hasResults ? (
        <View style={styles.resultsContainer}>
          {/* Results list would go here */}
        </View>
      ) : searchQuery.trim() ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Nothing Matches Your Search</Text>
          <Text style={styles.emptyDescription}>
            Try changing your keywords or adjusting filters to find what you're
            looking for.
          </Text>
          <Text style={styles.emptySubtext}>
            Keep exploring - your pet's perfect find is out there.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.emptyButtonText}>Try Again →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Start typing to search...</Text>
        </View>
      )}
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
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 10,
  },
  backIcon: {
    width: 30,
    height: 30,
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
    borderColor: '#D9DCE2',
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
  },
  micButton: {
    padding: 8,
  },
  micIcon: {
    width: 30,
    height: 30,
  },
  resultsContainer: {
    flex: 1,
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    paddingTop: 100,
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
    paddingVertical: 18,
    paddingHorizontal: 36,
    borderRadius: 30,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
});

export default VetSearchScreen;

