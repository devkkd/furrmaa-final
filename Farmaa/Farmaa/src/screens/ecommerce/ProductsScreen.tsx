import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../../config/api';
import { getBackendCategory } from '../../utils/productCategories';
import heartIcon from '../../assets/images/heart.png';
import microphoneIcon from '../../assets/images/microphone-2.png';
import searchIcon from '../../assets/images/search-normal.png';
import sortIcon from '../../assets/images/arrow-3.png';
import filterIcon from '../../assets/images/setting-4.png';
import leftArrow from '../../assets/images/arrow-left.png';
import { getProductImageUri } from '../../utils/productImage';

interface Product {
  id: number;
  _id?: string; // Backend product ID for navigation
  name: string;
  price: string;
  originalPrice?: string;
  discount?: number;
  rating: number;
  reviews: number;
  image: string;
  category?: string;
  inCart?: boolean;
  quantity?: number;
}

const ProductsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const routeParams = (route.params as any) || {};

  const [selectedPet, setSelectedPet] = useState<'dog' | 'cat'>(
    routeParams.petType || 'dog'
  );
  const [searchQuery, setSearchQuery] = useState(routeParams.searchQuery || '');
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState('Popularity');
  const [filters, setFilters] = useState(routeParams.filters || {});

  useEffect(() => {
    const p = (route.params as any) || {};
    if (p.petType) setSelectedPet(p.petType);
    if (p.filters) setFilters(p.filters);
  }, [route.params]);
  const [isListening, setIsListening] = useState(false);

  // No dummy data - all data from backend
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});
  const [cartItems, setCartItems] = useState<{ [key: number]: number }>({});
  const [loadingProducts, setLoadingProducts] = useState(true);

  const fetchWishlistStatus = async () => {
    try {
      const res = await api.CLIENT.get(api.ENDPOINTS.WISHLIST);
      if (res.data?.wishlist) {
        const map: { [key: string]: boolean } = {};
        res.data.wishlist.forEach((w: any) => {
          if (w.product?._id) map[w.product._id] = true;
        });
        setFavorites(map);
      }
    } catch {
      setFavorites({});
    }
  };

  useEffect(() => {
    fetchWishlistStatus();
  }, []);

  const toggleFavorite = async (productId: string | number, productIdBackend: string) => {
    try {
      const inWishlist = favorites[productIdBackend];
      if (inWishlist) {
        await api.CLIENT.delete(`${api.ENDPOINTS.WISHLIST}/${productIdBackend}`);
        setFavorites((prev) => ({ ...prev, [productIdBackend]: false }));
      } else {
        await api.CLIENT.post(`${api.ENDPOINTS.WISHLIST}/${productIdBackend}`);
        setFavorites((prev) => ({ ...prev, [productIdBackend]: true }));
      }
    } catch (e: any) {
      if (e?.response?.status === 401) {
        (navigation as any).navigate('Login' as never);
      }
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);

      // Build query parameters
      const params: any = {};

      // Category filter – map UI names to backend enum (food, toys, health, etc.)
      if (filters?.category && filters.category.length > 0) {
        const backendCats = filters.category
          .map((c: string) => getBackendCategory(c))
          .filter(Boolean);
        if (backendCats.length > 0) {
          params.category = backendCats.join(',');
        }
      }

      // Pet type filter
      if (selectedPet) {
        params.petType = selectedPet;
      }

      // Search query
      if (searchQuery?.trim()) {
        params.search = searchQuery.trim();
      }

      // Sort by
      const sortByMap: { [key: string]: string } = {
        'Popularity': 'popularity',
        'New Arrivals': 'newest',
        'Price: Low to High': 'price-low',
        'Price: High to Low': 'price-high',
      };
      if (sortBy && sortByMap[sortBy]) {
        params.sortBy = sortByMap[sortBy];
      }

      // Price range filter
      if (filters?.minPrice) {
        params.minPrice = filters.minPrice;
      }
      if (filters?.maxPrice) {
        params.maxPrice = filters.maxPrice;
      }

      // Rating filter
      if (filters?.rating && filters.rating.length > 0) {
        const minRating = Math.min(...filters.rating.map((r: string) => parseInt(r.charAt(0))));
        params.minRating = minRating;
      }

      // Size filter (slug from ProductSize)
      if (filters?.size && filters.size.length > 0) {
        params.size = Array.isArray(filters.size) ? filters.size.join(',') : filters.size;
      }
      // Dietary filter (slugs from ProductDietary)
      if (filters?.dietary && filters.dietary.length > 0) {
        params.dietary = Array.isArray(filters.dietary) ? filters.dietary.join(',') : filters.dietary;
      }

      const res = await api.CLIENT.get(api.ENDPOINTS.PRODUCTS, { params });
      const apiProducts = (res.data?.products || []) as any[];

      const mapped: Product[] = apiProducts.map((p: any) => {
        const priceNum = p.discountPrice ?? p.price ?? 0;
        const originalNum = p.price ?? p.discountPrice;
        const displayPrice = `₹${Number(priceNum).toLocaleString('en-IN')}`;
        const displayOriginal =
          originalNum && originalNum !== priceNum
            ? `₹${Number(originalNum).toLocaleString('en-IN')}`
            : undefined;
        const discount =
          displayOriginal && originalNum
            ? Math.round(((originalNum - priceNum) / originalNum) * 100)
            : undefined;

        return {
          id: Number(String(p._id).slice(-6).replace(/\D/g, '')) || Math.floor(Math.random() * 1000000),
          _id: p._id,
          name: p.name || 'Product',
          price: displayPrice,
          originalPrice: displayOriginal,
          discount,
          rating: Number(p.rating || 0),
          reviews: Array.isArray(p.reviews) ? p.reviews.length : 0,
          image: getProductImageUri(p),
          category: (p.category || 'Food')?.toString()?.replace(/^./, (c: string) => c.toUpperCase()),
        };
      });

      setAllProducts(mapped);
      setProducts(mapped); // Set products directly from API response (already filtered by category)
    } catch (e) {
      // No fallback - show empty state if API fails
      console.error('Failed to fetch products:', e);
      setAllProducts([]);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch products when pet type, filters, search query, or sort changes
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPet, filters, searchQuery, sortBy]);

  // Update products when allProducts changes (from backend)
  useEffect(() => {
    setProducts(allProducts);
  }, [allProducts]);

  const filteredProducts = products;

  const handleAddToCart = (item: Product) => {
    const productId = item.id;
    const newQuantity = (cartItems[productId] || 0) + 1;
    setCartItems((prev) => ({ ...prev, [productId]: newQuantity }));
    const priceNum = parseInt(item.price.replace(/[₹,]/g, ''), 10) || 0;
    const originalNum = item.originalPrice ? parseInt(item.originalPrice.replace(/[₹,]/g, ''), 10) : priceNum;
    const discountPct = item.discount ?? (originalNum > priceNum ? Math.round(((originalNum - priceNum) / originalNum) * 100) : 0);
    const cartPayload = {
      product: {
        _id: item._id,
        name: item.name,
        price: originalNum,
        discountPrice: priceNum,
        discount: discountPct,
        image: item.image && typeof item.image === 'string' ? item.image : undefined,
        images: item.image ? [item.image] : [],
      },
      quantity: newQuantity,
    };
    const nav = navigation.getParent?.() ?? navigation;
    (nav as any).navigate('Cart', cartPayload);
  };

  const handleQuantityChange = (productId: number, change: number) => {
    setCartItems((prev) => {
      const newQuantity = (prev[productId] || 0) + change;
      if (newQuantity <= 0) {
        const newItems = { ...prev };
        delete newItems[productId];
        return newItems;
      }
      return { ...prev, [productId]: newQuantity };
    });
  };

  const handleVoiceSearch = async () => {
    // For now, show a simple prompt
    // In production, integrate with @react-native-voice/voice package:
    // import Voice from '@react-native-voice/voice';
    // 
    // Example implementation:
    // try {
    //   setIsListening(true);
    //   await Voice.start('en-US');
    //   Voice.onSpeechResults = (e) => {
    //     if (e.value && e.value.length > 0) {
    //       setSearchQuery(e.value[0]);
    //       setIsListening(false);
    //     }
    //   };
    // } catch (error) {
    //   console.error('Voice search error:', error);
    //   setIsListening(false);
    // }

    // Temporary: Show alert for voice search
    // In production, replace with actual voice recognition
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      // For demo: You can manually set a search query here
      // setSearchQuery('dog food');
    }, 2000);
  };


  const sortOptions = [
    'Popularity',
    'New Arrivals',
    'Price: Low to High',
    'Price: High to Low',
  ];

  const hasItemsInCart = Object.keys(cartItems).length > 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Image source={leftArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {searchQuery.trim()
            ? `Search: ${searchQuery.trim()}`
            : filters?.category?.length
              ? filters.category[0].charAt(0).toUpperCase() + filters.category[0].slice(1)
              : selectedPet === 'cat'
                ? 'Cat Products'
                : 'Dog Products'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search and Filter Bar */}
      <View style={styles.searchFilterBar}>
        <View style={styles.searchBox}>
          <Image source={searchIcon} style={{ width: 24, height: 24, marginRight: 10 }} resizeMode="contain" />

          <TextInput
            style={styles.searchInput}
            placeholder="Search food"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View style={styles.verticalDivider} />
          <TouchableOpacity
            style={[styles.micButton, isListening && styles.micButtonActive]}
            onPress={handleVoiceSearch}
          >
            <Image
              source={microphoneIcon}
              style={[styles.micIcon, isListening && styles.micIconActive]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => setShowSortModal(true)}
          style={styles.iconButton}
        >
          <Image source={sortIcon} style={{ width: 24, height: 24 }} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            (navigation as any).navigate('Filter', { filters, petType: selectedPet })
          }
          style={styles.filterButton}
        >
          <Image source={filterIcon} style={{ width: 20, height: 20 }} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {/* Products Grid */}
      {loadingProducts ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Products Found</Text>
          <Text style={styles.emptyDescription}>
            {filters?.category && filters.category.length > 0
              ? `No products found in ${filters.category[0]} category. Try browsing other categories.`
              : searchQuery
                ? 'No products match your search. Try different keywords.'
                : 'No products available at the moment. Please check back later.'}
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => {
              setSearchQuery('');
              setFilters({});
              fetchProducts();
            }}
          >
            <Text style={styles.emptyButtonText}>Browse All Products →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          numColumns={3}
          keyExtractor={(item) => (item._id || item.id).toString()}
          contentContainerStyle={styles.productsGrid}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={({ item }) => {
            const quantity = cartItems[item.id] || 0;
            const inCart = quantity > 0;

            return (
              <TouchableOpacity
                style={styles.productCard}
                onPress={() => {
                  // Use _id from item (backends product ID)
                  const productIdForNav = item._id || item.id.toString();
                  (navigation as any).navigate('ProductDetail', {
                    productId: productIdForNav,
                    product: null,
                  });
                }}
              >
                <View style={styles.imageContainer}>
                  <TouchableOpacity
                    style={styles.heartButton}
                    onPress={() => item._id && toggleFavorite(item.id, item._id)}
                  >
                    <Image source={heartIcon} style={{ width: 24, height: 24, tintColor: favorites[item._id] ? 'red' : '#1F2E46' }} resizeMode="contain" />
                  </TouchableOpacity>
                  <View style={styles.productImagePlaceholder}>
                    {item.image && typeof item.image === 'string' ? (
                      <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="contain" />
                    ) : (
                      <Text style={styles.productEmoji}>
                        {selectedPet === 'dog' ? '🦴' : '🐟'}
                      </Text>
                    )}
                  </View>
                </View>
                {!inCart ? (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => handleAddToCart(item)}
                  >
                    <Text style={styles.addButtonText}>ADD</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleQuantityChange(item.id, -1)}
                    >
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleQuantityChange(item.id, 1)}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <Text style={styles.productName} numberOfLines={2}>
                  {item.name}
                </Text>

                <View style={styles.productRating}>
                  <Text style={styles.ratingStars}>
                    {'⭐'.repeat(Math.floor(item.rating))}
                  </Text>
                  <Text style={styles.reviewsText}>
                    {item.rating} | {item.reviews}
                  </Text>
                </View>

                <View style={styles.priceContainer}>
                  <Text style={styles.productPrice}>{item.price}</Text>
                  {item.originalPrice && (
                    <Text style={styles.originalPrice}>{item.originalPrice}</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />


      )}

      {/* Go to Cart Button */}
      {products.length > 0 && hasItemsInCart && (
        <View style={styles.cartButton}>
          <Text style={styles.cartTotal}>
            ₹{Object.keys(cartItems).reduce((total, productId) => {
              const product = products.find((p) => p.id === parseInt(productId, 10));
              const qty = cartItems[parseInt(productId, 10)];
              const price = parseInt(product?.price.replace(/[₹,]/g, '') || '0', 10);
              return total + price * qty;
            }, 0).toLocaleString('en-IN')}
          </Text>
          <TouchableOpacity
            style={styles.goToCartButton}
            onPress={() => {
            const firstId = Object.keys(cartItems)[0];
            const firstProduct = firstId ? products.find((p) => p.id === parseInt(firstId, 10) || p._id === firstId) : null;
            const qty = firstProduct ? (cartItems[firstProduct.id] || 0) : 0;
            if (firstProduct && qty > 0) {
              const priceNum = parseInt(firstProduct.price.replace(/[₹,]/g, ''), 10) || 0;
              const originalNum = firstProduct.originalPrice ? parseInt(firstProduct.originalPrice.replace(/[₹,]/g, ''), 10) : priceNum;
              const nav = navigation.getParent?.() ?? navigation;
              (nav as any).navigate('Cart', {
                product: {
                  _id: firstProduct._id,
                  name: firstProduct.name,
                  price: originalNum,
                  discountPrice: priceNum,
                  image: firstProduct.image && typeof firstProduct.image === 'string' ? firstProduct.image : undefined,
                  images: firstProduct.image ? [firstProduct.image] : [],
                },
                quantity: qty,
              });
            } else {
              const nav = navigation.getParent?.() ?? navigation;
              (nav as any).navigate('Cart', {});
            }
          }}
          >
            <Text style={styles.goToCartButtonText}>Go to Cart +</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Sort Modal */}
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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort By</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <View style={styles.closeButton}>
                  <Text style={styles.closeIcon}>✕</Text>
                </View>
              </TouchableOpacity>
            </View>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.sortOption}
                onPress={() => {
                  setSortBy(option);
                  setShowSortModal(false);
                }}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortBy === option && styles.sortOptionTextSelected,
                  ]}
                >
                  {option}
                </Text>
                {sortBy === option && (
                  <View style={styles.radioSelected}>
                    <View style={styles.radioInner} />
                  </View>
                )}
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
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 5,
  },
  backIcon: {
    width: 30,
    height: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',

  },
  placeholder: {
    width: 34,
  },
  searchFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
    color: '#6B7280',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  micButton: {
    marginLeft: 10,
    padding: 5,
  },
  micButtonActive: {
    backgroundColor: '#FEE2E2',
    borderRadius: 20,
  },
  micIcon: {
    width: 26,
    height: 26,
  },
  micIconActive: {
    tintColor: '#EF4444',
  },

  verticalDivider: {
    width: 2,
    backgroundColor: '#D9DCE2',
    alignSelf: 'stretch',
    marginLeft: 4,
    marginRight: -10,

  },
  iconButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#11295a',
    borderRadius: 16,
  },
  filterButton: {
    padding: 12,
    backgroundColor: '#1F2E46',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterIcon: {
    fontSize: 20,
    color: '#1F2937',
  },
  productsGrid: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },

  columnWrapper: {
    justifyContent: 'space-between',
  },

  productCard: {
    width: '32%',
    marginBottom: 16,
  },

  imageContainer: {
    width: '100%',
    height: 130,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  productEmoji: {
    fontSize: 42,
  },

  heartButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 2,
  },

  addButton: {
    position: 'absolute',
    right: 10,
    bottom: 80,
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
    fontSize: 12,
  },

  quantityContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#1E3A8A',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  quantityButton: {
    paddingHorizontal: 6,
  },

  quantityButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  quantityText: {
    fontSize: 13,
    fontWeight: '600',
  },

  productName: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
  },

  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },

  ratingStars: {
    fontSize: 10,
  },

  reviewsText: {
    fontSize: 10,
    color: '#6B7280',
    marginLeft: 4,
  },

  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  productPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  productImage: {
    width: '100%',
    height: 120,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  productImagePlaceholder: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  originalPrice: {
    fontSize: 11,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  cartButton: {
    position: 'absolute',
    bottom: 20,
    left: 15,
    right: 15,
    backgroundColor: '#1F2937',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  goToCartButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  goToCartButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: '#6B7280',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  sortOptionTextSelected: {
    fontWeight: '600',
    color: '#1E3A8A',
  },
  radioSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1E3A8A',
  },
});

export default ProductsScreen;
