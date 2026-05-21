import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import {
  payForSubscriptionPlan,
  isPaymentCancelledError,
} from '../../services/razorpayPayment';
import {
  fetchWalletBalance,
  paySubscriptionWithWallet,
} from '../../services/walletService';
import { WALLET_UI_ENABLED } from '../../config/featureFlags';
import leftArrow from '../../assets/images/arrow-left.png';
import dogImage from '../../assets/images/ITdog.png';

const SubscriptionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { program } = (route.params as any) || {};
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'wallet'>('razorpay');
  const [walletBalance, setWalletBalance] = useState(0);
  const TRAINING_AMOUNT = 999;

  useEffect(() => {
    if (WALLET_UI_ENABLED) {
      fetchWalletBalance()
        .then(setWalletBalance)
        .catch(() => setWalletBalance(0));
    }
  }, []);

  const benefits = [
    'Smart Training Modules',
    'Multiple Pet Profiles',
    '50+ Expert-Led Lessons & Videos',
    'Beginner to Advanced Skill Progression',
    'Track Learning Progress',
    'Bookmark & Continue Watching',
  ];

  const handleFreeTrial = async () => {
    // Activate free trial (3 days premium access)
    setLoading(true);
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 3); // 3-day free trial
      
      const response = await api.CLIENT.post(api.ENDPOINTS.SUBSCRIPTION + '/upgrade', {
        plan: 'premium',
      });
      
      // Update subscription with trial end date
      await api.CLIENT.put(api.ENDPOINTS.SUBSCRIPTION, {
        endDate: endDate.toISOString(),
        isActive: true,
      });
      
      Alert.alert('Success', 'Free trial activated! Enjoy 3 days of premium access.', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
            // Refresh the training screen
            (navigation as any).navigate('TrainingLessons', { program });
          },
        },
      ]);
    } catch (error: any) {
      console.error('Failed to activate free trial:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to activate free trial');
    } finally {
      setLoading(false);
    }
  };

  const onSubscribeSuccess = () => {
    Alert.alert('Success', 'Subscription activated! You now have access to all premium videos.', [
      {
        text: 'OK',
        onPress: () => {
          setShowPaymentModal(false);
          navigation.goBack();
          (navigation as any).navigate('TrainingLessons', { program });
        },
      },
    ]);
  };

  const handleContinue = () => {
    setShowPaymentModal(true);
  };

  const handleConfirmPurchase = async () => {
    setLoading(true);
    try {
      if (paymentMethod === 'wallet') {
        if (walletBalance < TRAINING_AMOUNT) {
          Alert.alert(
            'Insufficient balance',
            'Recharge your wallet to subscribe.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Wallet',
                onPress: () => {
                  setShowPaymentModal(false);
                  (navigation as any).navigate('Wallet');
                },
              },
            ]
          );
          return;
        }
        await paySubscriptionWithWallet('training', TRAINING_AMOUNT);
        setWalletBalance((b) => Math.max(0, b - TRAINING_AMOUNT));
      } else {
        await payForSubscriptionPlan('training', TRAINING_AMOUNT, {
          name: user?.name || '',
          email: user?.email || '',
        });
      }
      onSubscribeSuccess();
    } catch (error: any) {
      if (isPaymentCancelledError(error)) return;
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Failed to process subscription.'
      );
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top Image */}
        <View style={styles.imageContainer}>
          <Image source={dogImage} style={styles.topImage} />
        </View>

        {/* Main Title */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>
            Unlock All Intermediate &{"\n"}
            Advanced Training Videos 🐾🎓
          </Text>

          <Text style={styles.description}>
            Get full access to every lesson and boost your pet's training journey.
          </Text>
        </View>

        {/* Free Trial Button */}
        <View style={styles.freeTrialSection}>
          <TouchableOpacity
            style={styles.freeTrialButton}
            onPress={handleFreeTrial}
          >
            <Text style={styles.freeTrialButtonText}>3-Day Free Trial</Text>
          </TouchableOpacity>
        </View>

        {/* What You Get Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>What You Get</Text>

          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitRow}>
              <View style={styles.checkCircle}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>


        {/* Pricing Section */}
        <View style={styles.pricingSection}>
          <View style={styles.pricingCard}>
            <Text style={styles.pricingAmount}>Only ₹999</Text>
            <Text style={styles.pricingLabel}>One-Time Access!</Text>
            <Text style={styles.pricingSubtext}>
              No hidden fees, lifetime money-back guarantee.
            </Text>
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, loading && styles.disabledButton]}
          onPress={handleContinue}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.continueButtonText}>
              Subscribe Now - ₹999
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.freeTrialButtonBottom, loading && styles.disabledButton]}
          onPress={handleFreeTrial}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <Text style={styles.freeTrialButtonTextBottom}>
              Start 3-Day Free Trial
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={showPaymentModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select Payment Method</Text>
            <TouchableOpacity
              style={[styles.payOption, paymentMethod === 'razorpay' && styles.payOptionOn]}
              onPress={() => setPaymentMethod('razorpay')}
            >
              <Text style={styles.payOptionText}>UPI / Card (Razorpay)</Text>
            </TouchableOpacity>
            {WALLET_UI_ENABLED ? (
              <TouchableOpacity
                style={[styles.payOption, paymentMethod === 'wallet' && styles.payOptionOn]}
                onPress={() => setPaymentMethod('wallet')}
              >
                <Text style={styles.payOptionText}>
                  Furrmaa Wallet (₹{walletBalance.toLocaleString('en-IN')})
                </Text>
              </TouchableOpacity>
            ) : null}
            <Text style={styles.modalTotal}>Total: ₹{TRAINING_AMOUNT}</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => !loading && setShowPaymentModal(false)}
                disabled={loading}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalPay, loading && styles.disabledButton]}
                onPress={handleConfirmPurchase}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalPayText}>Pay ₹{TRAINING_AMOUNT}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    justifyContent: 'space-between',
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
  imageContainer: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  topImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  titleSection: {
  padding: 20,
  paddingBottom: 10,
  alignItems: 'center',
},

