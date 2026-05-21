import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Share,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import leftArrow from '../../assets/images/arrow-left.png';
import downloadIcon from '../../assets/images/receive-square.png';
import api from '../../config/api';
import {
  submitProductReview,
  userReviewedProduct,
} from '../../utils/productReviews';

const TRACKING_STEPS = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'packing', label: 'Packing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

const OrderDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = (route.params as any) || {};
  const orderId = params.orderId || params.order?._id;

  const [order, setOrder] = useState<any>(params.order || null);
  const [loading, setLoading] = useState(!!orderId && !params.order);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [itemReviews, setItemReviews] = useState<
    Record<string, { rating: number; comment: string; submitted: boolean; submitting?: boolean }>
  >({});

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.CLIENT.get(api.ENDPOINTS.ORDERS + '/' + orderId);
      if (res.data?.success && res.data?.order) {
        setOrder(res.data.order);
      } else {
        setError('Order not found');
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId && !order) fetchOrder();
    else if (orderId && order && order._id !== orderId) fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (!order?.items?.length) return;
    const next: Record<
      string,
      { rating: number; comment: string; submitted: boolean; submitting?: boolean }
    > = {};
    order.items.forEach((item: any) => {
      const product = item.product;
      const pid = product?._id || item.product;
      if (!pid) return;
      const productId = String(pid);
      next[productId] = {
        rating: 0,
        comment: '',
        submitted: userReviewedProduct(product?.reviews, user?._id),
      };
    });
    setItemReviews(next);
  }, [order, user?._id]);

  const orderStatus = order?.orderStatus || 'pending';
  const isCancelled = orderStatus === 'cancelled';
  const isReturned =
    orderStatus === 'returned' || order?.paymentStatus === 'refunded';
  const isReturnPending = orderStatus === 'return_requested';
  const currentStepIndex = isCancelled
    ? -1
    : TRACKING_STEPS.findIndex((s) => s.key === orderStatus);
  const safeStepIndex = currentStepIndex < 0 ? 0 : currentStepIndex;

  const subtotal =
    order?.items?.reduce(
      (sum: number, i: any) => sum + (i.price || 0) * (i.quantity || 1),
      0
    ) ?? 0;
  const discount = order?.discount ?? 0;
  const deliveryFee = order?.deliveryFee ?? 0;
  const totalAmount = order?.totalAmount ?? 0;
  const address = order?.shippingAddress;
  const addressLine =
    address &&
    [address.street, address.city, address.state, address.zipCode]
      .filter(Boolean)
      .join(', ');
  const paymentMethod = order?.paymentMethod
    ? String(order.paymentMethod).toUpperCase()
    : '';

  const handleDownloadInvoice = async () => {
    if (!order) return;
    const lines: string[] = [
      '---------- FARMAA INVOICE ----------',
      `Order ID: ${order._id}`,
      `Date: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : '-'}`,
      '',
      'Items:',
    ];
    order.items?.forEach((i: any, idx: number) => {
      const name = i.product?.name || 'Product';
      const qty = i.quantity || 1;
      const price = i.price || 0;
      lines.push(`  ${idx + 1}. ${name} x ${qty} = ₹${(price * qty).toLocaleString('en-IN')}`);
    });
    lines.push('');
    lines.push(`Subtotal:     ₹${subtotal.toLocaleString('en-IN')}`);
    if (discount) lines.push(`Discount:    -₹${discount.toLocaleString('en-IN')}`);
    lines.push(`Delivery:     ₹${deliveryFee.toLocaleString('en-IN')}`);
    lines.push(`Total:        ₹${totalAmount.toLocaleString('en-IN')}`);
    lines.push('');
    lines.push(`Payment: ${paymentMethod}`);
    if (addressLine) lines.push(`Address: ${addressLine}`);
    if (address?.phone) lines.push(`Phone: ${address.phone}`);
    lines.push('--------------------------------');

    const message = lines.join('\n');
    try {
      await Share.share({
        message,
        title: `Invoice-${(order._id || '').slice(-8)}`,
      });
    } catch (e) {
      Alert.alert('Error', 'Could not share invoice.');
    }
  };

  const handleSeeAllUpdates = () => {
    (navigation as any).navigate('OrderUpdate' as never, { orderId: order?._id } as never);
  };

  const handleSubmitItemReview = async (productId: string) => {
    const state = itemReviews[productId];
    if (!state || state.rating < 1 || state.submitted) return;
    setItemReviews((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], submitting: true },
    }));
    try {
      await submitProductReview(productId, state.rating, state.comment);
      setItemReviews((prev) => ({
        ...prev,
        [productId]: { ...prev[productId], submitted: true, submitting: false },
      }));
      Alert.alert('Thank you', 'Your review is now visible on the product page');
      fetchOrder();
    } catch (e: any) {
      setItemReviews((prev) => ({
        ...prev,
        [productId]: { ...prev[productId], submitting: false },
      }));
      Alert.alert('Error', e.response?.data?.message || 'Could not submit review');
    }
  };

  const updateItemReview = (
    productId: string,
    patch: Partial<{ rating: number; comment: string }>
  ) => {
    setItemReviews((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], ...patch },
    }));
  };

  const handleReturnOrder = () => {
    (navigation as any).navigate('ReturnOrder' as never, { order } as never);
  };

  const isDelivered = orderStatus === 'delivered';

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#95E562" />
        <Text style={styles.loadingText}>Loading order...</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Order not found'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const firstItem = order.items?.[0];
  const productName = firstItem?.product?.name || 'Product';
  const productImage =
    firstItem?.product?.images?.[0] || firstItem?.product?.image;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={leftArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.orderId}>Order ID: {(order._id || '').slice(-8).toUpperCase()}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.productRow}>
            <View style={styles.productImage}>
              {productImage ? (
                <Image source={{ uri: productImage }} style={styles.productImg} />
              ) : (
                <Text style={styles.productEmoji}>🦴</Text>
              )}
            </View>
            <Text style={styles.productName} numberOfLines={2}>
              {productName}
              {order.items?.length > 1 ? ` +${order.items.length - 1} more` : ''}
            </Text>
          </View>
        </View>

        {/* Tracking stepper */}
        <View style={styles.odrderDetailsSection}>
          <View style={styles.statusHeader}>
            <View>
              <Text style={styles.statusTitle}>
                {isCancelled ? 'Cancelled' : TRACKING_STEPS[safeStepIndex]?.label || orderStatus},{' '}
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString('en-IN')
                  : ''}
              </Text>
              <Text style={styles.statusMessage}>
                {isCancelled
                  ? 'This order was cancelled.'
                  : isDelivered
                  ? "Delivered. Hope your pet loves it!"
                  : "Your order is on its way!"}
              </Text>
            </View>
            {isDelivered && !isCancelled && (
              <View style={styles.checkmarkCircle}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
            )}
          </View>

          {!isCancelled && (
            <View style={styles.stepperContainer}>
              {TRACKING_STEPS.map((step, index) => {
                const done = index <= currentStepIndex;
                const current = index === currentStepIndex;
                return (
                  <View key={step.key} style={styles.stepperRow}>
                    <View
                      style={[
                        styles.stepDot,
                        done && styles.stepDotDone,
                        current && styles.stepDotCurrent,
                      ]}
                    >
                      {done ? (
                        <Text style={styles.stepDotText}>✓</Text>
                      ) : (
                        <Text style={styles.stepDotNum}>{index + 1}</Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        done && styles.stepLabelDone,
                        current && styles.stepLabelCurrent,
                      ]}
                    >
                      {step.label}
                    </Text>
                    {index < TRACKING_STEPS.length - 1 && (
                      <View
                        style={[
                          styles.stepLine,
                          index < currentStepIndex && styles.stepLineDone,
                        ]}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {order.trackingNumber && (
            <Text style={styles.trackingText}>
              Tracking: {order.trackingNumber}
            </Text>
          )}

          <TouchableOpacity style={styles.seeAllButton} onPress={handleSeeAllUpdates}>
            <Text style={styles.seeAllButtonText}>See All Order Updates</Text>
          </TouchableOpacity>
        </View>

        {(isCancelled || isReturned || isReturnPending) && (
          <View style={styles.section}>
            <Text style={styles.refundAmount}>
              {isReturned
                ? `₹${totalAmount.toLocaleString('en-IN')} credited to your Furrmaa Wallet`
                : isReturnPending
                  ? 'Return requested — refund will be added to your wallet once approved'
                  : `Refund (if applicable): ₹${totalAmount.toLocaleString('en-IN')}`}
            </Text>
          </View>
        )}

        {isDelivered &&
          order.items?.map((item: any) => {
            const product = item.product;
            const pid = product?._id || item.product;
            if (!pid) return null;
            const productId = String(pid);
            const name = product?.name || 'Product';
            const state = itemReviews[productId] || {
              rating: 0,
              comment: '',
              submitted: userReviewedProduct(product?.reviews, user?._id),
            };
            if (state.submitted) {
              return (
                <View key={productId} style={styles.odrderDetailsSection}>
                  <Text style={styles.ratingTitle}>{name}</Text>
                  <Text style={styles.reviewDoneText}>✓ You reviewed this product</Text>
                </View>
              );
            }
            return (
              <View key={productId} style={styles.odrderDetailsSection}>
                <Text style={styles.ratingTitle}>Review: {name}</Text>
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => updateItemReview(productId, { rating: star })}
                      style={styles.starButton}
                    >
                      <Text style={styles.star}>{star <= state.rating ? '⭐' : '☆'}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.reviewCommentInput}
                  placeholder="Your review (optional)"
                  placeholderTextColor="#9CA3AF"
                  value={state.comment}
                  onChangeText={(text) => updateItemReview(productId, { comment: text })}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  style={[
                    styles.submitReviewFull,
                    (state.rating < 1 || state.submitting) && styles.submitButtonDisabled,
                  ]}
                  onPress={() => handleSubmitItemReview(productId)}
                  disabled={state.rating < 1 || state.submitting}
                >
                  {state.submitting ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit review</Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}

        <View style={styles.odrderDetailsSection}>
          <TouchableOpacity style={styles.returnOrderButton} onPress={handleReturnOrder}>
            <Text style={styles.returnOrderText}>Return Order →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.odrderDetailsSection}>
          <Text style={styles.sectionTitle}>Deliver to</Text>
          <Text style={styles.deliveryAddress}>
            {addressLine || '—'}
            {address?.phone ? ` | ${address.phone}` : ''}
          </Text>
        </View>

        <View style={styles.odrderDetailsSection}>
          <Text style={styles.sectionTitle}>Price details</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              Subtotal ({order.items?.length || 0} item(s))
            </Text>
            <Text style={styles.priceValue}>₹{subtotal.toLocaleString('en-IN')}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Discount</Text>
              <Text style={styles.discountValue}>-₹{discount.toLocaleString('en-IN')}</Text>
            </View>
          )}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery fee</Text>
            <Text style={styles.priceValue}>₹{deliveryFee.toLocaleString('en-IN')}</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total amount</Text>
            <Text style={styles.totalValue}>₹{totalAmount.toLocaleString('en-IN')}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.savingsContainer}>
              <Text style={styles.savingsText}>
                You saved ₹{discount.toLocaleString('en-IN')} on this order
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment method</Text>
          <Text style={styles.paymentMethod}>{paymentMethod || '—'}</Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadInvoice}>
            <Image source={downloadIcon} style={styles.downloadIcon} />
            <Text style={styles.downloadText}>Download Invoice</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerTextContainer}>
          <Text style={styles.footerSmallText}>Made with care in India</Text>
          <Text style={styles.footerMainText}>Because your pet deserves the best 🐾</Text>
        </View>
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
  errorText: { fontSize: 16, color: '#DC2626', textAlign: 'center' },
  backText: { marginTop: 12, fontSize: 16, color: '#1E3A8A', fontWeight: '600' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  backButton: { padding: 5 },
  backIcon: { width: 30, height: 30, marginRight: 10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  placeholder: { width: 34 },
  section: { padding: 15 },
  odrderDetailsSection: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderWidth: 1,
    borderColor: '#D9DCE2',
    marginHorizontal: 10,
    borderRadius: 12,
    marginBottom: 20,
  },
  orderId: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  productRow: { flexDirection: 'row', alignItems: 'center' },
  productImage: {
    width: 100,
    height: 100,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  productImg: { width: 90, height: 90, resizeMode: 'contain' },
  productEmoji: { fontSize: 40 },
  productName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1F2937', lineHeight: 20 },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  statusTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  statusMessage: { fontSize: 14, color: '#6B7280' },
  checkmarkCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#95E562',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: { fontSize: 24, color: '#000', fontWeight: 'bold' },
  stepperContainer: { marginBottom: 12 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotDone: { backgroundColor: '#95E562' },
  stepDotCurrent: { backgroundColor: '#1F2937' },
  stepDotText: { fontSize: 12, color: '#000', fontWeight: 'bold' },
  stepDotNum: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  stepLabel: { fontSize: 13, color: '#9CA3AF', marginLeft: 10 },
  stepLabelDone: { color: '#1F2937' },
  stepLabelCurrent: { fontWeight: '700', color: '#1F2937' },
  stepLine: {
    position: 'absolute',
    left: 13,
    top: 28,
    width: 2,
    height: 20,
    backgroundColor: '#E5E7EB',
  },
  stepLineDone: { backgroundColor: '#95E562' },
  trackingText: { fontSize: 12, color: '#6B7280', marginTop: 8 },
  seeAllButton: {
    backgroundColor: '#95E562',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  seeAllButtonText: { fontSize: 14, fontWeight: 'bold', color: '#000' },
  refundAmount: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', paddingVertical: 10 },
  ratingTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
  reviewDoneText: { fontSize: 14, color: '#059669', marginBottom: 8 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  starButton: { padding: 5 },
  star: { fontSize: 24 },
  reviewCommentInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    minHeight: 72,
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  submitReviewFull: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  submitButton: {
    marginLeft: 'auto',
    backgroundColor: '#1F2937',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  submitButtonDisabled: { backgroundColor: '#9CA3AF' },
  submitButtonText: { fontSize: 14, fontWeight: 'bold', color: '#FFF' },
  returnOrderButton: { marginTop: 10 },
  returnOrderText: { fontSize: 14, color: '#1E3A8A', fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 },
  deliveryAddress: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  priceLabel: { fontSize: 14, color: '#6B7280' },
  priceValue: { fontSize: 14, fontWeight: '500', color: '#1F2937' },
  discountValue: { fontSize: 14, fontWeight: '500', color: '#95E562' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#E5E7EB', marginTop: 8, paddingTop: 12 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  savingsContainer: { backgroundColor: '#95E562', padding: 12, borderRadius: 16, marginTop: 12 },
  savingsText: { fontSize: 14, fontWeight: '600', color: '#000', textAlign: 'center' },
  paymentMethod: { fontSize: 14, color: '#1F2937', fontWeight: '500' },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  downloadIcon: { width: 30, height: 30, resizeMode: 'contain' },
  downloadText: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  bottomPadding: { height: 100 },
  footerTextContainer: { marginTop: 30, alignItems: 'flex-start', paddingHorizontal: 20 },
  footerSmallText: { fontSize: 14, color: '#9CA3AF', marginBottom: 12 },
  footerMainText: { fontSize: 24, fontWeight: '700', color: '#6B7280', textAlign: 'left', lineHeight: 34 },
});

export default OrderDetailScreen;
