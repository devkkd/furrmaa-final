import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import leftArrow from '../../assets/images/arrow-left.png';
import accountsIcon from '../../assets/images/moneys.png';
import {
  fetchWallet,
  rechargeWallet,
  withdrawFromWallet,
  isPaymentCancelledError,
  WalletTransaction,
} from '../../services/walletService';
import { WALLET_UI_ENABLED } from '../../config/featureFlags';

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2000];
type TxFilter = 'all' | 'credit' | 'debit';

const WalletScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [txFilter, setTxFilter] = useState<TxFilter>('all');

  const [rechargeVisible, setRechargeVisible] = useState(false);
  const [withdrawVisible, setWithdrawVisible] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('500');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawNote, setWithdrawNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadWallet = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const data = await fetchWallet();
      setBalance(data.balance);
      setTransactions(data.transactions);
    } catch (error: any) {
      console.error('Wallet load failed:', error);
      if (!isRefresh) {
        Alert.alert(
          'Wallet',
          error.response?.data?.message || error.message || 'Could not load wallet'
        );
      }
      setBalance(0);
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!WALLET_UI_ENABLED) {
        navigation.goBack();
        return;
      }
      loadWallet();
    }, [navigation])
  );

  if (!WALLET_UI_ENABLED) return null;

  const parsedRecharge = Number(rechargeAmount.replace(/\D/g, '')) || 0;
  const parsedWithdraw = Number(withdrawAmount.replace(/\D/g, '')) || 0;

  const filteredTransactions = transactions.filter((t) => {
    if (txFilter === 'all') return true;
    return t.type === txFilter;
  });

  const handleRecharge = async () => {
    if (parsedRecharge < 1) {
      Alert.alert('Error', 'Enter a valid amount (minimum ₹1)');
      return;
    }
    setActionLoading(true);
    try {
      await rechargeWallet(parsedRecharge, {
        name: user?.name || '',
        email: user?.email || '',
      });
      setRechargeVisible(false);
      setRechargeAmount('500');
      await loadWallet();
      Alert.alert('Success', `₹${parsedRecharge} added to your wallet`);
    } catch (error: any) {
      if (isPaymentCancelledError(error)) return;
      Alert.alert(
        'Payment failed',
        error.response?.data?.message || error.message || 'Try again'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (parsedWithdraw < 1) {
      Alert.alert('Error', 'Enter a valid amount (minimum ₹1)');
      return;
    }
    if (parsedWithdraw > balance) {
      Alert.alert('Error', 'Amount exceeds available balance');
      return;
    }
    setActionLoading(true);
    try {
      const res = await withdrawFromWallet(parsedWithdraw, withdrawNote);
      setWithdrawVisible(false);
      setWithdrawAmount('');
      setWithdrawNote('');
      await loadWallet();
      Alert.alert('Success', res?.message || `₹${parsedWithdraw} withdrawn successfully`);
    } catch (error: any) {
      Alert.alert(
        'Withdrawal failed',
        error.response?.data?.message || error.message || 'Try again'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openOrderFromTx = (tx: WalletTransaction) => {
    const orderId = tx.order?._id;
    if (!orderId) return;
    (navigation as any).navigate('OrderDetail', { orderId });
  };

  const renderTransaction = ({ item }: { item: WalletTransaction }) => {
    const isCredit = item.type === 'credit';
    const hasOrder = Boolean(item.order?._id);

    return (
      <TouchableOpacity
        style={styles.txRow}
        activeOpacity={hasOrder ? 0.7 : 1}
        onPress={() => hasOrder && openOrderFromTx(item)}
        disabled={!hasOrder}
      >
        <View style={[styles.txIconWrap, isCredit ? styles.txIconCredit : styles.txIconDebit]}>
          <Text style={styles.txIcon}>{isCredit ? '+' : '−'}</Text>
        </View>
        <View style={styles.txBody}>
          <Text style={styles.txTitle} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={styles.txMeta}>
            {item.date}
            {item.status ? ` · ${item.status}` : ''}
            {hasOrder ? ' · View order' : ''}
          </Text>
        </View>
        <Text style={[styles.txAmount, isCredit ? styles.txAmountCredit : styles.txAmountDebit]}>
          {isCredit ? '+' : '−'}₹{item.amount.toLocaleString('en-IN')}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={leftArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1F2E46" />
          <Text style={styles.loadingText}>Loading wallet...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item._id}
          renderItem={renderTransaction}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadWallet(true)} />
          }
          ListHeaderComponent={
            <>
              <View style={styles.balanceCard}>
                <Image source={accountsIcon} style={styles.balanceLogo} resizeMode="contain" />
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Text style={styles.balanceAmount}>₹{balance.toLocaleString('en-IN')}</Text>
                <View style={styles.balanceActions}>
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => setRechargeVisible(true)}
                  >
                    <Text style={styles.primaryBtnText}>Add Money</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => setWithdrawVisible(true)}
                  >
                    <Text style={styles.secondaryBtnText}>Withdraw</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.filterRow}>
                {(['all', 'credit', 'debit'] as TxFilter[]).map((key) => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.filterChip, txFilter === key && styles.filterChipActive]}
                    onPress={() => setTxFilter(key)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        txFilter === key && styles.filterChipTextActive,
                      ]}
                    >
                      {key === 'all' ? 'All' : key === 'credit' ? 'Added' : 'Spent'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionTitle}>
                Transactions
                {transactions.length > 0 ? ` (${filteredTransactions.length})` : ''}
              </Text>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>💳</Text>
              <Text style={styles.emptyTitle}>
                {transactions.length > 0 ? 'No transactions in this filter' : 'No transactions yet'}
              </Text>
              <Text style={styles.emptySub}>
                {transactions.length === 0
                  ? 'Recharge your wallet to pay faster at checkout.'
                  : 'Try another filter.'}
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Recharge modal */}
      <Modal visible={rechargeVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Money</Text>
              <TouchableOpacity onPress={() => !actionLoading && setRechargeVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.fieldLabel}>Amount (₹)</Text>
              <TextInput
                style={styles.fieldInput}
                value={rechargeAmount}
                onChangeText={setRechargeAmount}
                keyboardType="number-pad"
                placeholder="Enter amount"
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.fieldLabel}>Quick select</Text>
              <View style={styles.presetRow}>
                {PRESET_AMOUNTS.map((v) => (
                  <TouchableOpacity
                    key={v}
                    style={[styles.presetChip, parsedRecharge === v && styles.presetChipOn]}
                    onPress={() => setRechargeAmount(String(v))}
                  >
                    <Text
                      style={[
                        styles.presetText,
                        parsedRecharge === v && styles.presetTextOn,
                      ]}
                    >
                      ₹{v}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.hint}>Pay securely via Razorpay (UPI / Card)</Text>
              <TouchableOpacity
                style={[styles.modalSubmit, actionLoading && styles.modalSubmitDisabled]}
                onPress={handleRecharge}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>Pay ₹{parsedRecharge || 0}</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Withdraw modal */}
      <Modal visible={withdrawVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Withdraw</Text>
              <TouchableOpacity onPress={() => !actionLoading && setWithdrawVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.availableHint}>
              Available: ₹{balance.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.fieldLabel}>Amount (₹)</Text>
            <TextInput
              style={styles.fieldInput}
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              keyboardType="number-pad"
              placeholder="Enter amount"
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.fieldLabel}>Note (optional)</Text>
            <TextInput
              style={[styles.fieldInput, styles.noteInput]}
              value={withdrawNote}
              onChangeText={setWithdrawNote}
              placeholder="UPI / bank reference"
              placeholderTextColor="#9CA3AF"
              multiline
            />
            <TouchableOpacity
              style={[styles.modalSubmit, actionLoading && styles.modalSubmitDisabled]}
              onPress={handleWithdraw}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalSubmitText}>Withdraw →</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  backButton: { padding: 5, marginRight: 10 },
  backIcon: { width: 30, height: 30 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', flex: 1 },
  headerPlaceholder: { width: 34 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#6B7280', fontSize: 14 },
  listContent: { paddingHorizontal: 15, paddingBottom: 30 },
  balanceCard: {
    backgroundColor: '#1F2E46',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  balanceLogo: { width: 48, height: 48, marginBottom: 12, tintColor: '#FFFFFF' },
  balanceLabel: { fontSize: 14, color: '#D1D5DB', marginBottom: 6 },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  balanceActions: { flexDirection: 'row', gap: 12, width: '100%' },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#1F2E46', fontWeight: '700', fontSize: 15 },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: { backgroundColor: '#1F2E46', borderColor: '#1F2E46' },
  filterChipText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  filterChipTextActive: { color: '#FFFFFF' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  txIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txIconCredit: { backgroundColor: '#D1FAE5' },
  txIconDebit: { backgroundColor: '#FEE2E2' },
  txIcon: { fontSize: 22, fontWeight: 'bold', color: '#1F2937' },
  txBody: { flex: 1 },
  txTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  txMeta: { fontSize: 12, color: '#6B7280' },
  txAmount: { fontSize: 15, fontWeight: '700' },
  txAmountCredit: { color: '#059669' },
  txAmountDebit: { color: '#DC2626' },
  emptyBox: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
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
    paddingBottom: 36,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  modalClose: { fontSize: 22, color: '#6B7280', padding: 4 },
  availableHint: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  fieldInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 16,
  },
  noteInput: { minHeight: 72, textAlignVertical: 'top' },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  presetChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  presetChipOn: { backgroundColor: '#1F2E46', borderColor: '#1F2E46' },
  presetText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  presetTextOn: { color: '#FFFFFF' },
  hint: { fontSize: 12, color: '#9CA3AF', marginBottom: 20 },
  modalSubmit: {
    backgroundColor: '#1F2E46',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  modalSubmitDisabled: { opacity: 0.6 },
  modalSubmitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

export default WalletScreen;
