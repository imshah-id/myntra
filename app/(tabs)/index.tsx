import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Search, ChevronRight, Sun, Moon } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useFocusEffect } from "@react-navigation/native";

const deals = [
  {
    id: 1,
    title: "Under ₹599",
    image:
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "40-70% Off",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop",
  },
];

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [product, setproduct] = useState<any>(null);
  const [categories, setcategories] = useState<any>(null);
  const { user } = useAuth();
  const { theme, colorScheme, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { recentlyViewed, refresh: refreshRecentlyViewed } =
    useRecentlyViewed();

  useFocusEffect(
    React.useCallback(() => {
      refreshRecentlyViewed();
    }, [refreshRecentlyViewed]),
  );

  const handleProductPress = (productId: number) => {
    if (!user) {
      router.push("/login");
    } else {
      router.push(`/product/${productId}`);
    }
  };
  useEffect(() => {
    const fetchproduct = async () => {
      try {
        setIsLoading(true);
        const cat = await axios.get(
          "https://myntrabackend-eal6.onrender.com/category",
        );
        const product = await axios.get(
          "https://myntrabackend-eal6.onrender.com/product",
        );
        setcategories(cat.data);
        setproduct(product.data);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchproduct();
  }, []);
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      {/* HEADER */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.background,
            borderBottomColor: theme.icon,
            paddingTop: insets.top + 10,
          },
        ]}
      >
        <Text style={[styles.logo, { color: theme.text }]}>MYNTRA</Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconButton}>
            <Search size={22} color={theme.icon} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            {colorScheme === "dark" ? (
              <Sun size={22} color={theme.tint} />
            ) : (
              <Moon size={22} color={theme.tint} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* BANNER */}
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop",
        }}
        style={styles.banner}
      />

      {/* CATEGORIES */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            SHOP BY CATEGORY
          </Text>
          <TouchableOpacity style={styles.viewAll}>
            <Text style={styles.viewAllText}>View All</Text>
            <ChevronRight size={20} color="#ff3f6c" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {isLoading ? (
            <ActivityIndicator size="large" color={theme.tint} />
          ) : !categories || categories.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.icon }]}>
              No categories available
            </Text>
          ) : (
            categories.map((category: any) => (
              <TouchableOpacity key={category._id} style={styles.categoryCard}>
                <Image
                  source={{ uri: category.image }}
                  style={styles.categoryImage}
                />
                <Text style={[styles.categoryName, { color: theme.text }]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      {/* DEALS */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          DEALS OF THE DAY
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {deals.map((deal) => (
            <TouchableOpacity key={deal.id} style={styles.dealCard}>
              <Image source={{ uri: deal.image }} style={styles.dealImage} />
              <View style={styles.dealOverlay}>
                <Text style={styles.dealTitle}>{deal.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* RECENTLY VIEWED */}
      {recentlyViewed.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            RECENTLY VIEWED
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentlyViewed.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={[
                  styles.productCard,
                  {
                    backgroundColor: theme.background,
                    width: 160,
                    marginRight: 12,
                    marginLeft: 0,
                  },
                ]}
                onPress={() => handleProductPress(item._id as any)}
              >
                <Image
                  source={{ uri: item.images[0] }}
                  style={[styles.productImage, { height: 160 }]}
                />
                <View style={styles.productInfo}>
                  <Text
                    numberOfLines={1}
                    style={[styles.brandName, { color: theme.icon }]}
                  >
                    {item.brand}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[styles.productName, { color: theme.text }]}
                  >
                    {item.name}
                  </Text>
                  <View style={styles.priceRow}>
                    <Text style={[styles.productPrice, { color: theme.text }]}>
                      {item.price}
                    </Text>
                    {item.discount && (
                      <Text style={styles.discount}>{item.discount}</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* PRODUCTS */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          TRENDING NOW
        </Text>

        {isLoading ? (
          <ActivityIndicator size="large" color={theme.tint} />
        ) : !product || product.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.icon }]}>
            No Product available
          </Text>
        ) : (
          <View style={styles.productsGrid}>
            {product.map((product: any) => (
              <TouchableOpacity
                key={product._id}
                style={[
                  styles.productCard,
                  { backgroundColor: theme.background },
                ]}
                onPress={() => handleProductPress(product._id)}
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
                    <Text style={[styles.productPrice, { color: theme.text }]}>
                      {product.price}
                    </Text>
                    <Text style={styles.discount}>{product.discount}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    // paddingTop: 50,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3e3e3e",
  },
  searchButton: {
    padding: 8,
  },
  banner: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  section: {
    padding: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3e3e3e",
  },
  viewAll: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    color: "#ff3f6c",
    marginRight: 5,
  },
  categoriesScroll: {
    marginHorizontal: -15,
  },
  categoryCard: {
    width: 100,
    marginHorizontal: 8,
  },
  categoryImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  categoryName: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 14,
    color: "#3e3e3e",
  },
  dealsScroll: {
    marginHorizontal: -15,
  },
  dealCard: {
    width: 280,
    height: 150,
    marginHorizontal: 8,
    borderRadius: 10,
    overflow: "hidden",
  },
  dealImage: {
    width: "100%",
    height: "100%",
  },
  dealOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 15,
  },
  dealTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  productCard: {
    width: "48%",
    marginHorizontal: "1%",
    marginBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productImage: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  productInfo: {
    padding: 10,
  },
  brandName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  productName: {
    fontSize: 16,
    marginBottom: 5,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3e3e3e",
    marginRight: 8,
  },
  discount: {
    fontSize: 14,
    color: "#ff3f6c",
    fontWeight: "500",
  },
  loader: {
    marginTop: 50,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    padding: 6,
    borderRadius: 20,
  },
});
