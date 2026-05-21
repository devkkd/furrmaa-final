import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  TextInput,
  StatusBar,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import { getProductImageUri } from '../../utils/productImage';

// @ts-ignore
import logoImage from '../../assets/images/Logo.png';
import dogFace from '../../assets/images/DogFace.png';
import catFace from '../../assets/images/CatFace.png';
import microphoneIcon from '../../assets/images/microphone-2.png';
import searchIcon from '../../assets/images/search-normal.png';
import filterIcon from '../../assets/images/setting-4.png';
import allForYouIcon from '../../assets/images/Group 27.png';
import medicineIcon from '../../assets/images/Group 29.png';
import accessoriesIcon from '../../assets/images/Group 30.png';
import foodIcon from '../../assets/images/Group 31.png';
import toysIcon from '../../assets/images/Group 32.png';
import supplememtIcon from '../../assets/images/Group 33.png';
import groomingIcon from '../../assets/images/Group 41.png';
import cartIcon from '../../assets/images/shopping-cart.png';
import dogFoodImage from '../../assets/images/dogFood.png';
import dogDietImage from '../../assets/images/dogDiet.png';
import dogSupplementImage from '../../assets/images/dogSupplements.png';
import dogTreatsImage from '../../assets/images/dogTreats.png';
import catFoodImage from '../../assets/images/cat food.png';
import catLitterImage from '../../assets/images/cat litter 1.png';
import catSupplementImage from '../../assets/images/cat Supplements.png';
import catTreatsImage from '../../assets/images/cat Treats.png';
import catToysIcon from '../../assets/images/cat Toys.png';
import catGroomingIcon from '../../assets/images/cat Grooming.png';
import catWalkIcon from '../../assets/images/cat Walk.png';
import catFeedersIcon from '../../assets/images/cat Feeders.png';
import dogBedIcon from '../../assets/images/dogBed.png';
import dogCardCareIcon from '../../assets/images/dogCardiacCare.png';
import dogDewormerIcon from '../../assets/images/dogDewormer.png';
import dogFleaTickIcon from '../../assets/images/dogTick & Fleas.png';
import dogTravelIcon from '../../assets/images/dogTravel.png';
import dogJointCareIcon from '../../assets/images/dogJoint Care.png';
import dogLiverCareIcon from '../../assets/images/dogLiver Care.png';
import dogKidneyCareIcon from '../../assets/images/dogKidney Care.png';
import dogTrainingImage from '../../assets/images/image 8.png';
import catTrainingImage from '../../assets/images/image 17.png';
import dogCareBanner from '../../assets/images/image 9.png';
import catCareBanner from '../../assets/images/image 18.png';
import adoptionBanner from '../../assets/images/image 10.png';
import dogToysIcon from '../../assets/images/dogToys.png';
import dogGroomingIcon from '../../assets/images/dogGrooming.png';
import dogWalkIcon from '../../assets/images/dogWalk.png';
import dogFeedersIcon from '../../assets/images/dogFeeders.png';
import dogBanner1 from '../../assets/images/dogBanner.png';
import catBanner1 from '../../assets/images/catBanner.png';
import dogBanner2 from '../../assets/images/image 2.png';
import catBanner2 from '../../assets/images/image 16.png';
import dogProduct1Image from '../../assets/images/dogProduct1.png';
import catProduct1Image from '../../assets/images/catProduct1.png';
import helpBanner from '../../assets/images/image 11.png';
import heartIcon from '../../assets/images/heart.png';
import { getBackendCategory } from '../../utils/productCategories';

const { width } = Dimensions.get('window');

interface Product {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images?: string[];
  rating?: number;
  reviews?: number;
  category?: string;
}

