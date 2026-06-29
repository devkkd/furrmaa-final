import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import api from '../../config/api';

const NAVY = '#1F2E46';

type CremationRequest = {
  _id: string;
  status?: string;
  petInformation?: { petName?: string };
  petName?: string;
  center?: { name?: string; city?: string };
  createdAt?: string;
};

const MyCremationRequestsScreen = () => {
  const navigation = useNavigation();
  const [requests, setRequests] = useState<CremationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.CLIENT.get(`${api.ENDPOINTS.CREMATION}/requests/me`);
      setRequests(res.data?.requests || []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchRequests();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Cremation Requests</Text>
      </View>

      {loading && requests.length === 0 ? (
        <ActivityIndicator size="large" color={NAVY} style={{ marginTop: 40 }} />
      ) : requests.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No requests yet</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Cremation' as never)}>
            <Text style={styles.link}>Browse cremation centers →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.petName}>{item.petInformation?.petName || item.petName || 'Pet'}</Text>
                <Text style={styles.status}>{item.status || 'pending'}</Text>
              </View>
              <Text style={styles.sub}>{item.center?.name} · {item.center?.city}</Text>
              {item.createdAt ? (
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleString('en-IN')}</Text>
              ) : null}
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  back: { color: NAVY, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#111' },
  empty: { padding: 32, alignItems: 'center' },
  emptyTitle: { fontSize: 16, color: '#666', marginBottom: 12 },
  link: { color: NAVY, fontWeight: '700' },
  card: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#eee' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  petName: { fontWeight: '700', fontSize: 16 },
  status: { fontSize: 12, textTransform: 'capitalize', backgroundColor: '#e5e7eb', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  sub: { color: '#666', fontSize: 13 },
  date: { color: '#999', fontSize: 11, marginTop: 6 },
});

export default MyCremationRequestsScreen;