mainTitle: {
  fontSize: 22,
  fontWeight: 'bold',
  color: '#1F2937',
  lineHeight: 30,
  textAlign: 'center',
  marginBottom: 12,
},

description: {
  fontSize: 14,
  color: '#6B7280',
  lineHeight: 20,
  textAlign: 'center',
  maxWidth: '90%',
},

  freeTrialSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  freeTrialButton: {
    backgroundColor: '#95E562',
    paddingVertical: 15,
    borderRadius: 999,
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 40,
  },
  freeTrialButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#060606',
  },
  benefitsSection: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#95E562', 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  checkmark: {
    fontSize: 12,
    color: '#000000',
    fontWeight: 'bold',
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  pricingSection: {
    padding: 20,
    paddingTop: 10,
  },
  pricingCard: {
    backgroundColor: '#95E562',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
  },
  pricingAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  pricingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  pricingSubtext: {
    fontSize: 12,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 18,
  },
  bottomPadding: {
    height: 100,
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
  continueButton: {
    backgroundColor: '#1F2937',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    paddingHorizontal: 60,
    alignSelf: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.6,
  },
  freeTrialButtonBottom: {
    backgroundColor: '#95E562',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    paddingHorizontal: 40,
    alignSelf: 'center',
    marginTop: 10,
  },
  freeTrialButtonTextBottom: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#060606',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 16 },
  payOption: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  payOptionOn: { borderColor: '#1F2E46', backgroundColor: '#F3F4F6' },
  payOptionText: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  modalTotal: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginVertical: 12 },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalCancel: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  modalCancelText: { fontWeight: '600', color: '#374151' },
  modalPay: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#1F2E46',
    alignItems: 'center',
  },
  modalPayText: { fontWeight: '700', color: '#FFFFFF' },
});

export default SubscriptionScreen;