const HomeScreen = () => {
  const navigation = useNavigation();
  
  // Helper function for navigation from Tab Navigator to Stack Navigator
  const navigateTo = (screenName: string, params: any = {}) => {
    try {
      const parentNav = navigation.getParent();
      if (parentNav) {
        (parentNav as any).navigate(screenName, params);
      } else {
        (navigation as any).navigate(screenName, params);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      (navigation as any).navigate(screenName, params);
    }
  };
  const { user } = useAuth();
  const [selectedPet, setSelectedPet] = useState<'dog' | 'cat'>('dog');
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [currentSideBannerIndex, setCurrentSideBannerIndex] = useState(0);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestDeals, setBestDeals] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingNewArrivals, setLoadingNewArrivals] = useState(false);
  const [loadingBestDeals, setLoadingBestDeals] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  // Static category list (pehle jaisa – dynamic API fetch nahi)
  const STATIC_HOME_CATEGORIES: { id: string; name: string; slug: string; icon: any }[] = [
    { id: 'all', name: 'All For You', slug: '', icon: allForYouIcon },
    { id: 'food', name: 'Food', slug: 'food', icon: foodIcon },
    { id: 'toys', name: 'Toys', slug: 'toys', icon: toysIcon },
    { id: 'accessories', name: 'Accessories', slug: 'accessories', icon: accessoriesIcon },
    { id: 'grooming', name: 'Grooming', slug: 'grooming', icon: groomingIcon },
    { id: 'health', name: 'Health', slug: 'health', icon: medicineIcon },
    { id: 'bedding', name: 'Bedding', slug: 'bedding', icon: dogBedIcon },
    { id: 'other', name: 'Other', slug: 'other', icon: supplememtIcon },
  ];

  const scrollViewRef = useRef<ScrollView>(null);
  const bannerTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sideBannerTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchWishlistIds = async () => {
    try {
      const res = await api.CLIENT.get(api.ENDPOINTS.WISHLIST);
      if (res.data?.wishlist) {
        const ids = new Set<string>();
        res.data.wishlist.forEach((w: any) => {
          if (w.product?._id) ids.add(w.product._id);
        });
        setWishlistIds(ids);
      }
    } catch {
      setWishlistIds(new Set());
    }
  };

  useEffect(() => {
    if (user) fetchWishlistIds();
  }, [user]);

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      navigateTo('Login', {});
      return;
    }
    try {
      const inList = wishlistIds.has(productId);
      if (inList) {
        await api.CLIENT.delete(`${api.ENDPOINTS.WISHLIST}/${productId}`);
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      } else {
        await api.CLIENT.post(`${api.ENDPOINTS.WISHLIST}/${productId}`);
        setWishlistIds((prev) => new Set(prev).add(productId));
      }
    } catch (e) {
      console.warn('Wishlist toggle failed', e);
    }
  };

  // Banner data for carousel
  const mainBanners = [
    {
      id: 1,
      image: selectedPet === 'dog' ? dogBanner1 : catBanner1,
    },
    {
      id: 2,
      image: selectedPet === 'dog' ? dogBanner2 : catBanner2,
    },
    {
      id: 3,
      image: selectedPet === 'dog' ? dogBanner1 : catBanner1,
    },
  ];

  // Calculate banner width
  const bannerWidth = (width - 40) * (2 / 3) - 10; // 2/3 of available width minus gap

  // Auto-slide banner effect
  useEffect(() => {
    // Reset timer when pet type changes
    setCurrentBannerIndex(0);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: 0, animated: false });
    }

    // Clear existing timer
    if (bannerTimerRef.current) {
      clearInterval(bannerTimerRef.current);
    }

    // Set up auto-slide
    bannerTimerRef.current = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % mainBanners.length;
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            x: nextIndex * bannerWidth,
            animated: true,
          });
        }
        return nextIndex;
      });
    }, 3000); // Change banner every 3 seconds

    return () => {
      if (bannerTimerRef.current) {
        clearInterval(bannerTimerRef.current);
      }
    };
  }, [selectedPet, bannerWidth]);

  // Category icons – static list (pehle jaisa)
  const categories = STATIC_HOME_CATEGORIES;
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || 'all');

  // Everyday Essentials
  const everydayEssentials = selectedPet === 'dog' 
    ? [
        { id: 1, name: 'Food', icon: dogFoodImage },
        { id: 2, name: 'Treats', icon: dogTreatsImage },
        { id: 3, name: 'Diet', icon: dogDietImage },
        { id: 4, name: 'Supplements', icon: dogSupplementImage },
        {id: 5, name: 'Toys', icon: dogToysIcon },
        {id: 6, name: 'Grooming', icon: dogGroomingIcon },
        {id: 7, name: 'Walk', icon: dogWalkIcon },
        {id: 8, name: 'Feeders', icon: dogFeedersIcon },
        
      ]
    : [
        { id: 1, name: 'Food', icon: catFoodImage },
        { id: 2, name: 'Treats', icon: catTreatsImage },
        { id: 3, name: 'Litter', icon: catLitterImage },
        { id: 4, name: 'Supplements', icon: catSupplementImage },
        {id: 5, name: 'Toys', icon: catToysIcon },
        {id: 6, name: 'Grooming', icon: catGroomingIcon },
        {id: 7, name: 'Walk', icon: catWalkIcon },
        {id: 8, name: 'Feeders', icon: catFeedersIcon },
      ];

  // All Round Wellness
  const wellnessCategories = [
    { id: 1, name: 'Kidney Care', icon: dogKidneyCareIcon },
    { id: 2, name: 'De-wormer', icon: dogDewormerIcon },
    { id: 3, name: 'Tick & Flea', icon: dogFleaTickIcon },
    { id: 4, name: 'Joint Care', icon: dogJointCareIcon },
    { id: 5, name: 'Immune Care', icon: dogCardCareIcon },
    { id: 6, name: 'Liver Care', icon: dogLiverCareIcon },
    { id: 7, name: 'Beds & Mats', icon: dogBedIcon },  
    { id: 8, name: 'Travel', icon: dogTravelIcon },
  ];

  // Fetch all products based on pet type
  useEffect(() => {
    fetchTopProducts();
    fetchNewArrivals();
    fetchBestDeals();
  }, [selectedPet]);

  const fetchTopProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await api.CLIENT.get(api.ENDPOINTS.PRODUCTS, {
        params: {
          petType: selectedPet,
        },
      });
      if (response.data?.products) {
        // Get top 6 products (sorted by rating or popularity)
        const sorted = response.data.products
          .sort((a: Product, b: Product) => {
            const ratingA = a.rating || 0;
            const ratingB = b.rating || 0;
            return ratingB - ratingA;
          })
          .slice(0, 6);
        setTopProducts(sorted);
      }
    } catch (error: any) {
      console.error('Failed to fetch top products:', error);
      setTopProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchNewArrivals = async () => {
    try {
      setLoadingNewArrivals(true);
      const response = await api.CLIENT.get(api.ENDPOINTS.PRODUCTS, {
        params: {
          petType: selectedPet,
        },
      });
      if (response.data?.products) {
        // Backend already sorts by createdAt: -1 (newest first)
        // Get first 6 products
        const newProducts = response.data.products.slice(0, 6);
        setNewArrivals(newProducts);
      }
    } catch (error: any) {
      console.error('Failed to fetch new arrivals:', error);
      setNewArrivals([]);
    } finally {
      setLoadingNewArrivals(false);
    }
  };

  const fetchBestDeals = async () => {
    try {
      setLoadingBestDeals(true);
      const response = await api.CLIENT.get(api.ENDPOINTS.PRODUCTS, {
        params: {
          petType: selectedPet,
        },
      });
      if (response.data?.products) {
        // Filter products with discountPrice (on sale)
        const deals = response.data.products
          .filter((product: Product) => product.discountPrice && product.discountPrice < product.price)
          .sort((a: Product, b: Product) => {
            // Sort by discount percentage (highest discount first)
            const discountA = ((a.price - (a.discountPrice || a.price)) / a.price) * 100;
            const discountB = ((b.price - (b.discountPrice || b.price)) / b.price) * 100;
            return discountB - discountA;
          })
          .slice(0, 6);
        setBestDeals(deals);
      }
    } catch (error: any) {
      console.error('Failed to fetch best deals:', error);
      setBestDeals([]);
    } finally {
      setLoadingBestDeals(false);
    }
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const getProductImage = (product: Product) => {
    if (getProductImageUri(product)) return null;
    return selectedPet === 'dog' ? '🦴' : '🐟';
  };

  const handleVoiceSearch = () => {
    // Navigate to ProductsScreen with voice search indicator
    // In production, integrate with @react-native-voice/voice for actual voice recognition
    navigateTo('Products', { 
      petType: selectedPet,
      voiceSearch: true 
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Image source={logoImage} style={styles.logo} resizeMode="contain" />
            <View style={styles.headerTextContainer}>
              <Text style={styles.logoText}>FURRMAA</Text>
              <Text style={styles.tagline}>WHERE EVERY TAIL FEELS AT HOME</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigateTo('Cart', {})}>
            <View style={styles.cartIconContainer}>
              <Image source={cartIcon} style={styles.cartIcon} resizeMode="contain"/>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Pet Type Tabs */}
        <View style={styles.tabsBackground}>
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                selectedPet === 'dog' && [styles.tabButtonActive, { backgroundColor: '#1F2E46' }],
              ]}
              onPress={() => setSelectedPet('dog')}
            >
              <Image source={dogFace} style={{width: 26, height: 26}} resizeMode="contain"/>
              <Text
                style={[
                  styles.tabText,
                  selectedPet === 'dog' && styles.tabTextActiveDog,
                ]}
              >
                Dog Essentials
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                selectedPet === 'cat' && [styles.tabButtonActive, { backgroundColor: '#95E562' }],
              ]}
              onPress={() => setSelectedPet('cat')}
            >
              <Image source={catFace} style={{width: 26, height: 26}} resizeMode="contain"/>
              <Text
                style={[
                  styles.tabText,
                  selectedPet === 'cat' && styles.tabTextActiveCat,
                ]}
              >
                Cat Essentials
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <TouchableOpacity
              style={styles.searchInputContainer}
              onPress={() => navigateTo('Search', {})}
            >
              <Image source={searchIcon} style={{width: 24, height: 24, marginRight: 10}} resizeMode="contain"/>
              <Text style={styles.searchPlaceholder}>
                Search food, toys, meds & more...
              </Text>
            </TouchableOpacity>
             <View style={styles.verticalDivider} />
            <TouchableOpacity style={styles.micButton}>
              <Image source={microphoneIcon} style={{width: 26, height: 26}} resizeMode="contain"/>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => navigateTo('Filter', { petType: selectedPet })}
          >
            <Image source={filterIcon} style={{width: 20, height: 20}} resizeMode="contain"/>
          </TouchableOpacity>
        </View>

        {/* Category Icons - Horizontal Scroll */}
        <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryItem}
              onPress={() => {
                setSelectedCategoryId(category.id);
                const slug = (category as any).slug ?? getBackendCategory(category.name);
                navigateTo('Products', {
                  petType: selectedPet,
                  ...(slug ? { filters: { category: [slug] } } : {}),
                });
              }}
            >
              <View style={styles.categoryIcon}>
                  <Image
                    source={category.icon}
                    style={styles.categoryIconText}
                    resizeMode="contain"
                  />
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
              <View
                style={[
                  styles.activeBar,
                  selectedCategoryId === category.id && styles.activeBarActive,
                ]}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.horizontalDivider} />
        </View>

        {/* Promotional Banners */}
        <View style={styles.bannersContainer}>
          <View style={styles.mainBannerWrapper}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEnabled={false}
              style={styles.bannerScrollView}
              contentContainerStyle={{ width: bannerWidth * mainBanners.length }}
            >
              {mainBanners.map((banner, index) => (
                <View
                  key={banner.id}
                  style={[
                    styles.mainBanner,
                    selectedPet === 'cat' && styles.mainBannerCat,
                    { width: bannerWidth },
                  ]}
                >
                  {/* Banner background image */}
                  <Image
                    source={banner.image}
                    style={styles.mainBannerImage}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </ScrollView>
            {/* Banner Indicators */}
            <View style={styles.bannerIndicators}>
              {mainBanners.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicatorDot,
                    currentBannerIndex === index && styles.indicatorDotActive,
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Everyday Essentials */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Everyday Essentials</Text>
          <View style={styles.essentialsGrid}>
            {everydayEssentials.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.essentialCard}
                onPress={() => {
                  const backendCat = getBackendCategory(item.name);
                  navigateTo('Products', {
                    petType: selectedPet,
                    filters: { category: [backendCat] },
                  });
                }}
              >
                <View style={styles.essentialIcon}>
                  <Image source={item.icon} style={styles.essentialIconImage} resizeMode='contain'/>
                </View>
                <Text style={styles.essentialName}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Training Banner */}
        <TouchableOpacity 
          style={styles.trainingBanner}
          onPress={() => navigateTo('Training', {})}
        >
          <Text style={styles.trainingBannerText}>
            {selectedPet === 'dog' ? '' : 'Cat Training'} 
          </Text>
          <Image
            style={styles.trainingBannerImage}
            source={selectedPet === 'dog' ? dogTrainingImage : catTrainingImage}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* All Round Wellness */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Round Wellness</Text>
          <View style={styles.wellnessGrid}>
            {wellnessCategories.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.wellnessCard}
                onPress={() => {
                  const backendCat = getBackendCategory(item.name);
                  navigateTo('Products', {
                    petType: selectedPet,
                    filters: { category: [backendCat] },
                  });
                }}
              >
                <View style={styles.wellnessIcon}>
                  <Image source={item.icon} style={styles.wellnessIconImage} resizeMode='contain'/>
                </View>
                <Text style={styles.wellnessName}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Find a New Friend Banner / We Care Banner */}
        {selectedPet === 'cat' ? (
          <View style={styles.findFriendBanner}>
            <Image source={catCareBanner} style={styles.careBannerImage}  resizeMode="cover"/>
          </View>
        ) : (
          <View style={styles.careBanner}>
            <Image source={dogCareBanner} style={styles.careBannerImage} resizeMode="cover"/>
          </View>
        )}

        {/* Top Selling Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top-Selling Products</Text>
            <TouchableOpacity onPress={() => navigateTo('Products', { petType: selectedPet })}>
              <Text style={styles.seeAllText}>See All &gt;</Text>
            </TouchableOpacity>
          </View>
          {loadingProducts ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#1E3A8A" />
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsScrollContent}
            >
              {topProducts.length > 0 ? (
                topProducts.map((product) => {
                  const displayPrice = product.discountPrice || product.price;
                  const originalPrice = product.discountPrice ? product.price : null;
                  
                  return (
                    <TouchableOpacity
                      key={product._id}
                      style={styles.productCardHorizontal}
                      onPress={() => navigateTo('ProductDetail', { productId: product._id, product: null })}
                    >
                      <View style={styles.productImageContainerHorizontal}>
                        {getProductImageUri(product) ? (
                          <Image 
                            source={{ uri: getProductImageUri(product)! }} 
                            style={styles.productImageHorizontal} 
                            resizeMode="cover" 
                          />
                        ) : (
                          <View style={styles.productImageHorizontal}>
                            <Text style={styles.productEmoji}>{getProductImage(product)}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.productName} numberOfLines={2}>
                        {product.name}
                      </Text>
                      {(product.rating ?? 0) > 0 && (
                        <View style={styles.productRating}>
                          <Text style={styles.ratingStars}>
                            {'⭐'.repeat(Math.floor(product.rating!))}
                          </Text>
                          {(product.reviews ?? 0) > 0 && (
                            <Text style={styles.reviewsText}>({product.reviews})</Text>
                          )}
                        </View>
                      )}
                      <View style={styles.productFooter}>
                        <View>
                          <Text style={styles.productPrice}>{formatPrice(displayPrice)}</Text>
                          {originalPrice && (
                            <Text style={styles.originalPrice}>{formatPrice(originalPrice)}</Text>
                          )}
                        </View>
                        <TouchableOpacity
                          style={styles.addButton}
                          onPress={() => navigateTo('Cart', { product: { _id: product._id, name: product.name, price: product.price, discountPrice: displayPrice, image: product.images?.[0], images: product.images }, quantity: 1 })}
                        >
                          <Text style={styles.addButtonText}>ADD</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyProducts}>
                  <Text style={styles.emptyProductsText}>No products available</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>


        {/* Find Pets for Adoption Banner */}
        <TouchableOpacity
          style={styles.adoptionBanner}
          onPress={() => navigateTo('Adoption', {})}
        >
          <Image source={adoptionBanner} style={styles.trainingBannerImage} resizeMode="cover"/>
        </TouchableOpacity>

        {/* New Arrivals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>New Arrivals</Text>
            <TouchableOpacity onPress={() => navigateTo('Products', { petType: selectedPet })}>
              <Text style={styles.seeAllText}>See All &gt;</Text>
            </TouchableOpacity>
          </View>

          {loadingNewArrivals ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#1E3A8A" />
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {newArrivals.length > 0 ? (
                newArrivals.map((product) => {
                  const displayPrice = product.discountPrice || product.price;
                  const originalPrice = product.discountPrice ? product.price : null;
                  
                  return (
                    <TouchableOpacity
                      key={product._id}
                      style={styles.productCard}
                      onPress={() => navigateTo('ProductDetail', { productId: product._id, product: null })}
                    >
                      <TouchableOpacity
                        style={styles.wishlistIcon}
                        onPress={() => product._id && toggleWishlist(product._id)}
                      >
                        <Image
                          source={heartIcon}
                          style={{ width: 20, height: 20, tintColor: wishlistIds.has(product._id) ? 'red' : '#1F2937' }}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>

                      <View style={styles.productImageContainer}>
                        {getProductImageUri(product) ? (
                          <Image 
                            source={{ uri: getProductImageUri(product)! }} 
                            style={styles.productImage} 
                            resizeMode="cover" 
                          />
                        ) : (
                          <View style={styles.productImage}>
                            <Text style={styles.productEmoji}>{getProductImage(product)}</Text>
                          </View>
                        )}
                      </View>

                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigateTo('Cart', { product: { _id: product._id, name: product.name, price: product.price, discountPrice: displayPrice, image: product.images?.[0], images: product.images }, quantity: 1 })}
                      >
                        <Text style={styles.addButtonText}>ADD</Text>
                      </TouchableOpacity>

                      <Text style={styles.productName} numberOfLines={2}>
                        {product.name}
                      </Text>

                      {(product.rating ?? 0) > 0 && (
                        <View style={styles.productRating}>
                          <Text style={styles.ratingStars}>
                            {'⭐'.repeat(Math.floor(product.rating!))}
                          </Text>
                          {(product.reviews ?? 0) > 0 && (
                            <Text style={styles.reviewsText}>({product.reviews})</Text>
                          )}
                        </View>
                      )}

                      <View style={styles.priceRow}>
                        <Text style={styles.productPrice}>{formatPrice(displayPrice)}</Text>
                        {originalPrice && (
                          <Text style={styles.oldPrice}>{formatPrice(originalPrice)}</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyProducts}>
                  <Text style={styles.emptyProductsText}>No new products available</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Help Banner */}
        <TouchableOpacity
          style={styles.adoptionBanner}
          // onPress={() => navigation.navigate('Help' as never)}
        >
          <Image source={helpBanner} style={styles.trainingBannerImage} resizeMode="cover"/>
        </TouchableOpacity>

        {/* Best Deals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Best Deals</Text>
            <TouchableOpacity onPress={() => navigateTo('Products', { petType: selectedPet })}>
              <Text style={styles.seeAllText}>See All &gt;</Text>
            </TouchableOpacity>
          </View>

          {loadingBestDeals ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#1E3A8A" />
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {bestDeals.length > 0 ? (
                bestDeals.map((product) => {
                  const displayPrice = product.discountPrice || product.price;
                  const originalPrice = product.discountPrice ? product.price : null;
                  
                  return (
                    <TouchableOpacity
                      key={product._id}
                      style={styles.productCard}
                      onPress={() => navigateTo('ProductDetail', { productId: product._id, product: null })}
                    >
                      <TouchableOpacity
                        style={styles.wishlistIcon}
                        onPress={() => product._id && toggleWishlist(product._id)}
                      >
                        <Image
                          source={heartIcon}
                          style={{ width: 20, height: 20, tintColor: wishlistIds.has(product._id) ? 'red' : '#1F2937' }}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>

                      <View style={styles.productImageContainer}>
                        {getProductImageUri(product) ? (
                          <Image 
                            source={{ uri: getProductImageUri(product)! }} 
                            style={styles.productImage} 
                            resizeMode="cover" 
                          />
                        ) : (
                          <View style={styles.productImage}>
                            <Text style={styles.productEmoji}>{getProductImage(product)}</Text>
                          </View>
                        )}
                      </View>

                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigateTo('Cart', { product: { _id: product._id, name: product.name, price: product.price, discountPrice: displayPrice, image: product.images?.[0], images: product.images }, quantity: 1 })}
                      >
                        <Text style={styles.addButtonText}>ADD</Text>
                      </TouchableOpacity>

                      <Text style={styles.productName} numberOfLines={2}>
                        {product.name}
                      </Text>

                      {(product.rating ?? 0) > 0 && (
                        <View style={styles.productRating}>
                          <Text style={styles.ratingStars}>
                            {'⭐'.repeat(Math.floor(product.rating!))}
                          </Text>
                          {(product.reviews ?? 0) > 0 && (
                            <Text style={styles.reviewsText}>({product.reviews})</Text>
                          )}
                        </View>
                      )}

                      <View style={styles.priceRow}>
                        <Text style={styles.productPrice}>{formatPrice(displayPrice)}</Text>
                        {originalPrice && (
                          <Text style={styles.oldPrice}>{formatPrice(originalPrice)}</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyProducts}>
                  <Text style={styles.emptyProductsText}>No deals available</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Footer Text */}
        <View style={styles.footerTextContainer}>
          <Text style={styles.footerSmallText}>
            Made With Gentle Care in Jaipur, India
          </Text>

          <Text style={styles.footerMainText}>
            Because Your Pet{'\n'}Deserves the Very Best 🐾
          </Text>
        </View>


        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  tagline: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '400',
  },
  cartIcon: {
    width: 24,
    height: 24,
  },
  cartIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D9DCE2',
    backgroundColor: '#F9FBFF',
    alignItems: 'center',     
    justifyContent: 'center', 
  },
    tabsBackground: {
    backgroundColor: '#F9FBFF', 
    borderWidth: 1,
    borderColor: '#D9DCE2',
    borderRadius: 27,
    marginHorizontal: 10,
    marginVertical: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 5,
    paddingVertical: 5,
    gap: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  tabIcon: {
    fontSize: 16,
  },
  tabButtonActive: {
    backgroundColor: '#1F2E46', // Navy blue for dog, will be overridden for cat
    borderColor: '#1E3A8A',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActiveCat: {
    color: '#000000',
  },
  tabTextActiveDog: {
    color: '#ffffff',
  },
  verticalDivider: {
  width: 2,
  backgroundColor: '#D9DCE2',
  alignSelf: 'stretch',
  marginLeft: 4,
  marginRight: -10,
},
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 15,
    gap: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButton: {
    padding: 12,
    backgroundColor: '#1F2E46',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: '#9CA3AF',
  },
  micButton: {
    marginLeft: 10,
    padding: 5,
    marginRight: -10,
  },

  categoriesScroll: {
    marginBottom: 20,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 15,
  },
  categoryItem: {
    alignItems: 'center',
    width: 70,
  },
  categoryIcon: {
    width: 45,
    height: 45,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIconText: {
    height: 26,
    width: 26,
  },
  categoryName: {
    fontSize: 12,
    color: '#1F2937',
    textAlign: 'center',
  },
    horizontalDivider: {
    height: 1,
    backgroundColor: '#D9DCE2',
    marginBottom: 12,
    marginTop: -20,
  },
    activeBar: {
    height: 4,
    width: '100%',
    backgroundColor: 'transparent',
    marginTop: 10,
    borderRadius: 10,
  },

  activeBarActive: {
    backgroundColor: '#1E3A8A',
  },

  bannersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  mainBannerWrapper: {
    flex: 2,
    height: 160,
    position: 'relative',
  },
  bannerScrollView: {
    flex: 1,
  },
  mainBanner: {
    height: 160,
    borderRadius: 12,
    padding: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
    
  },
    mainBannerImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 12,
  },
  mainBannerCat: {
    backgroundColor: '#FFFFFF', // Lighter blue for cat
  },
  bannerIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    gap: 6,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  indicatorDotActive: {
    backgroundColor: '#FFFFFF',
    width: 20,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  bannerButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  bannerImage: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerEmoji: {
    fontSize: 60,
  },
  sideBanner: {
    flex: 1,
    height: 160,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  sideBannerIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  indicatorText: {
    fontSize: 10,
    color: '#1F2937',
    fontWeight: '600',
  },
  sideBannerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 10,
  },
  sideBannerEmoji: {
    fontSize: 50,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  essentialsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
  },
  essentialCard: {
    width: (width - 70) / 4,
    alignItems: 'center',
    marginBottom: 15,
  },
  essentialIcon: {
    width: 85,
    height: 130,
    borderRadius: 15,
    backgroundColor: '#EBF3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 14,
  },
  essentialIconImage: {
    width: 80,
    height: 100,

  },
  essentialIconText: {
    fontSize: 24,
  },
  essentialName: {
    fontSize: 12,
    color: '#1F2937',
    textAlign: 'center',
  },
  trainingBanner: {
    marginBottom: 50,
    marginTop: 30,
    height: 100,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  trainingBannerImage: {
    width: '100%',
    height: '250%',
    objectFit: 'cover',
    borderRadius: 12,
  },
  trainingBannerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    position: 'absolute',
    zIndex: 1,
    top: 5,
    left: 40,
  },
  wellnessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  wellnessCard: {
    width: (width - 60) / 4,
    alignItems: 'center',
    marginBottom: 15,
  },
  wellnessIcon: {
    width: 70,
    height: 100,
    borderRadius: 20,
    backgroundColor: '#FCEBFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 10,
  },
  wellnessIconImage: {
    width: 60,
    height: 60,
  },
  wellnessName: {
    fontSize: 11,
    color: '#1F2937',
    textAlign: 'center',
  },
  careBanner: {
    marginBottom: 50,
    marginTop: 20,
    height: 120,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  careBannerImage: {
    width: '100%',
    height: '200%',
    objectFit: 'cover',
    borderRadius: 12,
  },
  findFriendBanner: {
    marginBottom: 50,
    height: 120,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  productCard: {
    width: '31%',  
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 5,
    marginBottom: 15,
    position: 'relative',
    elevation: 0,
    shadowColor: 'transparent',
  },
  productCardHorizontal: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 5,
    marginRight: 10,
    position: 'relative',
    elevation: 0,
    shadowColor: 'transparent',
  },


  wishlistIcon: {
    width: 24,
    height: 24,
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },

  productImageContainer: {
    width: '100%',
    height: 120,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  productImageContainerHorizontal: {
    width: '100%',
    height: 140,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  productImageHorizontal: {
    width: '100%',
    height: 140,
    borderRadius: 8,
  },
  productEmoji: {
    fontSize: 40,
  },

  addButton: {
    position: 'absolute',
    right: 10,
    top: 95,
    borderWidth: 1,
    borderColor: '#6D28D9',
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },

  addButtonText: {
    color: '#6D28D9',
    fontWeight: '600',
    fontSize: 12,
  },

  productName: {
    fontSize: 13,
    color: '#111827',
    marginTop: 10,
  },

  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },

  ratingStars: {
    color: '#F59E0B',
    fontSize: 12,
  },

  reviewsText: {
    fontSize: 11,
    color: '#6B7280',
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  oldPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyProducts: {
    padding: 40,
    alignItems: 'center',
  },
  emptyProductsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  productsScrollContent: {
    paddingHorizontal: 10,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  adoptionBanner: {
    marginTop: 30,
    marginBottom: 60,
    height: 100, 
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  adoptionBannerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 10,
  },
  adoptionBannerIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  adoptionBannerEmoji: {
    fontSize: 40,
  },
  bottomPadding: {
    height: 40,
  },
  footerTextContainer: {
    marginTop: 30,
    marginBottom: 40,
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },

  footerSmallText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },

  footerMainText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6B7280',
    textAlign: 'left',
    lineHeight: 34,
  },
});

export default HomeScreen;
