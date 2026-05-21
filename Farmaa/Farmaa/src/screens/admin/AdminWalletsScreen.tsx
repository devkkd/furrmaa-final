import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import api from '../../config/api';

interface WalletRow {
  _id: string;
  balance: number;
  user?: { _id?: string; name?: string; email?: string; phone?: string };
}

interface WalletStats {
  totalWallets: number;
  totalBalance: number;
}

const AdminWalletsScreen = () => {
  const navigation = useNavigation();
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const [walletsRes, statsRes] = await Promise.all([
        api.CLIENT.get(api.ENDPOINTS.ADMIN.WALLETS),
        api.CLIENT.get(api.ENDPOINTS.ADMIN.WALLETS_STATS),
      ]);
      setWallets(walletsRes.data?.wallets || []);
      setStats(statsRes.data?.stats || null);
    } catch (err: any) {
      console.error('Admin wallets load failed:', err);
      setWallets([]);
      setStats(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Wallets</Text>
        <View style={{ width: 30 }} />
      </View>

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1E3A8A" />
        </View>
      ) : (
        <FlatList
          data={wallets}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
          }
          ListHeaderComponent={
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats?.totalWallets ?? wallets.length}</Text>
                <Text style={styles.statLabel}>Wallets</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  ₹{(stats?.totalBalance ?? 0).toLocaleString('en-IN')}
                </Text>
                <Text style={styles.statLabel}>Total balance</Text>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.userName}>{item.user?.name || 'User'}</Text>
                <Text style={styles.balance}>₹{(item.balance || 0).toLocaleString('en-IN')}</Text>
              </View>
              <Text style={styles.meta}>{item.user?.email || '—'}</Text>
              {item.user?.phone ? (
                <Text style={styles.meta}>{item.user.phone}</Text>
              ) : null}
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No wallets found</Text>
          }
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  back: { fontSize: 24, color: '#1F2937' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 15, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: '#1F2E46',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  statLabel: { fontSize: 12, color: '#D1D5DB', marginTop: 4 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: { fontSize: 16, fontWeight: '600', color: '#1F2937', flex: 1 },
  balance: { fontSize: 16, fontWeight: '700', color: '#059669' },
  meta: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  empty: { textAlign: 'center', color: '#6B7280', marginTop: 40 },
});

export default AdminWalletsScreen;
