import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../config/api';
import { getProductImageUri } from '../../utils/productImage';

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  petType: string[];
  price: number;
  discountPrice?: number;
  stock: number;
  images: string[];
  isActive: boolean;
}

const AdminProductsScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'update' | 'delete'>('list');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'list' || activeTab === 'update' || activeTab === 'delete') {
      fetchProducts();
    }
  }, [activeTab]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.CLIENT.get(api.ENDPOINTS.ADMIN.PRODUCTS);
      setProducts(response.data.products || []);
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      // Open template download URL in browser
      const templateUrl = `${api.BASE_URL}${api.ENDPOINTS.ADMIN.PRODUCTS_TEMPLATE}`;
      const canOpen = await Linking.canOpenURL(templateUrl);
      
      if (canOpen) {
        await Linking.openURL(templateUrl);
        Alert.alert('Template Download', 'Excel template will download in your browser.');
      } else {
        Alert.alert(
          'Template Download',
          `Please visit this URL to download the template:\n${templateUrl}\n\nOr use the web admin panel.`,
          [{ text: 'OK' }]
        );
      }
    } catch (err: any) {
      Alert.alert('Error', 'Failed to open template download. Please use the web admin panel.');
    }
  };

  const handleBulkUpload = () => {
    Alert.alert(
      'Bulk Upload',
      'For React Native, please use the web admin panel for bulk upload, or contact support for alternative methods.\n\nAlternatively, you can use the API directly with a tool like Postman.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Web Admin',
          onPress: () => {
            const webUrl = api.BASE_URL.replace('/api', '/admin');
            Linking.openURL(webUrl).catch(() => {
              Alert.alert('Error', 'Could not open web admin. Please use a browser.');
            });
          },
        },
      ]
    );
  };

  const handleDelete = (productId: string, productName: string) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${productName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.CLIENT.delete(`${api.ENDPOINTS.ADMIN.PRODUCTS}/${productId}`);
              Alert.alert('Success', 'Product deleted successfully');
              fetchProducts();
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.productImageContainer}>
        {getProductImageUri(item) ? (
          <Image source={{ uri: getProductImageUri(item)! }} style={styles.productImage} />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Text style={styles.placeholderText}>📦</Text>
          </View>
        )}
        {!item.isActive && (
          <View style={styles.inactiveBadge}>
            <Text style={styles.inactiveText}>Inactive</Text>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productCategory}>{item.category}</Text>
        <View style={styles.priceRow}>
          {item.discountPrice && item.discountPrice < item.price ? (
            <>
              <Text style={styles.originalPrice}>₹{item.price}</Text>
              <Text style={styles.productPrice}>₹{item.discountPrice}</Text>
            </>
          ) : (
            <Text style={styles.productPrice}>₹{item.price}</Text>
          )}
        </View>
        <Text style={styles.stockText}>Stock: {item.stock}</Text>
        {activeTab === 'update' && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('ProductForm' as never, { productId: item._id } as never)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
        {activeTab === 'delete' && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item._id, item.name)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Products</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'list' && styles.activeTab]}
          onPress={() => setActiveTab('list')}
        >
          <Text style={[styles.tabText, activeTab === 'list' && styles.activeTabText]}>
            List
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'add' && styles.activeTab]}
          onPress={() => setActiveTab('add')}
        >
          <Text style={[styles.tabText, activeTab === 'add' && styles.activeTabText]}>
            Add
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'update' && styles.activeTab]}
          onPress={() => setActiveTab('update')}
        >
          <Text style={[styles.tabText, activeTab === 'update' && styles.activeTabText]}>
            Update
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'delete' && styles.activeTab]}
          onPress={() => setActiveTab('delete')}
        >
          <Text style={[styles.tabText, activeTab === 'delete' && styles.activeTabText]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'add' ? (
        <ScrollView style={styles.addContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.addSection}>
            <Text style={styles.sectionTitle}>Add Single Product</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('ProductForm' as never, {} as never)}
            >
              <Text style={styles.addButtonText}>+ Add Product</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.addSection}>
            <Text style={styles.sectionTitle}>Bulk Upload (Excel)</Text>
            <Text style={styles.sectionDescription}>
              Upload multiple products at once using an Excel file
            </Text>
            
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={handleDownloadTemplate}
            >
              <Text style={styles.downloadButtonText}>📥 Download Excel Template</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleBulkUpload}
            >
              <Text style={styles.uploadButtonText}>📤 Upload Excel File</Text>
            </TouchableOpacity>

            {uploadStatus && (
              <View style={styles.uploadStatus}>
                <Text style={styles.uploadStatusText}>{uploadStatus}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      ) : loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No products found</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={fetchProducts}
        />
      )}
    </View>
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
    padding: 20,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#1E3A8A',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
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
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  addPrompt: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 15,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 15,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 40,
  },
  inactiveBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  inactiveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginLeft: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  stockText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default AdminProductsScreen;
