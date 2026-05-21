import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  FlatList,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../../config/api';
import { pickAndUploadImage, pickMultipleImages } from '../../utils/imageUpload';
import { normalizeUrlList } from '../../utils/productImage';
import AdminTextInput from './AdminTextInput';

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
}
interface OptionItem {
  _id: string;
  name: string;
  slug: string;
}

const PET_TYPES = ['dog', 'cat', 'both'];
const AGE_OPTIONS = ['all', 'puppy', 'young', 'adult', 'senior'];

const ProductFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const productId = (route.params as any)?.productId;

  const [loading, setLoading] = useState(false);
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>([]);
  const [addCategoryVisible, setAddCategoryVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [sizesList, setSizesList] = useState<OptionItem[]>([]);
  const [dietaryList, setDietaryList] = useState<OptionItem[]>([]);
  const [addSizeVisible, setAddSizeVisible] = useState(false);
  const [newSizeName, setNewSizeName] = useState('');
  const [addingSize, setAddingSize] = useState(false);
  const [addDietaryVisible, setAddDietaryVisible] = useState(false);
  const [newDietaryName, setNewDietaryName] = useState('');
  const [addingDietary, setAddingDietary] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    petType: ['both'] as string[],
    age: 'all' as string,
    size: '',
    dietaryNeeds: [] as string[],
    price: '',
    discountAmount: '',
    stock: '',
    brand: '',
    images: [] as string[],
    isActive: true,
  });

  const fetchCategories = async () => {
    try {
      const res = await api.CLIENT.get(api.ENDPOINTS.CATEGORIES);
      const list = res.data?.categories || [];
      setCategoriesList(list);
      if (list.length > 0) {
        setFormData((prev) => {
          const current = prev.category;
          const exists = list.some((c) => c.slug === current);
          return { ...prev, category: exists ? current : list[0].slug };
        });
      }
    } catch (_) {
      setCategoriesList([]);
    }
  };

  const fetchSizes = async () => {
    try {
      const res = await api.CLIENT.get(api.ENDPOINTS.SIZES);
      setSizesList(res.data?.sizes || []);
    } catch (_) {
      setSizesList([]);
    }
  };
  const fetchDietary = async () => {
    try {
      const res = await api.CLIENT.get(api.ENDPOINTS.DIETARY);
      setDietaryList(res.data?.dietary || []);
    } catch (_) {
      setDietaryList([]);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSizes();
    fetchDietary();
  }, []);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.CLIENT.get(`${api.ENDPOINTS.ADMIN.PRODUCTS}/${productId}`);
      const product = response.data.product || response.data; // Handle both response formats
      const priceNum = Number(product.price) || 0;
      const discountPriceNum = Number(product.discountPrice) || 0;
      const discountAmount = discountPriceNum > 0 && priceNum > discountPriceNum
        ? String(priceNum - discountPriceNum)
        : '';
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || 'food',
        petType: product.petType || ['both'],
        age: product.age || 'all',
        size: product.size || '',
        dietaryNeeds: Array.isArray(product.dietaryNeeds) ? product.dietaryNeeds : [],
        price: product.price?.toString() || '',
        discountAmount,
        stock: product.stock?.toString() || '',
        brand: product.brand || '',
        images: normalizeUrlList(product.images),
        isActive: product.isActive !== undefined ? product.isActive : true,
      });
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to load product');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handlePetTypeToggle = (type: string) => {
    if (type === 'both') {
      setFormData({ ...formData, petType: ['both'] });
    } else {
      const newPetType = formData.petType.includes(type)
        ? formData.petType.filter((t) => t !== type)
        : [...formData.petType.filter((t) => t !== 'both'), type];
      setFormData({ ...formData, petType: newPetType.length > 0 ? newPetType : ['both'] });
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Product name is required');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Product description is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert('Error', 'Valid price is required');
      return;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      Alert.alert('Error', 'Valid stock quantity is required');
      return;
    }
    if (!formData.category?.trim()) {
      Alert.alert('Error', 'Please select a category (or add one)');
      return;
    }

    try {
      setLoading(true);
      const priceNum = parseFloat(formData.price);
      const discountAmt = formData.discountAmount ? parseFloat(formData.discountAmount) : 0;
      const discountPrice =
        discountAmt > 0 && discountAmt < priceNum ? priceNum - discountAmt : undefined;
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        petType: formData.petType,
        age: formData.age,
        size: formData.size?.trim() || undefined,
        dietaryNeeds: formData.dietaryNeeds?.length ? formData.dietaryNeeds : undefined,
        price: priceNum,
        discountPrice,
        stock: parseInt(formData.stock),
        brand: formData.brand.trim() || undefined,
        images: normalizeUrlList(formData.images),
        isActive: formData.isActive,
      };

      if (productId) {
        await api.CLIENT.put(`${api.ENDPOINTS.ADMIN.PRODUCTS}/${productId}`, payload);
        Alert.alert('Success', 'Product updated successfully');
      } else {
        await api.CLIENT.post(api.ENDPOINTS.ADMIN.PRODUCTS, payload);
        Alert.alert('Success', 'Product created successfully');
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (loading && productId) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {productId ? 'Edit Product' : 'Add Product'}
        </Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Product Name *</Text>
          <AdminTextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Enter product name"
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <AdminTextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Enter product description"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Category – dynamic from API; admin can add new */}
        <View style={styles.section}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryContainer}>
            {categoriesList.map((cat) => (
              <TouchableOpacity
                key={cat._id}
                style={[
                  styles.categoryButton,
                  formData.category === cat.slug && styles.categoryButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, category: cat.slug })}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    formData.category === cat.slug && styles.categoryButtonTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.categoryButton, styles.addCategoryButton]}
              onPress={() => {
                setNewCategoryName('');
                setAddCategoryVisible(true);
              }}
            >
              <Text style={styles.addCategoryButtonText}>+ Add category</Text>
            </TouchableOpacity>
          </View>
          <Modal
            visible={addCategoryVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setAddCategoryVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add new category</Text>
                <AdminTextInput
                  style={styles.input}
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  placeholder="e.g. Dog Food, Treats"
                  autoCapitalize="words"
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={() => setAddCategoryVisible(false)}
                  >
                    <Text style={styles.modalButtonCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonAdd]}
                    disabled={addingCategory || !newCategoryName.trim()}
                    onPress={async () => {
                      if (!newCategoryName.trim()) return;
                      setAddingCategory(true);
                      try {
                        const res = await api.CLIENT.post(api.ENDPOINTS.ADMIN.CATEGORIES, {
                          name: newCategoryName.trim(),
                        });
                        const newCat = res.data?.category;
                        if (newCat) {
                          setCategoriesList((prev) => [...prev, newCat]);
                          setFormData((prev) => ({ ...prev, category: newCat.slug }));
                          setAddCategoryVisible(false);
                          Alert.alert('Success', `Category "${newCat.name}" added`);
                        }
                      } catch (err: any) {
                        Alert.alert(
                          'Error',
                          err.response?.data?.message || 'Failed to add category',
                        );
                      } finally {
                        setAddingCategory(false);
                      }
                    }}
                  >
                    <Text style={styles.modalButtonAddText}>
                      {addingCategory ? 'Adding…' : 'Add'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          {/* Add Size modal */}
          <Modal visible={addSizeVisible} transparent animationType="fade" onRequestClose={() => setAddSizeVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add new size</Text>
                <AdminTextInput
                  style={styles.input}
                  value={newSizeName}
                  onChangeText={setNewSizeName}
                  placeholder="e.g. Extra Small, XXL"
                  autoCapitalize="words"
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={() => setAddSizeVisible(false)}>
                    <Text style={styles.modalButtonCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonAdd]}
                    disabled={addingSize || !newSizeName.trim()}
                    onPress={async () => {
                      if (!newSizeName.trim()) return;
                      setAddingSize(true);
                      try {
                        const res = await api.CLIENT.post(api.ENDPOINTS.ADMIN.SIZES, { name: newSizeName.trim() });
                        const newSize = res.data?.size;
                        if (newSize) {
                          setSizesList((prev) => [...prev, newSize]);
                          setFormData((prev) => ({ ...prev, size: newSize.slug }));
                          setAddSizeVisible(false);
                          Alert.alert('Success', `Size "${newSize.name}" added`);
                        }
                      } catch (err: any) {
                        Alert.alert('Error', err.response?.data?.message || 'Failed to add size');
                      } finally {
                        setAddingSize(false);
                      }
                    }}
                  >
                    <Text style={styles.modalButtonAddText}>{addingSize ? 'Adding…' : 'Add'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          {/* Add Dietary modal */}
          <Modal visible={addDietaryVisible} transparent animationType="fade" onRequestClose={() => setAddDietaryVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add new dietary option</Text>
                <AdminTextInput
                  style={styles.input}
                  value={newDietaryName}
                  onChangeText={setNewDietaryName}
                  placeholder="e.g. Vegan, Senior Formula"
                  autoCapitalize="words"
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={() => setAddDietaryVisible(false)}>
                    <Text style={styles.modalButtonCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonAdd]}
                    disabled={addingDietary || !newDietaryName.trim()}
                    onPress={async () => {
                      if (!newDietaryName.trim()) return;
                      setAddingDietary(true);
                      try {
                        const res = await api.CLIENT.post(api.ENDPOINTS.ADMIN.DIETARY, { name: newDietaryName.trim() });
                        const newDietary = res.data?.dietary;
                        if (newDietary) {
                          setDietaryList((prev) => [...prev, newDietary]);
                          setFormData((prev) => ({ ...prev, dietaryNeeds: [...prev.dietaryNeeds, newDietary.slug] }));
                          setAddDietaryVisible(false);
                          Alert.alert('Success', `Dietary "${newDietary.name}" added`);
                        }
                      } catch (err: any) {
                        Alert.alert('Error', err.response?.data?.message || 'Failed to add dietary option');
                      } finally {
                        setAddingDietary(false);
                      }
                    }}
                  >
                    <Text style={styles.modalButtonAddText}>{addingDietary ? 'Adding…' : 'Add'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>

        {/* Age */}
        <View style={styles.section}>
          <Text style={styles.label}>Age</Text>
          <View style={styles.categoryContainer}>
            {AGE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.categoryButton,
                  formData.age === opt && styles.categoryButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, age: opt })}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    formData.age === opt && styles.categoryButtonTextActive,
                  ]}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Pet Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Pet Type *</Text>
          <View style={styles.petTypeContainer}>
            {PET_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.petTypeButton,
                  formData.petType.includes(type) && styles.petTypeButtonActive,
                ]}
                onPress={() => handlePetTypeToggle(type)}
              >
                <Text
                  style={[
                    styles.petTypeButtonText,
                    formData.petType.includes(type) && styles.petTypeButtonTextActive,
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Size – dynamic; admin can add */}
        <View style={styles.section}>
          <Text style={styles.label}>Size</Text>
          <View style={styles.categoryContainer}>
            {sizesList.map((s) => (
              <TouchableOpacity
                key={s._id}
                style={[
                  styles.categoryButton,
                  formData.size === s.slug && styles.categoryButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, size: formData.size === s.slug ? '' : s.slug })}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    formData.size === s.slug && styles.categoryButtonTextActive,
                  ]}
                >
                  {s.name}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.categoryButton, styles.addCategoryButton]}
              onPress={() => { setNewSizeName(''); setAddSizeVisible(true); }}
            >
              <Text style={styles.addCategoryButtonText}>+ Add size</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dietary Needs – dynamic; admin can add; multi-select */}
        <View style={styles.section}>
          <Text style={styles.label}>Dietary Needs</Text>
          <View style={styles.categoryContainer}>
            {dietaryList.map((d) => {
              const selected = formData.dietaryNeeds.includes(d.slug);
              return (
                <TouchableOpacity
                  key={d._id}
                  style={[
                    styles.categoryButton,
                    selected && styles.categoryButtonActive,
                  ]}
                  onPress={() => {
                    const next = selected
                      ? formData.dietaryNeeds.filter((x) => x !== d.slug)
                      : [...formData.dietaryNeeds, d.slug];
                    setFormData({ ...formData, dietaryNeeds: next });
                  }}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      selected && styles.categoryButtonTextActive,
                    ]}
                  >
                    {d.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[styles.categoryButton, styles.addCategoryButton]}
              onPress={() => { setNewDietaryName(''); setAddDietaryVisible(true); }}
            >
              <Text style={styles.addCategoryButtonText}>+ Add dietary</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Price */}
        <View style={styles.section}>
          <Text style={styles.label}>Price (₹) *</Text>
          <AdminTextInput
            style={styles.input}
            value={formData.price}
            onChangeText={(text) => setFormData({ ...formData, price: text.replace(/[^0-9.]/g, '') })}
            placeholder="Enter price"
            keyboardType="numeric"
          />
        </View>

        {/* Discount amount (₹) – kitna kaatna hai; final price = price - discount amount */}
        <View style={styles.section}>
          <Text style={styles.label}>Discount amount (₹)</Text>
          <AdminTextInput
            style={styles.input}
            value={formData.discountAmount}
            onChangeText={(text) =>
              setFormData({ ...formData, discountAmount: text.replace(/[^0-9.]/g, '') })
            }
            placeholder="e.g. 10 (optional – final price = 100 - 10 = 90)"
            keyboardType="numeric"
          />
        </View>

        {/* Stock */}
        <View style={styles.section}>
          <Text style={styles.label}>Stock *</Text>
          <AdminTextInput
            style={styles.input}
            value={formData.stock}
            onChangeText={(text) => setFormData({ ...formData, stock: text.replace(/[^0-9]/g, '') })}
            placeholder="Enter stock quantity"
            keyboardType="numeric"
          />
        </View>

        {/* Brand */}
        <View style={styles.section}>
          <Text style={styles.label}>Brand</Text>
          <AdminTextInput
            style={styles.input}
            value={formData.brand}
            onChangeText={(text) => setFormData({ ...formData, brand: text })}
            placeholder="Enter brand name (optional)"
          />
        </View>

        {/* Images Upload */}
        <View style={styles.section}>
          <Text style={styles.label}>Product Images</Text>
          <View style={styles.imageUploadSection}>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={async () => {
                const result = await pickAndUploadImage('furmaa/products');
                if (result) {
                  setFormData({
                    ...formData,
                    images: [...formData.images, result.url],
                  });
                  Alert.alert('Success', 'Image uploaded successfully!');
                }
              }}
            >
              <Text style={styles.uploadButtonText}>📷 Upload Single Image</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.uploadButton, styles.uploadButtonSecondary]}
              onPress={async () => {
                const results = await pickMultipleImages('furmaa/products');
                if (results.length > 0) {
                  setFormData({
                    ...formData,
                    images: [...formData.images, ...results.map((r) => r.url)],
                  });
                  Alert.alert('Success', `${results.length} images uploaded successfully!`);
                }
              }}
            >
              <Text style={styles.uploadButtonText}>📸 Upload Multiple Images</Text>
            </TouchableOpacity>
          </View>
          {formData.images.length > 0 && (
            <View style={styles.imagesList}>
              <FlatList
                horizontal
                data={formData.images}
                keyExtractor={(item, index) => `${item}-${index}`}
                renderItem={({ item, index }) => (
                  <View style={styles.imageItem}>
                    <Image source={{ uri: item }} style={styles.uploadedImage} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => {
                        const newImages = formData.images.filter((_, i) => i !== index);
                        setFormData({ ...formData, images: newImages });
                      }}
                    >
                      <Text style={styles.removeImageText}>×</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          )}
        </View>

        {/* Active Status */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setFormData({ ...formData, isActive: !formData.isActive })}
          >
            <Text style={styles.label}>Active Product</Text>
            <View
              style={[
                styles.toggle,
                formData.isActive && styles.toggleActive,
              ]}
            >
              <View
                style={[
                  styles.toggleCircle,
                  formData.isActive && styles.toggleCircleActive,
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              {productId ? 'Update Product' : 'Create Product'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6B7280',
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
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryButtonActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addCategoryButton: {
    borderStyle: 'dashed',
    borderColor: '#1E3A8A',
  },
  addCategoryButtonText: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#E5E7EB',
  },
  modalButtonCancelText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  modalButtonAdd: {
    backgroundColor: '#1E3A8A',
  },
  modalButtonAddText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  petTypeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  petTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  petTypeButtonActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  petTypeButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  petTypeButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  hintText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#1E3A8A',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
  submitButton: {
    backgroundColor: '#1E3A8A',
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  imageUploadSection: {
    gap: 10,
    marginTop: 10,
  },
  uploadButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonSecondary: {
    backgroundColor: '#10B981',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  imagesList: {
    marginTop: 15,
  },
  imageItem: {
    marginRight: 10,
    position: 'relative',
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProductFormScreen;

