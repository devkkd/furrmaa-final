import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import api from '../../config/api';
import product1Image from '../../assets/images/dogProduct1.png';
import {
  fetchServerCart,
  addProductToCart,
  updateCartItemQuantity,
  removeFromCart,
  validateCoupon,
  linesToCheckoutItems,
  type CartLine,
} from '../../services/cartService';
interface Address {
  _id: string;
  type: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  landmark?: string;
  isDefault: boolean;
}

const CartScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const routeParams = (route.params as any) || {};
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [address, setAddress] = useState<Address | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(true);

  const loadCart = async () => {
    try {
      setLoadingCart(true);
      const productFromRoute = routeParams.product;
      if (productFromRoute?._id) {
        await addProductToCart(productFromRoute._id, routeParams.quantity || 1);
      }
      setCartLines(await fetchServerCart());
    } catch (e: any) {
      console.error('Failed to load cart:', e);
      Alert.alert('Error', e.response?.data?.message || 'Could not load cart');
    } finally {
      setLoadingCart(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadCart();
    }, [routeParams.product?._id])
  );

  const isCartEmpty = cartLines.length === 0;
  const itemCount = cartLines.reduce((s, l) => s + l.quantity, 0);
  const originalPrice = cartLines.reduce((s, l) => s + l.price * l.quantity, 0);
  const discountedPrice = cartLines.reduce((s, l) => s + l.discountPrice * l.quantity, 0);
  const productDiscount = originalPrice - discountedPrice;

  useFocusEffect(
    React.useCallback(() => {
      fetchAddress();
      const selectedAddressFromNav = (route.params as any)?.selectedAddress;
      if (selectedAddressFromNav) {
        setAddress(selectedAddressFromNav);
      }
    }, [(route.params as any)?.selectedAddress])
  );

  const fetchAddress = async () => {
    try {
      setLoadingAddress(true);
      const response = await api.CLIENT.get(api.ENDPOINTS.ADDRESSES);
      const addresses = response.data?.addresses || [];
      if (addresses.length > 0) {
        const selectedAddr = addresses.find((a: Address) => a.isDefault) || addresses[0];
        setAddress(selectedAddr);
      }
    } catch (error: any) {
      console.error('Failed to fetch address:', error);
    } finally {
      setLoadingAddress(false);
    }
  };

  const totalDiscount = productDiscount + couponDiscount;
  const deliveryFee = 40;
  const totalAmount = Math.max(0, discountedPrice - couponDiscount + deliveryFee);

  const handleQuantityChange = async (line: CartLine, change: number) => {
    const newQuantity = line.quantity + change;
    if (newQuantity < 1) {
      handleRemoveItem(line);
      return;
    }
    try {
      const lines = await updateCartItemQuantity(line.productId, newQuantity);
      setCartLines(lines);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Could not update quantity');
    }
  };

  const handleRemoveItem = (line: CartLine) => {
    Alert.alert('Remove item', `Remove "${line.name}" from cart?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            const lines = await removeFromCart(line.productId);
            setCartLines(lines);
            if (couponApplied && lines.length === 0) {
              handleRemoveCoupon();
            }
          } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Could not remove item');
          }
        },
      },
    ]);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || couponApplied) return;
    try {
      const coupon = await validateCoupon(couponCode, discountedPrice);
      setCouponDiscount(coupon.discountAmount || 0);
      setAppliedCouponCode(coupon.code);
      setCouponApplied(true);
    } catch (e: any) {
      Alert.alert('Coupon', e.response?.data?.message || e.message || 'Invalid coupon');
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponCode('');
    setCouponDiscount(0);
    setAppliedCouponCode('');
  };

  const placeOrder = () => {
    if (isCartEmpty) {
      Alert.alert('Error', 'No items in cart');
      return;
    }
    (navigation as any).navigate('Checkout', {
      cartItems: linesToCheckoutItems(cartLines),
      couponCode: appliedCouponCode,
      couponDiscount,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loadingCart ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color="#1E3A8A" />
          </View>
        ) : isCartEmpty ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Your Cart Is Feeling Light</Text>
            <Text style={styles.emptyDescription}>
              Looks like you haven't added anything yet. Browse items to start building your pet's
              perfect haul.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => (navigation as any).navigate('Products')}
            >
              <Text style={styles.emptyButtonText}>Start Shopping →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <View style={styles.addressHeader}>
                <View style={styles.addressInfo}>
                  {loadingAddress ? (
                    <ActivityIndicator size="small" color="#1E3A8A" />
                  ) : address ? (
                    <>
                      <Text style={styles.deliverToText}>
                        Deliver to: {address.name}, {address.phone}
                      </Text>
                      <Text style={styles.addressText}>
                        {address.street}, {address.city}, {address.state} {address.zipCode}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.deliverToText}>No address selected</Text>
                      <Text style={styles.addressText}>Please add an address to continue</Text>
                    </>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.changeButton}
                  onPress={() => navigation.navigate('Address' as never)}
                >
                  <Text style={styles.changeButtonText}>{address ? 'Change' : 'Add'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cart Item's Added</Text>
              {cartLines.map((line) => {
                const cartImage = line.image ?? line.images?.[0];
                const cartImageIsUri = typeof cartImage === 'string';
                return (
                  <View key={line.productId} style={[styles.cartItem, { marginBottom: 12 }]}>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveItem(line)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityLabel="Remove from cart"
                    >
                      <Text style={styles.removeButtonText}>✕</Text>
                    </TouchableOpacity>
                    <View style={styles.productImage}>
                      {cartImageIsUri ? (
                        <Image
                          source={{ uri: cartImage }}
                          style={styles.productImageFill}
                          resizeMode="contain"
                        />
                      ) : (
                        <Image source={product1Image} style={styles.productEmoji} />
                      )}
                    </View>
                    <View style={styles.productDetails}>
                      <Text style={styles.productName} numberOfLines={2}>
                        {line.name}
                      </Text>
                      <View style={styles.priceRow}>
                        <Text style={styles.productPrice}>
                          ₹{line.discountPrice.toLocaleString('en-IN')}
                        </Text>
                        {line.price > line.discountPrice && (
                          <Text style={styles.originalPrice}>
                            ₹{line.price.toLocaleString('en-IN')}
                          </Text>
                        )}
                        {(line.discount || 0) > 0 && (
                          <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>{line.discount}% OFF</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.quantityContainer}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => handleQuantityChange(line, -1)}
                        >
                          <Text style={styles.quantityButtonText}>—</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{line.quantity}</Text>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => handleQuantityChange(line, 1)}
                        >
                          <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Coupon</Text>
              <View style={styles.couponContainer}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Enter Coupon Code"
                  placeholderTextColor="#9CA3AF"
                  value={couponCode}
                  onChangeText={setCouponCode}
                  editable={!couponApplied}
                />
                {couponApplied ? (
                  <TouchableOpacity style={styles.appliedButton} onPress={handleRemoveCoupon}>
                    <Text style={styles.appliedButtonText}>Applied</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.applyButton, couponCode.trim() && styles.applyButtonActive]}
                    onPress={handleApplyCoupon}
                    disabled={!couponCode.trim()}
                  >
                    <Text
                      style={[
                        styles.applyButtonText,
                        couponCode.trim() && styles.applyButtonTextActive,
                      ]}
                    >
                      Apply
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {couponApplied && (
                <Text style={styles.couponDiscount}>Coupon Discount ₹{couponDiscount}</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Details</Text>
              <View style={styles.priceDetailRow}>
                <Text style={styles.priceDetailLabel}>
                  Price ({itemCount} item{itemCount > 1 ? 's' : ''})
                </Text>
                <Text style={styles.priceDetailValue}>₹{originalPrice.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.priceDetailRow}>
                <Text style={styles.priceDetailLabel}>Discount</Text>
                <Text style={styles.discountValue}>-₹{totalDiscount.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.priceDetailRow}>
                <Text style={styles.priceDetailLabel}>Delivery Fee</Text>
                <Text style={styles.priceDetailValue}>₹{deliveryFee}</Text>
              </View>
              <View style={[styles.priceDetailRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>₹{totalAmount.toLocaleString('en-IN')}</Text>
              </View>
            </View>

            <View style={styles.savingsContainer}>
              <Text style={styles.savingsText}>
                You Save ₹{totalDiscount.toLocaleString('en-IN')} on this order
              </Text>
            </View>
            <View style={styles.bottomPadding} />
          </>
        )}
      </ScrollView>

      {!isCartEmpty && !loadingCart && (
        <View style={styles.footer}>
          <View style={styles.footerTotal}>
            <View style={styles.footerPriceRow}>
              <Text style={styles.footerTotalPrice}>₹{totalAmount.toLocaleString('en-IN')}</Text>
              <Text style={styles.footerOriginalPrice}>
                ₹{originalPrice.toLocaleString('en-IN')}
              </Text>
            </View>
            <Text style={styles.footerText}>Inclusive of all taxes</Text>
          </View>
          <TouchableOpacity style={styles.placeOrderButton} onPress={placeOrder}>
            <Text style={styles.placeOrderText}>Place Order →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: { padding: 5 },
  backIcon: { fontSize: 24, color: '#1F2937' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  placeholder: { width: 34 },
  section: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  addressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  addressInfo: { flex: 1 },
  deliverToText: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  addressText: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  changeButton: {
    backgroundColor: '#95E562',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
  },
  changeButtonText: { fontSize: 14, fontWeight: '600', color: '#000000' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 15 },
  cartItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
    position: 'relative',
    paddingTop: 4,
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    lineHeight: 18,
  },
  productImage: {
    width: 100,
    height: 100,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    elevation: 6,
  },
  productEmoji: { width: 90, height: 90, resizeMode: 'contain' },
  productImageFill: { width: '100%', height: '100%', borderRadius: 8 },
  productDetails: { flex: 1, paddingRight: 32 },
  productName: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 8, lineHeight: 20 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8, flexWrap: 'wrap' },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  originalPrice: { fontSize: 14, color: '#9CA3AF', textDecorationLine: 'line-through' },
  discountBadge: {
    backgroundColor: '#EF4444',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  discountText: { fontSize: 10, fontWeight: 'bold', color: '#FFFFFF' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quantityButtonText: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  quantityText: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', minWidth: 30, textAlign: 'center' },
  couponContainer: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  couponInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 14,
    color: '#1F2937',
  },
  applyButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonActive: { backgroundColor: '#1F2937' },
  applyButtonText: { fontSize: 14, fontWeight: '600', color: '#9CA3AF' },
  applyButtonTextActive: { color: '#FFFFFF' },
  appliedButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appliedButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  couponDiscount: { fontSize: 14, color: '#10B981', fontWeight: '600', marginTop: 4 },
  priceDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  priceDetailLabel: { fontSize: 14, color: '#6B7280' },
  priceDetailValue: { fontSize: 14, fontWeight: '500', color: '#1F2937' },
  discountValue: { fontSize: 14, fontWeight: '500', color: '#10B981' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#E5E7EB', marginTop: 8, paddingTop: 12 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  savingsContainer: {
    margin: 15,
    backgroundColor: '#95E562',
    padding: 12,
    borderRadius: 14,
  },
  savingsText: { fontSize: 14, fontWeight: '600', color: '#000000', textAlign: 'center' },
  bottomPadding: { height: 200 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  placeOrderButton: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 50,
    paddingVertical: 20,
    borderRadius: 30,
  },
  placeOrderText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  footerTotal: { justifyContent: 'center' },
  footerPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerTotalPrice: { fontSize: 22, fontWeight: '700', color: '#111827' },
  footerOriginalPrice: { fontSize: 14, color: '#9CA3AF', textDecorationLine: 'line-through' },
  footerText: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    paddingTop: 100,
  },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 12, textAlign: 'center' },
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
  emptyButtonText: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' },
});

export default CartScreen;
