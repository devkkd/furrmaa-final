import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../config/api';
import { WALLET_UI_ENABLED } from '../../config/featureFlags';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  recentOrders: any[];
}

const AdminDashboardScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.CLIENT.get(api.ENDPOINTS.ADMIN.DASHBOARD);
      setStats(response.data.stats);
    } catch (err: any) {
      console.error('Failed to fetch dashboard stats:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load dashboard';
      setError(errorMessage);
      // Don't show alert for 401/403 errors - just show error message
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error && !stats) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchDashboardStats}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.totalUsers || 0}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.totalProducts || 0}</Text>
          <Text style={styles.statLabel}>Total Products</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.totalOrders || 0}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
      </View>

      {/* Additional Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.pendingOrders || 0}</Text>
          <Text style={styles.statLabel}>Pending Orders</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}</Text>
          <Text style={styles.statLabel}>Total Revenue</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity
          style={[styles.actionCard, styles.featuredCard]}
          onPress={() => navigation.navigate('AdminProducts' as never, {} as never)}
        >
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>📦</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Manage Products</Text>
            <Text style={styles.actionSubtitle}>Add, edit, or delete products with tabs</Text>
          </View>
          <Text style={styles.arrowIcon}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('AdminOrders' as never, {} as never)}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Manage Orders</Text>
            <Text style={styles.actionSubtitle}>View and update order status</Text>
          </View>
          <Text style={styles.arrowIcon}>→</Text>
        </TouchableOpacity>
        {WALLET_UI_ENABLED ? (
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('AdminWallets' as never, {} as never)}
          >
            <Text style={styles.actionIcon}>💰</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Manage Wallets</Text>
              <Text style={styles.actionSubtitle}>User balances and wallet activity</Text>
            </View>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('AdminTrainingVideos' as never, {} as never)}
        >
          <Text style={styles.actionIcon}>🎓</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Manage Training Videos</Text>
            <Text style={styles.actionSubtitle}>Add, edit, or delete training videos and trainers</Text>
          </View>
          <Text style={styles.arrowIcon}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('AdminPosts' as never, {} as never)}
        >
          <Text style={styles.actionIcon}>📱</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Manage Feed Posts</Text>
            <Text style={styles.actionSubtitle}>View, edit, or delete social feed posts</Text>
          </View>
          <Text style={styles.arrowIcon}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('AdminVeterinarians' as never, {} as never)}
        >
          <Text style={styles.actionIcon}>🏥</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Manage Veterinarians</Text>
            <Text style={styles.actionSubtitle}>Add, edit, or deactivate veterinarians</Text>
          </View>
          <Text style={styles.arrowIcon}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('AdminVetServiceTypes' as never, {} as never)}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Vet Service Types</Text>
            <Text style={styles.actionSubtitle}>Add types: Pet Shops, Hospitals, NGOs, etc. (shown on Vet Services)</Text>
          </View>
          <Text style={styles.arrowIcon}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('AdminHopePosts' as never, {} as never)}
        >
          <Text style={styles.actionIcon}>🐾</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Manage Hope Posts</Text>
            <Text style={styles.actionSubtitle}>Lost & Found, Adoption – edit, close, or delete posts</Text>
          </View>
          <Text style={styles.arrowIcon}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('AdminPetEvents' as never, {} as never)}
        >
          <Text style={styles.actionIcon}>📅</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Manage Pet Events</Text>
            <Text style={styles.actionSubtitle}>Add, edit, or delete pet events and workshops</Text>
          </View>
          <Text style={styles.arrowIcon}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('AdminCremationCenters' as never, {} as never)}
        >
          <Text style={styles.actionIcon}>🕊️</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Cremation Centers</Text>
            <Text style={styles.actionSubtitle}>Add centers by city — shown in More → Cremation</Text>
          </View>
          <Text style={styles.arrowIcon}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('AdminExploreContent' as never, {} as never)}
        >
          <Text style={styles.actionIcon}>🔍</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Explore Content</Text>
            <Text style={styles.actionSubtitle}>Featured articles and tips on Explore screen</Text>
          </View>
          <Text style={styles.arrowIcon}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('AdminUsers' as never, {} as never)}
        >
          <Text style={styles.actionIcon}>👥</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Manage Users</Text>
            <Text style={styles.actionSubtitle}>View, edit, or deactivate users</Text>
          </View>
          <Text style={styles.arrowIcon}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('AdminFAQ' as never, {} as never)}
        >
          <Text style={styles.actionIcon}>❓</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Manage FAQs</Text>
            <Text style={styles.actionSubtitle}>Add, edit, or delete FAQs</Text>
          </View>
          <Text style={styles.arrowIcon}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('AdminFeedback' as never, {} as never)}
        >
          <Text style={styles.actionIcon}>👍</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Manage Feedback</Text>
            <Text style={styles.actionSubtitle}>View and respond to feedback</Text>
          </View>
          <Text style={styles.arrowIcon}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('AdminSupport' as never, {} as never)}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Support Chats</Text>
            <Text style={styles.actionSubtitle}>Manage customer support chats</Text>
          </View>
          <Text style={styles.arrowIcon}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('AdminNotifications' as never, {} as never)}
        >
          <Text style={styles.actionIcon}>🔔</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Send Notifications</Text>
            <Text style={styles.actionSubtitle}>Send notifications to users</Text>
          </View>
          <Text style={styles.arrowIcon}>→</Text>
        </TouchableOpacity>
        
      </View>

      {/* Recent Orders */}
      {stats?.recentOrders && stats.recentOrders.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AdminOrders' as never)}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {stats.recentOrders.slice(0, 5).map((order: any) => (
            <TouchableOpacity
              key={order._id}
              style={styles.orderCard}
              onPress={() => navigation.navigate('AdminOrders' as never, {} as never)}
            >
              <View style={styles.orderInfo}>
                <Text style={styles.orderId}>Order #{order._id.slice(-6).toUpperCase()}</Text>
                <Text style={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
                {order.user && (
                  <Text style={styles.orderCustomer}>{order.user.name || order.user.email}</Text>
                )}
              </View>
              <Text style={styles.orderStatus}>{order.orderStatus || 'Pending'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    fontSize: 24,
    color: '#1E3A8A',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 30,
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
    color: '#1F2937',
  },
  viewAllText: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#1E3A8A',
    backgroundColor: '#EFF6FF',
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  arrowIcon: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  orderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  orderCustomer: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E3A8A',
    textTransform: 'uppercase',
  },
});

export default AdminDashboardScreen;


