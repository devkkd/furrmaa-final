import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import {
  payForSubscriptionPlan,
  SUBSCRIPTION_PLAN_AMOUNTS,
  isPaymentCancelledError,
} from '../../services/razorpayPayment';
import { paySubscriptionWithWallet } from '../../services/walletService';
import { WALLET_UI_ENABLED } from '../../config/featureFlags';

interface Subscription {
  _id?: string;
  plan: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  autoRenew: boolean;
  nextBillingDate?: string;
  lastPaymentDate?: string;
}

const SubscriptionScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchSubscription();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchSubscription();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await api.CLIENT.get(api.ENDPOINTS.SUBSCRIPTION);
      setSubscription(response.data.subscription);
    } catch (error: any) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const runPaidSubscription = (planKey: string, amount: number, successMessage: string) => {
    const buttons: { text: string; style?: 'cancel'; onPress?: () => void | Promise<void> }[] = [
      { text: 'Cancel', style: 'cancel' },
    ];
    if (WALLET_UI_ENABLED) {
      buttons.push({
        text: 'Wallet',
        onPress: async () => {
          setUpdating(true);
          try {
            await paySubscriptionWithWallet(planKey, amount);
            Alert.alert('Success', successMessage);
            fetchSubscription();
          } catch (error: any) {
            Alert.alert(
              'Wallet payment failed',
              error.response?.data?.message || error.message || 'Try again'
            );
          } finally {
            setUpdating(false);
          }
        },
      });
    }
    buttons.push({
      text: 'Card / UPI',
      onPress: async () => {
        setUpdating(true);
        try {
          await payForSubscriptionPlan(planKey, amount, {
            name: user?.name || '',
            email: user?.email || '',
          });
          Alert.alert('Success', successMessage);
          fetchSubscription();
        } catch (error: any) {
          if (isPaymentCancelledError(error)) return;
          Alert.alert(
            'Payment failed',
            error.response?.data?.message || error.message || 'Try again'
          );
        } finally {
          setUpdating(false);
        }
      },
    });
    Alert.alert('Payment method', `Pay ₹${amount} for this plan`, buttons);
  };

  const plans = [
    {
      name: 'Free',
      planKey: 'free',
      amount: 0,
      price: '₹0',
      features: ['Basic features', 'Limited products', 'Community support'],
    },
    {
      name: 'Basic',
      planKey: 'basic',
      amount: 299,
      price: '₹299/month',
      features: ['All features', 'Unlimited products', 'Priority support', 'Early access'],
    },
    {
      name: 'Premium',
      planKey: 'premium',
      amount: 599,
      price: '₹599/month',
      features: ['All Basic features', 'AI Chatbot', 'Premium support', 'Exclusive deals'],
    },
    {
      name: 'Premium Plus',
      planKey: 'premium_plus',
      amount: 999,
      price: '₹999/month',
      features: ['All Premium features', '24/7 Support', 'Personal assistant', 'VIP access'],
    },
  ];

  const handleRenew = async () => {
    if (!subscription) return;
    const planKey = subscription.plan;
    const amount = SUBSCRIPTION_PLAN_AMOUNTS[planKey] ?? 0;
    if (amount <= 0) {
      Alert.alert('Info', 'Free plan does not require renewal payment.');
      return;
    }
    const planName = plans.find((p) => p.planKey === planKey)?.name || 'current';
    Alert.alert(
      'Renew Subscription',
      `Pay ₹${amount} to renew your ${planName} plan for 30 days?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay & Renew',
          onPress: () =>
            runPaidSubscription(planKey, amount, 'Subscription renewed successfully!'),
        },
      ]
    );
  };

  const handleToggleAutoRenew = async (value: boolean) => {
    if (!subscription) return;

    try {
      setUpdating(true);
      const response = await api.CLIENT.put(api.ENDPOINTS.SUBSCRIPTION, {
        autoRenew: value,
      });

      if (response.data.success) {
        setSubscription({ ...subscription, autoRenew: value });
        Alert.alert('Success', `Auto-renew ${value ? 'enabled' : 'disabled'}`);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update auto-renew');
    } finally {
      setUpdating(false);
    }
  };

  const handlePlanSelect = (plan: (typeof plans)[0]) => {
    const isUpgrade = subscription?.plan === 'free';
    Alert.alert(
      isUpgrade ? 'Upgrade' : 'Switch Plan',
      plan.amount > 0
        ? `Pay ₹${plan.amount} to ${isUpgrade ? 'upgrade' : 'switch'} to ${plan.name}?`
        : `Switch to ${plan.name} plan?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: plan.amount > 0 ? 'Pay' : 'Confirm',
          onPress: async () => {
            if (plan.amount <= 0) {
              try {
                setUpdating(true);
                const response = await api.CLIENT.post(`${api.ENDPOINTS.SUBSCRIPTION}/upgrade`, {
                  plan: plan.planKey,
                });
                if (response.data.success) {
                  Alert.alert('Success', `Switched to ${plan.name} plan`);
                  fetchSubscription();
                }
              } catch (error: any) {
                Alert.alert('Error', error.response?.data?.message || 'Failed to switch plan');
              } finally {
                setUpdating(false);
              }
              return;
            }
            runPaidSubscription(
              plan.planKey,
              plan.amount,
              `Successfully ${isUpgrade ? 'upgraded' : 'switched'} to ${plan.name}!`
            );
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Loading subscription...</Text>
      </View>
    );
  }

  const currentPlan = plans.find((p) => p.planKey === subscription?.plan) || plans[0];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Subscription</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.currentPlanCard}>
        <Text style={styles.currentPlanLabel}>Current Plan</Text>
        <Text style={styles.currentPlanName}>{currentPlan.name}</Text>
        <Text style={styles.currentPlanPrice}>{currentPlan.price}</Text>
        {subscription?.isActive && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeText}>Active</Text>
          </View>
        )}

        {subscription?.plan !== 'free' && subscription?.endDate && (
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>End Date:</Text>
            <Text style={styles.dateValue}>
              {new Date(subscription.endDate).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            {new Date(subscription.endDate) < new Date() && (
              <Text style={styles.expiredText}>Expired</Text>
            )}
          </View>
        )}

        {subscription?.plan !== 'free' && subscription?.nextBillingDate && subscription?.autoRenew && (
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>Next Billing:</Text>
            <Text style={styles.dateValue}>
              {new Date(subscription.nextBillingDate).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        )}

        {subscription?.plan !== 'free' && (
          <View style={styles.autoRenewContainer}>
            <Text style={styles.autoRenewLabel}>Auto-Renew</Text>
            <Switch
              value={subscription.autoRenew}
              onValueChange={handleToggleAutoRenew}
              trackColor={{ false: '#E5E7EB', true: '#1E3A8A' }}
              thumbColor={subscription.autoRenew ? '#FFFFFF' : '#F3F4F6'}
              disabled={updating}
            />
          </View>
        )}

        {subscription?.plan !== 'free' && subscription?.isActive && (
          <TouchableOpacity style={styles.renewButton} onPress={handleRenew} disabled={updating}>
            {updating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.renewButtonText}>Renew Subscription</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Plans</Text>
        {plans.map((plan, index) => (
          <View
            key={index}
            style={[styles.planCard, subscription?.plan === plan.planKey && styles.planCardActive]}
          >
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planPrice}>{plan.price}</Text>
            </View>
            <View style={styles.featuresContainer}>
              {plan.features.map((feature, idx) => (
                <View key={idx} style={styles.featureItem}>
                  <Text style={styles.featureIcon}>✓</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
            {subscription?.plan !== plan.planKey && (
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => handlePlanSelect(plan)}
                disabled={updating}
              >
                <Text style={styles.upgradeButtonText}>
                  {subscription && subscription.plan === 'free' ? 'Upgrade' : 'Switch Plan'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 14, color: '#6B7280' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: { fontSize: 24, color: '#1E3A8A', fontWeight: 'bold' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  currentPlanCard: {
    backgroundColor: '#1E3A8A',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  currentPlanLabel: { fontSize: 14, color: '#E5E7EB', marginBottom: 8 },
  currentPlanName: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  currentPlanPrice: { fontSize: 18, color: '#E5E7EB', marginBottom: 12 },
  activeBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  dateInfo: {
    marginTop: 15,
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    width: '100%',
  },
  dateLabel: { fontSize: 12, color: '#E5E7EB', marginBottom: 4 },
  dateValue: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  expiredText: { fontSize: 12, color: '#FEE2E2', fontWeight: '600' },
  autoRenewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    width: '100%',
  },
  autoRenewLabel: { fontSize: 14, color: '#FFFFFF', fontWeight: '500' },
  renewButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
    width: '100%',
  },
  renewButtonText: { color: '#1E3A8A', fontSize: 16, fontWeight: '600' },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 15 },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  planCardActive: { borderColor: '#1E3A8A', backgroundColor: '#EFF6FF' },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  planName: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  planPrice: { fontSize: 18, fontWeight: '600', color: '#1E3A8A' },
  featuresContainer: { marginBottom: 15 },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  featureIcon: { fontSize: 16, color: '#10B981', marginRight: 8 },
  featureText: { fontSize: 14, color: '#6B7280' },
  upgradeButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});

export default SubscriptionScreen;
