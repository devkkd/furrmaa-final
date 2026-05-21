import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import api from '../../config/api';
import leftArrow from '../../assets/images/arrow-left.png';
import searchIcon from '../../assets/images/search-normal.png';
import filterIcon from '../../assets/images/setting-4.png';

interface OrderItem {
  product: {
    _id: string;
    name: string;
    images?: string[];
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  orderStatus: string;
  createdAt: string;
  orderId?: string;
}

const OrdersScreen = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All Orders');

  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, [])
  );

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.CLIENT.get(api.ENDPOINTS.MY_ORDERS);
      if (response.data?.orders) {
        setOrders(response.data.orders);
      }
    } catch (error: any) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `On ${day} ${month} ${year}`;
  };

  const getStatusDisplay = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'confirmed':
      case 'processing':
      case 'packing':
      case 'shipped':
        return 'Ongoing';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status || 'Ongoing';
    }
  };

  const getProductName = (item: OrderItem) => {
    const product = item?.product;
    if (!product) return '';
    if (typeof product === 'object' && product.name) return product.name;
    return '';
  };

  const getOrderSearchText = (order: Order) => {
    const productNames = (order.items || []).map(getProductName).join(' ');
    const idSuffix = (order._id || '').slice(-6);
    return `${productNames} ${order._id || ''} ${idSuffix} ${order.orderId || ''}`.toLowerCase();
  };

  const searchTerm = searchQuery.trim().toLowerCase();

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      !searchTerm || getOrderSearchText(order).includes(searchTerm);

    const statusDisplay = getStatusDisplay(order.orderStatus);
    const matchesFilter =
      selectedFilter === 'All Orders' ||
      statusDisplay.toLowerCase() === selectedFilter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  const hasOrders = orders.length > 0;
  const hasSearchOrFilter = searchTerm.length > 0 || selectedFilter !== 'All Orders';

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
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Image source={searchIcon} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your order here"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Image source={filterIcon} style={styles.filterIcon} />
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      {loading && orders.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item._id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const firstItem = item.items[0];
            const productName = getProductName(firstItem) || 'Product';
            const statusDisplay = getStatusDisplay(item.orderStatus);
            const isOngoing = statusDisplay === 'Ongoing';
            
            return (
              <TouchableOpacity
                style={styles.orderCard}
                onPress={() =>
                  navigation.navigate('OrderDetail' as never, { orderId: item._id } as never)
                }
              >
                <View style={styles.orderImage}>
                  <Text style={styles.orderEmoji}>🦴</Text>
                </View>
                <View style={styles.orderDetails}>
                  <Text style={styles.orderProductName} numberOfLines={2}>
                    {productName}
                    {item.items.length > 1 && ` +${item.items.length - 1} more`}
                  </Text>
                  <Text style={styles.orderId}>Order ID: {item._id.slice(-6).toUpperCase()}</Text>
                  <View style={styles.orderStatusRow}>
                    {isOngoing ? (
                      <>
                        <Text style={styles.statusTextBlue}>{statusDisplay}</Text>
                        <Text style={styles.statusArrow}>→</Text>
                        <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
                      </>
                    ) : (
                      <Text style={styles.statusDateText}>
                        {statusDisplay} {formatDate(item.createdAt)}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.ordersList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {hasOrders && hasSearchOrFilter ? (
                <>
                  <Text style={styles.emptyTitle}>No orders found</Text>
                  <Text style={styles.emptyDescription}>
                    Try a different product name or order ID.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.emptyTitle}>You Have No Orders</Text>
                  <Text style={styles.emptyDescription}>
                    Once you place an order, you'll see updates and delivery details
                    here. Great things come to pets who wait.
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => (navigation as any).navigate('Products')}
                  >
                    <Text style={styles.emptyButtonText}>Start Shopping →</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          }
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            {['All Orders', 'Ongoing', 'Delivered', 'Cancelled'].map(
              (filter) => (
                <TouchableOpacity
                  key={filter}
                  style={styles.filterOption}
                  onPress={() => {
                    setSelectedFilter(filter);
                    setShowFilterModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedFilter === filter &&
                        styles.filterOptionTextSelected,
                    ]}
                  >
                    {filter}
                  </Text>
                  {selectedFilter === filter && (
                    <View style={styles.radioSelected}>
                      <View style={styles.radioInner} />
                    </View>
                  )}
                </TouchableOpacity>
              )
            )}
          </View>
        </TouchableOpacity>
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
    paddingTop: 50,
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  backIcon: {
    width: 30,
    height: 30,
    color: '#1F2937',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  placeholder: {
    width: 34,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 10,
    gap: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 40,
  },
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    paddingVertical: 4,
    paddingHorizontal: 0,
    minHeight: 32,
  },
  filterButton: {
    padding: 8,
    backgroundColor: '#1F2E46',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterIcon: {
    width: 20,
    height: 20,
  },
  ordersList: {
    padding: 15,
    paddingBottom: 20,
  },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    // borderWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D9DCE2',
  },
  orderImage: {
    width: 100,
    height: 100,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  orderImageStyle: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  orderDetails: {
    flex: 1,
  },
  orderProductName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 20,
  },
  orderId: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  orderStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  statusTextBlue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },

  orderDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusDateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
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
  emptyButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeIcon: {
    fontSize: 24,
    color: '#6B7280',
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  filterOptionTextSelected: {
    fontWeight: '600',
    color: '#1E3A8A',
  },
  radioSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1E3A8A',
  },
});

export default OrdersScreen;
