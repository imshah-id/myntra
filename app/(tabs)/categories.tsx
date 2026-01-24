import {
  StyleSheet,
  Image,
  Platform,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Collapsible } from "@/components/Collapsible";
import { ExternalLink } from "@/components/ExternalLink";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Search, X } from "lucide-react-native";
import axios from "axios";
import { useTheme } from "@/hooks/useTheme";

export default function TabTwoScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setcategories] = useState<any>(null);
  useEffect(() => {
    const fetchproduct = async () => {
      try {
        setIsLoading(true);
        const cat = await axios.get(
          "https://myntrabackend-eal6.onrender.com/category",
        );
        setcategories(cat.data);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchproduct();
  }, []);
  if (isLoading) {
    return (
      <View
        style={[styles.loaderContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }
  if (!categories) {
    return (
      <View style={styles.container}>
        <Text>Categories not found</Text>
      </View>
    );
  }
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };
  const clearSearch = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
    setSearchQuery("");
  };
  const handleSubcategorySelect = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
    setSearchQuery("");
  };

  const filtercategories = categories?.filter(
    (category: any) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.subcategory.some((subcategory: any) =>
        subcategory.toLowerCase().includes(searchQuery.toLowerCase()),
      ) ||
      category.productId.some(
        (product: any) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );
  const selectedcategorydata = selectedCategory
    ? categories?.find((cat: any) => cat._id === selectedCategory)
    : null;
  const renderProducts = (products: any) => {
    return products?.map((product: any) => (
      <TouchableOpacity
        key={product._id}
        style={[
          styles.productCard,
          { backgroundColor: theme.surface, shadowColor: theme.icon },
        ]}
        onPress={() => router.push(`/product/${product._id}`)}
      >
        <Image
          source={{ uri: product.images[0] }}
          style={styles.productImage}
        />
        <View style={styles.productInfo}>
          <Text style={[styles.brandName, { color: theme.icon }]}>
            {product.brand}
          </Text>
          <Text style={[styles.productName, { color: theme.text }]}>
            {product.name}
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: theme.text }]}>
              ₹{product.price}
            </Text>
            <Text style={[styles.discount, { color: theme.tint }]}>
              {product.discount}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    ));
  };
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.background,
            borderBottomColor: theme.border,
            paddingTop: insets.top + 10,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Categories
        </Text>
      </View>

      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: theme.background,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <View
          style={[
            styles.searchInputContainer,
            { backgroundColor: theme.surface },
          ]}
        >
          <Search size={20} color={theme.icon} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search for products, brands and more"
            placeholderTextColor={theme.icon}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={20} color={theme.icon} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <ScrollView style={styles.content}>
        {!selectedCategory && (
          <View style={styles.categoriesGrid}>
            {filtercategories?.map((category: any) => (
              <TouchableOpacity
                key={category._id}
                style={[
                  styles.categoryCard,
                  { backgroundColor: theme.surface, shadowColor: theme.icon },
                ]}
                onPress={() => handleCategorySelect(category._id)}
              >
                <Image
                  source={{ uri: category.image }}
                  style={styles.categoryImage}
                />
                <View style={styles.categoryInfo}>
                  <Text style={[styles.categoryName, { color: theme.text }]}>
                    {category.name}
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.subcategories}>
                      {category?.subcategory?.map((sub: any, index: any) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.subcategoryTag,
                            { backgroundColor: theme.background },
                          ]}
                          onPress={() => handleSubcategorySelect(sub)}
                        >
                          <Text
                            style={[
                              styles.subcategoryText,
                              { color: theme.icon },
                            ]}
                          >
                            {sub}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedcategorydata && (
          <View style={styles.categoryDetail}>
            <View style={styles.categoryHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={[styles.backButtonText, { color: theme.tint }]}>
                  ← Back to Categories
                </Text>
              </TouchableOpacity>
              <Text style={[styles.categoryTitle, { color: theme.text }]}>
                {selectedcategorydata.name}
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.subcategoriesScroll}
            >
              {selectedcategorydata.subcategory.map((sub: any, index: any) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.subcategoryButton,
                    { backgroundColor: theme.surface },
                    selectedSubcategory === sub && {
                      backgroundColor: theme.tint,
                    },
                  ]}
                  onPress={() => handleSubcategorySelect(sub)}
                >
                  <Text
                    style={[
                      styles.subcategoryButtonText,
                      { color: theme.text },
                      selectedSubcategory === sub && {
                        color: theme.background,
                      },
                    ]}
                  >
                    {sub}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.productsGrid}>
              {renderProducts(selectedcategorydata?.productId)}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 15,
    // paddingTop: 50, // Handled dynamically
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3e3e3e",
  },
  searchContainer: {
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#3e3e3e",
  },
  content: {
    flex: 1,
  },
  categoriesGrid: {
    padding: 15,
  },
  categoryCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: "hidden",
  },
  categoryImage: {
    width: "100%",
    height: 150,
  },
  categoryInfo: {
    padding: 15,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3e3e3e",
    marginBottom: 10,
  },
  subcategories: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  subcategoryTag: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  subcategoryText: {
    fontSize: 14,
    color: "#666",
  },
  categoryDetail: {
    flex: 1,
    padding: 15,
  },
  categoryHeader: {
    marginBottom: 15,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: "#ff3f6c",
    fontSize: 16,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3e3e3e",
  },
  subcategoriesScroll: {
    marginBottom: 15,
  },
  subcategoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    marginRight: 10,
  },
  selectedSubcategory: {
    backgroundColor: "#ff3f6c",
  },
  subcategoryButtonText: {
    fontSize: 14,
    color: "#3e3e3e",
  },
  selectedSubcategoryText: {
    color: "#fff",
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  productInfo: {
    padding: 10,
  },
  brandName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    color: "#3e3e3e",
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3e3e3e",
    marginRight: 8,
  },
  discount: {
    fontSize: 14,
    color: "#ff3f6c",
  },
});
