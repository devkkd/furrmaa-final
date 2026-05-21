import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../config/api';
import microphoneIcon from '../../assets/images/microphone-2.png';
import heartIcon from '../../assets/images/heart.png';
import leftArrow from '../../assets/images/arrow-left.png';

const { width } = Dimensions.get('window');

interface SearchProduct {
  id: string;
  _id: string;
  name: string;
  price: string;
  oldPrice?: string;
  rating: number;
  reviews: number;
  image: string | null;
}

const mapApiProduct = (p: any): SearchProduct => {
  const priceNum = p.discountPrice ?? p.price ?? 0;
  const originalNum = p.price ?? p.discountPrice;
  const displayPrice = `₹${Number(priceNum).toLocaleString('en-IN')}`;
  const displayOld = originalNum && originalNum !== priceNum
    ? `₹${Number(originalNum).toLocaleString('en-IN')}`
    : undefined;
  return {
    id: p._id,
    _id: p._id,
    name: p.name || 'Product',
    price: displayPrice,
    oldPrice: displayOld,
    rating: Number(p.rating || 0),
    reviews: Array.isArray(p.reviews) ? p.reviews.length : 0,
    image: p.images?.[0] || p.image || null,
  };
};

const SearchScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [topPicks, setTopPicks] = useState<SearchProduct[]>([]);
  const [loadingTopPicks, setLoadingTopPicks] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.CLIENT.get(api.ENDPOINTS.PRODUCTS);
        const list = (res.data?.products || []) as any[];
        if (!cancelled) setTopPicks(list.slice(0, 9).map(mapApiProduct));
      } catch {
        if (!cancelled) setTopPicks([]);
      } finally {
        if (!cancelled) setLoadingTopPicks(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const t = setTimeout(async () => {
      setShowResults(true);
      setLoadingSearch(true);
      try {
        const res = await api.CLIENT.get(api.ENDPOINTS.PRODUCTS, {
          params: { search: searchQuery.trim() },
        });
        const list = (res.data?.products || []) as any[];
        setSearchResults(list.slice(0, 15).map(mapApiProduct));
      } catch {
        setSearchResults([]);
      } finally {
        setLoadingSearch(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleSearchSubmit = useCallback((query: string) => {
    const q = (query || searchQuery || '').trim();
    if (q) (navigation as any).navigate('Products' as never, { searchQuery: q } as never);
  }, [navigation, searchQuery]);

  const handleProductPress = useCallback((item: SearchProduct) => {
    (navigation as any).navigate('ProductDetail' as never, { productId: item._id, product: null } as never);
  }, [navigation]);

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Image source={leftArrow} style={styles.backIcon}  />
        </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="Search food, toys, meds & more.."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => handleSearchSubmit(searchQuery)}
          />
          <View style={styles.verticalDivider} />
          <TouchableOpacity style={styles.micButton}>
            <Image source={microphoneIcon} style={{width: 26, height: 26}} resizeMode="contain"/>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.sectionTitle}>
        {showResults ? 'Search results' : 'Top Picks for you'}
      </Text>
      {!showResults ? (
        loadingTopPicks ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#1F2E46" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <FlatList
            data={topPicks}
            keyExtractor={(item) => item._id}
            numColumns={3}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.gridContainer}
            renderItem={({ item: product }) => (
              <TouchableOpacity
                style={styles.productCard}
                onPress={() => handleProductPress(product)}
              >
                <View style={styles.imageWrapper}>
                  {product.image && typeof product.image === 'string' ? (
                    <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="cover" />
                  ) : (
                    <View style={styles.productImagePlaceholder}>
                      <Text style={styles.productEmoji}>🦴</Text>
                    </View>
                  )}
                  <TouchableOpacity style={styles.heartButton} onPress={() => toggleFavorite(product._id)}>
                    <Image source={heartIcon} style={{ width: 28, height: 28, tintColor: favorites[product._id] ? 'red' : '#1F2E46' }} resizeMode="contain" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.addButton} onPress={() => handleProductPress(product)}>
                    <Text style={styles.addButtonText}>ADD</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                <View style={styles.productRating}>
                  <Text style={styles.ratingStars}>{'⭐'.repeat(Math.min(5, Math.floor(product.rating)))}</Text>
                  <Text style={styles.reviewsText}>{product.reviews}</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.productPrice}>{product.price}</Text>
                  {product.oldPrice && <Text style={styles.originalPrice}>{product.oldPrice}</Text>}
                </View>
              </TouchableOpacity>
            )}
          />
        )
      ) : loadingSearch ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#1F2E46" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : searchResults.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Nothing Matches Your Search</Text>
          <Text style={styles.emptyDescription}>
            Try changing your keywords or tap Search to see all products.
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => handleSearchSubmit(searchQuery)}>
            <Text style={styles.emptyButtonText}>View all products →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item._id}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContainer}
          renderItem={({ item: product }) => (
            <TouchableOpacity style={styles.productCard} onPress={() => handleProductPress(product)}>
              <View style={styles.imageWrapper}>
                {product.image && typeof product.image === 'string' ? (
                  <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="cover" />
                ) : (
                  <View style={styles.productImagePlaceholder}>
                    <Text style={styles.productEmoji}>🦴</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.heartButton} onPress={() => toggleFavorite(product._id)}>
                  <Image source={heartIcon} style={{ width: 28, height: 28, tintColor: favorites[product._id] ? 'red' : '#1F2E46' }} resizeMode="contain" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.addButton} onPress={() => handleProductPress(product)}>
                  <Text style={styles.addButtonText}>ADD</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
              <View style={styles.productRating}>
                <Text style={styles.ratingStars}>{'⭐'.repeat(Math.min(5, Math.floor(product.rating)))}</Text>
                <Text style={styles.reviewsText}>{product.reviews}</Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.productPrice}>{product.price}</Text>
                {product.oldPrice && <Text style={styles.originalPrice}>{product.oldPrice}</Text>}
              </View>
            </TouchableOpacity>
          )}
        />
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
  },
  backButton: {
    marginRight: 10,
  },
  backIcon: {
    width: 30,
    height: 30,
    resizeMode:"contain",
    marginTop:4,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    marginRight: -10,
  },
  micButton: {
    marginLeft: 10,
    padding: 5,
  },
  micIcon: {
    fontSize: 20,
    color: '#6B7280',
  },
  section: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  topPicksContent: {
    paddingHorizontal: 15,
    gap: 15,
  },
  gridContainer: {
    paddingHorizontal: 12,
  },
  loadingWrap: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6B7280',
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productEmoji: {
    fontSize: 48,
  },
  productCard: {
  flex: 1,
  margin: 6,
  maxWidth: '30%', 
},

  imageWrapper: {
    width: '100%',
    height: 150,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },

  productImage: {
    width: '100%',
    height: '100%',
  },

  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 20,
    padding: 6,
  },

  addButton: {
    position: 'absolute',
      right: 10,
      bottom: 10,
      borderWidth: 1,
      borderColor: '#6D28D9',
      borderRadius: 9,
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: '#fff',
  },

  addButtonText: {
    color: '#1E3A8A',
    fontWeight: '600',
    fontSize: 13,
  },

  productName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },

  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  ratingStars: {
    fontSize: 13,
  },

  reviewsText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6B7280',
  },

  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginRight: 6,
  },

  originalPrice: {
    fontSize: 13,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },

  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  resultImage: {
    width: 40,
    height: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  resultImageIcon: {
    fontSize: 24,
  },
  resultText: {
    fontSize: 16,
    color: '#1F2937',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  emptyButton: {
    backgroundColor: '#1F2937',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
});

export default SearchScreen;
