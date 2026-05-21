import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import {
  fetchServerCart,
  linesToCheckoutItems,
  validateCoupon,
} from '../../services/cartService';
import {
  createCheckoutPaymentOrder,
  verifyCheckoutPayment,
  openRazorpayCheckout,
  isPaymentCancelledError,
} from '../../services/razorpayPayment';
import { fetchWalletBalance } from '../../services/walletService';
import walletIcon from '../../assets/images/moneys.png';
import { WALLET_UI_ENABLED } from '../../config/featureFlags';

const PLACEHOLDER_COLOR = '#333333';
const PRIMARY_BLUE = '#1E3A8A';

const PAYMENT_METHODS = [
  ...(WALLET_UI_ENABLED
    ? [{ id: 'wallet' as const, label: 'Furrmaa Wallet', icon: 'wallet' as const }]
    : []),
  { id: 'card', label: 'Card', icon: 'credit-card-outline' as const },
  { id: 'upi', label: 'UPI', icon: 'cellphone' as const },
  { id: 'cash', label: 'Cash on Delivery', icon: 'cash' as const },
];

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const {
    cartItems: routeCartItems,
    couponCode: routeCouponCode,
    couponDiscount: routeCouponDiscount,
  } = (route.params as any) || {};
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [address, setAddress] = useState({
    _id: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  });
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(
    routeCouponCode || null
  );
  const [couponDiscountAmount, setCouponDiscountAmount] = useState(
    routeCouponDiscount || 0
  );
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);

  // Fetch cart items from backend or use route params
  useEffect(() => {
    if (routeCartItems && routeCartItems.length > 0) {
      setOrderItems(routeCartItems);
      setLoading(false);
    } else {
      fetchCartItems();
    }
    fetchAddress();
    if (WALLET_UI_ENABLED) {
      fetchWalletBalance()
        .then(setWalletBalance)
        .catch(() => setWalletBalance(0));
    }
  }, []);

  // Handle address selection from AddressScreen
  useEffect(() => {
    const selectedAddressFromNav = (route.params as any)?.selectedAddress;
    if (selectedAddressFromNav) {
      selectAddress(selectedAddressFromNav);
    }
  }, [(route.params as any)?.selectedAddress]);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const lines = await fetchServerCart();
      setOrderItems(linesToCheckoutItems(lines));
    } catch (error: any) {
      console.error('Failed to fetch cart items:', error);
      setOrderItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddress = async () => {
    try {
      const response = await api.CLIENT.get(api.ENDPOINTS.ADDRESSES);
      const fetchedAddresses = response.data?.addresses || [];
      setAddresses(fetchedAddresses);
      
      if (fetchedAddresses.length > 0) {
        // Use default address or first address
        const addr = fetchedAddresses.find((a: any) => a.isDefault) || fetchedAddresses[0];
        setAddress({
          _id: addr._id || '',
          street: addr.street || '',
          city: addr.city || '',
          state: addr.state || '',
          zipCode: addr.zipCode || '',
          phone: addr.phone || '',
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch address:', error);
      // If no addresses, allow user to add one
    }
  };

  const selectAddress = (selectedAddr: any) => {
    setAddress({
      _id: selectedAddr._id || '',
      street: selectedAddr.street || '',
      city: selectedAddr.city || '',
      state: selectedAddr.state || '',
      zipCode: selectedAddr.zipCode || '',
      phone: selectedAddr.phone || '',
    });
    setShowAddressSelector(false);
  };

  const subtotal = orderItems.reduce((sum, item) => {
    const price = item.discountPrice || item.price || 0;
    return sum + (price * (item.quantity || 1));
  }, 0);
  const originalSubtotal = orderItems.reduce((sum, item) => {
    const price = item.price || item.discountPrice || 0;
    return sum + (price * (item.quantity || 1));
  }, 0);
  const deliveryFee = 50;
  const discount = couponDiscountAmount;
  const finalSubtotal = Math.max(0, subtotal + deliveryFee - discount);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const coupon = await validateCoupon(couponCode, subtotal);
      setAppliedCoupon(coupon.code);
      setCouponDiscountAmount(coupon.discountAmount || 0);
      setShowCouponInput(false);
    } catch (e: any) {
      Alert.alert('Coupon', e.response?.data?.message || e.message || 'Invalid coupon');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponDiscountAmount(0);
  };

  const placeOrder = async () => {
    if (orderItems.length === 0) {
      Alert.alert('Error', 'No items in cart');
      return;
    }

    // Validate address
    if (!address.street || !address.city || !address.state || !address.zipCode || !address.phone) {
      Alert.alert('Error', 'Please provide a complete delivery address');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: orderItems.map(item => ({
          product: item._id || item.id,
          quantity: item.quantity || 1,
          price: item.discountPrice || item.price || 0,
        })),
        shippingAddress: {
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          phone: address.phone,
        },
        paymentMethod: paymentMethod,
        totalAmount: finalSubtotal,
        discount: discount || 0,
        deliveryFee: deliveryFee,
        couponCode: appliedCoupon || undefined,
      };

      let placedOrder: { _id?: string; orderNumber?: string } | null = null;

      if (paymentMethod === 'cash' || paymentMethod === 'wallet') {
        if (paymentMethod === 'wallet' && walletBalance < finalSubtotal) {
          Alert.alert(
            'Insufficient balance',
            'Recharge your wallet or choose another payment method.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Go to Wallet',
                onPress: () => (navigation as any).navigate('Wallet'),
              },
            ]
          );
          setLoading(false);
          return;
        }
        const response = await api.CLIENT.post(api.ENDPOINTS.ORDERS, orderData);
        if (!response.data?.success || !response.data?.order) {
          throw new Error('Invalid response from server');
        }
        placedOrder = response.data.order;
        if (paymentMethod === 'wallet') {
          setWalletBalance((b) => Math.max(0, b - finalSubtotal));
        }
      } else {
        const paymentInit = await createCheckoutPaymentOrder(
          finalSubtotal,
          `order_${Date.now()}`,
          { source: 'app-checkout' }
        );
        const rpOrder = paymentInit.razorpayOrder;
        if (!paymentInit.keyId || !rpOrder?.id || !rpOrder?.amount) {
          throw new Error(paymentInit.message || 'Failed to start payment');
        }
        const paymentResult = await openRazorpayCheckout({
          keyId: paymentInit.keyId,
          amount: rpOrder.amount,
          orderId: rpOrder.id,
          currency: rpOrder.currency || 'INR',
          description: 'Product checkout payment',
          prefill: {
            name: user?.name || '',
            contact: address.phone || '',
            email: user?.email || '',
          },
        });
        const verifyRes = await verifyCheckoutPayment({
          razorpay_order_id: paymentResult.razorpay_order_id,
          razorpay_payment_id: paymentResult.razorpay_payment_id,
          razorpay_signature: paymentResult.razorpay_signature,
          orderData: { ...orderData, paymentMethod: 'razorpay' },
        });
        if (!verifyRes?.success || !verifyRes?.order) {
          throw new Error(verifyRes?.message || 'Payment verification failed');
        }
        placedOrder = verifyRes.order;
      }

      Alert.alert(
        'Order Placed Successfully!',
        `Your order has been placed. Order ID: ${placedOrder?._id?.slice(-6).toUpperCase() || 'N/A'}`,
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('PaymentSuccess' as never, {
                orderId: placedOrder?._id || placedOrder?.orderNumber,
                expectedDelivery: '3-5 Days',
              } as never);
            },
          },
        ]
      );
    } catch (error: any) {
      if (isPaymentCancelledError(error)) {
        return;
      }
      console.error('Failed to place order:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to place order. Please try again.';
      Alert.alert('Order Failed', errorMessage, [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('PaymentFailed' as never);
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Order Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.cardTitle}>Order summary</Text>

        {/* Order Items */}
        {orderItems.length === 0 ? (
          <View style={styles.emptyCartContainer}>
            <Text style={styles.emptyCartText}>No items in cart</Text>
            <TouchableOpacity
              style={styles.shopNowButton}
              onPress={() => navigation.navigate('Products' as never, {} as never)}
            >
              <Text style={styles.shopNowButtonText}>Shop Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          orderItems.map((item, index) => (
            <View key={item._id || item.id || index} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name || 'Product'}</Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity || 1}</Text>
              </View>
              <View style={styles.itemPriceContainer}>
                {item.originalPrice && item.originalPrice !== (item.discountPrice || item.price) && (
                  <Text style={styles.originalPrice}>
                    ₹{((item.originalPrice || 0) * (item.quantity || 1)).toFixed(2)}
                  </Text>
                )}
                <Text style={styles.itemPrice}>
                  ₹{((item.discountPrice || item.price || 0) * (item.quantity || 1)).toFixed(2)}
                </Text>
              </View>
            </View>
          ))
        )}

        <View style={styles.divider} />

        {/* Delivery Fee */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery fee</Text>
          <Text style={styles.summaryValue}>₹{deliveryFee}</Text>
        </View>

        {/* Taxes Section */}
        <View style={styles.divider} />
        <View style={styles.taxesSection}>
          <Text style={styles.summaryLabel}>Taxes</Text>
          <Text style={styles.taxesText}>Calculated after you provide your billing address</Text>
          <Text style={styles.taxesDash}>—</Text>
        </View>

        {/* Discount/Coupon */}
        {appliedCoupon && (
          <>
            <View style={styles.divider} />
            <View style={styles.discountRow}>
              <View style={styles.couponTag}>
                <Text style={styles.couponIcon}>🏷️</Text>
                <Text style={styles.couponText}>{appliedCoupon} -10%</Text>
              </View>
              <TouchableOpacity onPress={removeCoupon}>
                <Text style={styles.removeCoupon}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.discountAmount}>-₹{discount}</Text>
            </View>
          </>
        )}

        {/* Subtotal */}
        <View style={styles.divider} />
        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalLabel}>Subtotal</Text>
          <View style={styles.subtotalPriceContainer}>
            {originalSubtotal !== subtotal && (
              <Text style={styles.originalSubtotal}>₹{originalSubtotal + deliveryFee}</Text>
            )}
            <Text style={styles.finalSubtotal}>₹{finalSubtotal}</Text>
          </View>
        </View>

        {/* Coupon Input */}
        {!appliedCoupon && (
          <View style={styles.couponSection}>
            {!showCouponInput ? (
              <TouchableOpacity
                style={styles.addCouponButton}
                onPress={() => setShowCouponInput(true)}
              >
                <Text style={styles.addCouponText}>+ Add coupon code</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.couponInputContainer}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Enter coupon code"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  value={couponCode}
                  onChangeText={setCouponCode}
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={styles.applyButton} onPress={applyCoupon}>
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {appliedCoupon && (
          <View style={styles.appliedCouponSection}>
            <Text style={styles.appliedCouponLabel}>Coupon applied:</Text>
            <View style={styles.appliedCouponTag}>
              <Text style={styles.appliedCouponText}>{appliedCoupon}</Text>
              <TouchableOpacity onPress={removeCoupon}>
                <Text style={styles.appliedCouponRemove}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Delivery Address */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddressManagement' as never, {} as never)}
          >
            <Text style={styles.manageAddressText}>Manage Addresses</Text>
          </TouchableOpacity>
        </View>
        {addresses.length > 0 ? (
          <View>
            {!showAddressSelector ? (
              <View style={styles.addressCard}>
                <Text style={styles.addressText}>
                  {address.street}, {address.city}, {address.state} {address.zipCode}
                </Text>
                <Text style={styles.addressPhone}>{address.phone}</Text>
                <TouchableOpacity
                  style={styles.changeAddressButton}
                  onPress={() => setShowAddressSelector(true)}
                >
                  <Text style={styles.changeAddressText}>Select Different Address</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.manageAddressLink}
                  onPress={() => navigation.navigate('AddressManagement' as never, {} as never)}
                >
                  <Text style={styles.manageAddressLinkText}>Manage Addresses →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.selectAddressTitle}>Select Delivery Address:</Text>
                {addresses.map((addr) => (
                  <TouchableOpacity
                    key={addr._id}
                    style={[
                      styles.addressOptionCard,
                      address._id === addr._id && styles.addressOptionCardSelected,
                    ]}
                    onPress={() => selectAddress(addr)}
                  >
                    <View style={styles.addressOptionHeader}>
                      <Text style={styles.addressOptionName}>{addr.name}</Text>
                      {addr.isDefault && (
                        <Text style={styles.defaultBadge}>DEFAULT</Text>
                      )}
                    </View>
                    <Text style={styles.addressOptionText}>
                      {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                    </Text>
                    <Text style={styles.addressOptionPhone}>{addr.phone}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.cancelSelectButton}
                  onPress={() => setShowAddressSelector(false)}
                >
                  <Text style={styles.cancelSelectText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.addAddressButton}
              onPress={() => navigation.navigate('AddAddress' as never, {} as never)}
            >
              <Text style={styles.addAddressText}>+ Add Delivery Address</Text>
            </TouchableOpacity>
            <Text style={styles.addressHint}>
              Or enter address manually:
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Street Address"
              placeholderTextColor={PLACEHOLDER_COLOR}
              value={address.street}
              onChangeText={(text) => setAddress((prev) => ({ ...prev, street: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="City"
              placeholderTextColor={PLACEHOLDER_COLOR}
              value={address.city}
              onChangeText={(text) => setAddress((prev) => ({ ...prev, city: text }))}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="State"
                placeholderTextColor={PLACEHOLDER_COLOR}
                value={address.state}
                onChangeText={(text) => setAddress((prev) => ({ ...prev, state: text }))}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Zip Code"
                placeholderTextColor={PLACEHOLDER_COLOR}
                value={address.zipCode}
                onChangeText={(text) => setAddress((prev) => ({ ...prev, zipCode: text }))}
                keyboardType="numeric"
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor={PLACEHOLDER_COLOR}
              value={address.phone}
              onChangeText={(text) => setAddress((prev) => ({ ...prev, phone: text }))}
              keyboardType="phone-pad"
            />
          </>
        )}
      </View>

      {/* Payment Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        {PAYMENT_METHODS.map((method) => {
          const isSelected = paymentMethod === method.id;
          const isWallet = method.id === 'wallet';
          const walletDisabled = isWallet && walletBalance < finalSubtotal;
          return (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentOption,
                isSelected && styles.selectedPaymentOption,
                walletDisabled && styles.paymentOptionDisabled,
              ]}
              onPress={() => {
                if (isWallet && walletBalance < finalSubtotal) {
                  Alert.alert(
                    'Low wallet balance',
                    `You have ₹${walletBalance.toLocaleString('en-IN')}. Add money to pay with wallet.`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Wallet',
                        onPress: () => (navigation as any).navigate('Wallet'),
                      },
                    ]
                  );
                  return;
                }
                setPaymentMethod(method.id);
              }}
            >
              <View style={styles.paymentOptionRow}>
                {isWallet ? (
                  <Image
                    source={walletIcon}
                    style={[
                      styles.paymentIconImage,
                      isSelected && styles.paymentIconImageSelected,
                    ]}
                    resizeMode="contain"
                  />
                ) : (
                  <MaterialCommunityIcons
                    name={method.icon}
                    size={24}
                    color={isSelected ? '#FFFFFF' : PRIMARY_BLUE}
                  />
                )}
                <Text
                  style={[
                    styles.paymentOptionText,
                    isSelected && styles.paymentOptionTextSelected,
                  ]}
                >
                  {isWallet
                    ? `Furrmaa Wallet (₹${walletBalance.toLocaleString('en-IN')})`
                    : method.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Place Order Button */}
      <TouchableOpacity
        style={[styles.placeOrderButton, loading && styles.placeOrderButtonDisabled]}
        onPress={placeOrder}
        disabled={loading || orderItems.length === 0}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.placeOrderButtonText}>Place Order - ₹{finalSubtotal}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  itemInfo: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  itemPriceContainer: {
    alignItems: 'flex-end',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  taxesSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taxesText: {
    flex: 1,
    fontSize: 14,
    color: '#999',
    marginLeft: 10,
  },
  taxesDash: {
    fontSize: 18,
    color: '#999',
  },
  discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  couponTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  couponIcon: {
    fontSize: 14,
    marginRight: 5,
  },
  couponText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  removeCoupon: {
    fontSize: 18,
    color: '#999',
    marginLeft: 10,
  },
  discountAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  subtotalPriceContainer: {
    alignItems: 'flex-end',
  },
  originalSubtotal: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  finalSubtotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  couponSection: {
    marginTop: 15,
  },
  addCouponButton: {
    padding: 12,
    alignItems: 'center',
  },
  addCouponText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  couponInputContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  applyButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  appliedCouponSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  appliedCouponLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  appliedCouponTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  appliedCouponText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  appliedCouponRemove: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  manageAddressText: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  addressCard: {
    backgroundColor: '#F8F8F8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  addressPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  changeAddressButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  changeAddressText: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  addAddressButton: {
    backgroundColor: '#1E3A8A',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  addAddressText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addressHint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  paymentOption: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedPaymentOption: {
    backgroundColor: PRIMARY_BLUE,
    borderColor: PRIMARY_BLUE,
    borderWidth: 1,
  },
  paymentOptionDisabled: {
    opacity: 0.55,
  },
  paymentOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentIconImage: {
    width: 24,
    height: 24,
    tintColor: PRIMARY_BLUE,
  },
  paymentIconImageSelected: {
    tintColor: '#FFFFFF',
  },
  paymentOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  paymentOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  placeOrderButton: {
    backgroundColor: PRIMARY_BLUE,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    margin: 20,
    marginTop: 10,
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  placeOrderButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyCartContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  shopNowButton: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopNowButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CheckoutScreen;
