import React, { useState, useEffect, useMemo } from 'react';
import {
  Image,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import { addProductToCart } from '../../services/cartService';
import { getProductImageUri, normalizeUrlList } from '../../utils/productImage';
import {
  mapProductReviews,
  formatReviewAuthor,
  starsForRating,
  fetchCanReviewProduct,
  submitProductReview,
} from '../../utils/productReviews';
import heartIcon from '../../assets/images/heart.png';
import leftArrow from '../../assets/images/arrow-left.png';

const { width } = Dimensions.get('window');

const ProductDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { product, productId } = (route.params as any) || {};
  const [productData, setProductData] = useState<any>(product || null);
  const [loading, setLoading] = useState(!product && !!productId);

  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    productInfo: false,
    measurements: false,
  });
  const [quantity, setQuantity] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const { user } = useAuth();

  const reviewList = useMemo(
    () => mapProductReviews(productData?.reviews),
    [productData?.reviews]
  );
  const reviewCount = reviewList.length;
  const avgRating = reviewCount > 0 ? Number(productData?.rating) || 0 : 0;

  const loadProduct = async (silent = false) => {
    const id = productId || productData?._id || product?._id;
    if (!id) return;
    try {
      if (!silent) setLoading(true);
      const response = await api.CLIENT.get(`${api.ENDPOINTS.PRODUCTS}/${id}`);
      if (response.data?.product) {
        setProductData(response.data.product);
      }
    } catch (error: any) {
      console.error('Failed to fetch product:', error);
      if (!productData) {
        Alert.alert('Error', 'Failed to load product details');
        navigation.goBack();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId && !product) {
      loadProduct();
    }
  }, [productId]);

  useFocusEffect(
    React.useCallback(() => {
      if (productData?._id || productId) {
        loadProduct(true);
      }
    }, [productData?._id, productId])
  );

  useEffect(() => {
    if (!user || !productData?._id) {
      setCanReview(false);
      return;
    }
    fetchCanReviewProduct(productData._id)
      .then((data) => setCanReview(data.allowed === true))
      .catch(() => setCanReview(false));
  }, [user, productData?._id]);

  useEffect(() => {
    if (productData?._id) {
      api.CLIENT.get(`${(api.ENDPOINTS.WISHLIST_CHECK || '/wishlist/check')}/${productData._id}`)
        .then((r) => setInWishlist(r.data?.inWishlist === true))
        .catch(() => setInWishlist(false));
    }
  }, [productData?._id]);

  const handleSubmitReview = async () => {
    if (!productData?._id || reviewRating < 1) return;
    setReviewSubmitting(true);
    try {
      await submitProductReview(productData._id, reviewRating, reviewComment);
      Alert.alert('Thank you', 'Your review has been published');
      setReviewRating(0);
      setReviewComment('');
      setCanReview(false);
      await loadProduct();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Could not submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  useEffect(() => {
    if (!productData?._id) return;
    let cancelled = false;
    (async () => {
      try {
        const params: any = {};
        if (productData.category) params.category = productData.category;
        const res = await api.CLIENT.get(api.ENDPOINTS.PRODUCTS, { params });
        const list = (res.data?.products || []) as any[];
        const similar = list
          .filter((p: any) => p._id !== productData._id)
          .slice(0, 6)
          .map((p: any) => {
            const priceNum = p.discountPrice ?? p.price ?? 0;
            const orig = p.price ?? p.discountPrice;
            return {
              id: p._id,
              _id: p._id,
              name: p.name || 'Product',
              price: `₹${Number(priceNum).toLocaleString('en-IN')}`,
              oldPrice: orig && orig !== priceNum ? `₹${Number(orig).toLocaleString('en-IN')}` : undefined,
              rating: Number(p.rating || 0),
              reviews: Array.isArray(p.reviews) ? p.reviews.length : 0,
              image: getProductImageUri(p),
            };
          });
        if (!cancelled) setSimilarProducts(similar);
      } catch {
        if (!cancelled) setSimilarProducts([]);
      }
    })();
    return () => { cancelled = true; };
  }, [productData?._id, productData?.category]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  if (!productData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Product not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Format product data for display
  const displayPrice = productData.discountPrice || productData.price || 0;
  const originalPrice = productData.discountPrice ? productData.price : null;
  const discount = originalPrice 
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : 0;

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const increaseQuantity = () => setQuantity(quantity + 1);
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const addToCart = async () => {
    if (!productData?._id) return;
    try {
      await addProductToCart(productData._id, quantity);
      setQuantity(quantity);
      Alert.alert('Added to cart', `${productData.name} added to your cart.`);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || e.message || 'Could not add to cart');
    }
  };

  const goToCart = () => {
    const price = productData.discountPrice ?? productData.price ?? 0;
    const orig = productData.discountPrice ? productData.price : price;
    const nav = (navigation as any).getParent?.() ?? navigation;
    nav.navigate('Cart' as never, {
      product: {
        _id: productData._id,
        name: productData.name,
        price: orig,
        discountPrice: price,
        discount: orig && orig !== price ? Math.round(((orig - price) / orig) * 100) : 0,
        image: productData.images?.[0] || productData.image,
        images: productData.images || [],
      },
      quantity: quantity,
    } as never);
  };

  const toggleWishlist = async () => {
    if (!productData?._id) return;
    try {
      if (inWishlist) {
        await api.CLIENT.delete(`${api.ENDPOINTS.WISHLIST}/${productData._id}`);
        setInWishlist(false);
      } else {
        await api.CLIENT.post(`${api.ENDPOINTS.WISHLIST}/${productData._id}`);
        setInWishlist(true);
      }
    } catch (e: any) {
      if (e?.response?.status === 401) (navigation as any).navigate('Login' as never);
    }
  };

  const hasItemsInCart = quantity > 0;
  const mainProductImage = getProductImageUri(productData);
  const productImageList = normalizeUrlList(productData?.images);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Image source={leftArrow} style={styles.backIcon} />
          </TouchableOpacity>
        </View>

        {/* Product Image */}
        <View style={styles.imageContainer}>
          <TouchableOpacity style={styles.wishlistIconMain} onPress={toggleWishlist}>
            <Image
              source={heartIcon}
              style={{ width: 24, height: 24, tintColor: inWishlist ? 'red' : '#1F2937' }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          {mainProductImage && typeof mainProductImage === 'string' ? (
            <Image source={{ uri: mainProductImage }} style={styles.productImage} resizeMode="contain" />
          ) : (
            <Text style={styles.productEmoji}>🦴</Text>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.content}>
          <Text style={styles.productName}>{productData.name}</Text>
          <Text style={styles.brand}>Brand: {productData.brand}</Text>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            {reviewCount > 0 ? (
              <>
                <Text style={styles.ratingStars}>{starsForRating(avgRating)}</Text>
                <Text style={styles.ratingText}>
                  {avgRating} | {reviewCount} review{reviewCount === 1 ? '' : 's'}
                </Text>
              </>
            ) : (
              <Text style={styles.noReviewsYet}>No reviews yet</Text>
            )}
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <Text style={styles.productPrice}>₹{displayPrice.toLocaleString('en-IN')}</Text>
              {originalPrice && (
                <Text style={styles.originalPrice}>
                  ₹{originalPrice.toLocaleString('en-IN')}
                </Text>
              )}
              {discount > 0 && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    {discount}% OFF
                  </Text>
                </View>
              )}
            </View>
            {productData.pricePerUnit && (
              <Text style={styles.pricePerUnit}>
                ({productData.pricePerUnit})
              </Text>
            )}
          </View>

          {/* Quantity Selector */}
          {hasItemsInCart && (
            <View style={styles.quantitySection}>
              <Text style={styles.quantityLabel}>Quantity:</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={decreaseQuantity}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={increaseQuantity}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Product Information Section */}
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('productInfo')}
          >
            <Text style={styles.sectionTitle}>Product Information</Text>
            <Text style={styles.dropdownIcon}>
              {expandedSections.productInfo ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
          {expandedSections.productInfo && (
            <View style={styles.sectionContent}>
              {/* Measurements Sub-section */}
              <View style={styles.subSection}>
                <Text style={styles.subSectionTitle}>Measurements</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Unit Count:</Text>
                  <Text style={styles.detailValue}>
                    {productData.unitCount || '200000 gram'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Number Of Items:</Text>
                  <Text style={styles.detailValue}>
                    {productData.numberOfItems || 1}
                  </Text>
                </View>
                {productData.itemWeight && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Item Weight:</Text>
                    <Text style={styles.detailValue}>
                      {productData.itemWeight}
                    </Text>
                  </View>
                )}
              </View>

              {/* Item Details Sub-section */}
              <View style={styles.subSection}>
                <Text style={styles.subSectionTitle}>Item Details</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Brand Name:</Text>
                  <Text style={styles.detailValue}>
                    {productData.brandName || productData.brand}
                  </Text>
                </View>
                {productData.flavor && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Flavor:</Text>
                    <Text style={styles.detailValue}>{productData.flavor}</Text>
                  </View>
                )}
                {productData.ageRange && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>
                      Age Range Description:
                    </Text>
                    <Text style={styles.detailValue}>
                      {productData.ageRange}
                    </Text>
                  </View>
                )}
                {productData.itemForm && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Item Form:</Text>
                    <Text style={styles.detailValue}>
                      {productData.itemForm}
                    </Text>
                  </View>
                )}
                {productData.specialIngredients && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>
                      Special Ingredients:
                    </Text>
                    <Text style={styles.detailValue}>
                      {productData.specialIngredients}
                    </Text>
                  </View>
                )}
                {productData.asin && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>ASIN:</Text>
                    <Text style={styles.detailValue}>{productData.asin}</Text>
                  </View>
                )}
                {productData.itemHSN && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Item HSN:</Text>
                    <Text style={styles.detailValue}>
                      {productData.itemHSN}
                    </Text>
                  </View>
                )}
                {productData.manufacturer && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Manufacturer:</Text>
                  <Text style={styles.detailValue}>
                    {productData.manufacturer}
                  </Text>
                </View>
              )}
              {productData.manufacturerContactInfo && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Manufacturer Contact Info:</Text>
                  <Text style={styles.detailValue}>
                    {productData.manufacturerContactInfo}
                  </Text>
                </View>
              )}
              </View>
            </View>
          )}
        </View>

        {/* Reviews Section */}
          
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.reviewsTitle}>Ratings & Reviews</Text>
            {reviewCount > 0 && (
              <TouchableOpacity
                onPress={() =>
                  (navigation as any).navigate('AllReviews', {
                    productId: productData._id,
                    productName: productData.name,
                    rating: avgRating,
                    reviewCount,
                    reviews: productData.reviews,
                  })
                }
              >
                <Text style={styles.seeAllText}>See all →</Text>
              </TouchableOpacity>
            )}
          </View>

          {reviewCount > 0 && (
            <View style={styles.ratingRow}>
              <Text style={styles.stars}>{starsForRating(avgRating)}</Text>
              <Text style={styles.ratingText}>
                {avgRating} · {reviewCount} review{reviewCount === 1 ? '' : 's'}
              </Text>
            </View>
          )}

          {reviewCount === 0 && !canReview && (
            <Text style={styles.emptyReviews}>
              No reviews yet. Purchase this product and share your experience after delivery.
            </Text>
          )}

          {canReview && (
            <View style={styles.writeReviewBox}>
              <Text style={styles.writeReviewTitle}>Write a review</Text>
              <View style={styles.starPickRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                    <Text style={styles.starPick}>{star <= reviewRating ? '⭐' : '☆'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.reviewInput}
                placeholder="Share your experience (optional)"
                placeholderTextColor="#9CA3AF"
                value={reviewComment}
                onChangeText={setReviewComment}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.submitReviewBtn,
                  (reviewRating < 1 || reviewSubmitting) && styles.submitReviewBtnDisabled,
                ]}
                onPress={handleSubmitReview}
                disabled={reviewRating < 1 || reviewSubmitting}
              >
                {reviewSubmitting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.submitReviewBtnText}>Submit review</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {reviewList.slice(0, 3).map((rev, idx) => (
            <View key={rev._id || `rev-${idx}`} style={styles.reviewCard}>
              <Text style={styles.stars}>{starsForRating(rev.rating)}</Text>
              {rev.comment ? (
                <Text style={styles.reviewText}>{rev.comment}</Text>
              ) : null}
              <Text style={styles.reviewAuthor}>{formatReviewAuthor(rev)}</Text>
            </View>
          ))}
        </View>


      {/* Similar Products Section */}
        <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Similar Products</Text>
          
        </View>

        <View style={styles.productsGrid}>
          {similarProducts.map((product) => (
            <TouchableOpacity
              key={product._id}
              style={styles.productCard}
              onPress={() => (navigation as any).navigate('ProductDetail' as never, { productId: product._id, product: null } as never)}
            >
              <TouchableOpacity style={styles.wishlistIcon}>
                <Image source={heartIcon} style={{ width: 20, height: 20 }} resizeMode="contain" />
              </TouchableOpacity>
              {product.image && typeof product.image === 'string' ? (
                <Image source={{ uri: product.image }} style={styles.similarProductImage} resizeMode="contain" />
              ) : (
                <View style={[styles.similarProductImage, { backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={{ fontSize: 32 }}>🦴</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => (navigation as any).navigate('ProductDetail' as never, { productId: product._id, product: null } as never)}
              >
                <Text style={styles.addButtonText}>ADD</Text>
              </TouchableOpacity>
              <Text style={styles.similarProductName} numberOfLines={2}>{product.name}</Text>
              <View style={styles.productRating}>
                <Text style={styles.similarRatingStars}>{'⭐'.repeat(Math.min(5, Math.floor(product.rating)))}</Text>
                <Text style={styles.reviewsText}> {product.reviews}</Text>
              </View>
              <View style={styles.similarPriceRow}>
                <Text style={styles.similarProductPrice}>{product.price}</Text>
                {product.oldPrice && <Text style={styles.similarOldPrice}>{product.oldPrice}</Text>}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {hasItemsInCart ? (
          <View style={styles.cartFooter}>
            <Text style={styles.cartTotal}>
              ₹{displayPrice.toLocaleString('en-IN')} × {quantity}
            </Text>
            <TouchableOpacity
              style={styles.goToCartButton}
              onPress={goToCart}
            >
              <Text style={styles.goToCartText}>Go to Cart +</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => {
              const price = productData.discountPrice ?? productData.price ?? 0;
              const orig = productData.discountPrice ? productData.price : price;
              const nav = (navigation as any).getParent?.() ?? navigation;
              nav.navigate('Cart' as never, {
                product: {
                  _id: productData._id,
                  name: productData.name,
                  price: orig,
                  discountPrice: price,
                  discount: orig > price ? Math.round(((orig - price) / orig) * 100) : 0,
                  image: productData.images?.[0] || productData.image,
                  images: productData.images || [],
                },
                quantity: quantity,
              } as never);
            }}
          >
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 15,
    zIndex: 1,
  },
  backButton: {
    padding: 5,
    
  },
  backIcon: {
    width: 28,
    height: 28,
  },
  imageContainer: {
    width: '100%',
    height: 350,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
    productImage: {
    width: '100%',
    height: '70%',
    top: 20,
  },
  productEmoji: {
    fontSize: 150,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 24,
  },
  brand: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 8,
  },
  ratingStars: {
    fontSize: 16,
  },
  ratingText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  noReviewsYet: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  emptyReviews: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  writeReviewBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  writeReviewTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10,
  },
  starPickRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  starPick: { fontSize: 28 },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    minHeight: 72,
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  submitReviewBtn: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitReviewBtnDisabled: { opacity: 0.5 },
  submitReviewBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
  priceContainer: {
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 12,
    flexWrap: 'wrap',
  },
  productPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  originalPrice: {
    fontSize: 18,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#EF4444',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pricePerUnit: {
    fontSize: 14,
    color: '#6B7280',
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingVertical: 10,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    minWidth: 30,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  dropdownIcon: {
    fontSize: 16,
    color: '#6B7280',
  },
  sectionContent: {
    paddingTop: 15,
    // paddingBottom: 10,
  },
  subSection: {
    // marginBottom: 20,
  },
  subSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    flex: 1,
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  addToCartButton: {
    backgroundColor: '#1F2937',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  reviewsSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },

  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  reviewsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },

  seeAllText: {
    fontSize: 13,
    color: '#111827',
    fontWeight: 'bold',
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  stars: {
    color: '#F59E0B',
    fontSize: 14,
    marginRight: 6,
  },

  reviewCard: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },

  reviewText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    marginVertical: 6,
  },

  reviewAuthor: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },

  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  productCard: {
    width: '31%',  
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 5,
    marginBottom: 15,
    position: 'relative',
      elevation: 0,
    shadowColor: 'transparent',
  },


  wishlistIcon: {
    width: 24,
    height: 24,
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  wishlistIconMain: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
  },

  similarProductImage: {
    width: '100%',
    height: 120,
    marginBottom: 8,
    resizeMode: 'contain',
  },

  addButton: {
    position: 'absolute',
    right: 10,
    top: 95,
    borderWidth: 1,
    borderColor: '#6D28D9',
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },

  addButtonText: {
    color: '#6D28D9',
    fontWeight: '600',
    fontSize: 12,
  },

  similarProductName: {
    fontSize: 13,
    color: '#111827',
    marginTop: 10,
  },

  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },

  similarRatingStars: {
    color: '#F59E0B',
    fontSize: 12,
  },

  reviewsText: {
    fontSize: 11,
    color: '#6B7280',
  },

  similarPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  similarProductPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },

  similarOldPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  cartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  goToCartButton: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 45,
    paddingVertical: 18,
    borderRadius: 30,
  },
  goToCartText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
});

export default ProductDetailScreen;

