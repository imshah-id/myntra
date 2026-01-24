import { useState, useEffect, useRef } from "react";
import { Image } from "expo-image";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Heart, ShoppingBag, ArrowLeft } from "lucide-react-native";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { RecommendationCarousel } from "@/components/RecommendationCarousel";
import { useTheme } from "../../hooks/useTheme";
import { CustomAlert } from "@/components/CustomAlert";

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [selectedSize, setSelectedSize] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const autoScrollTimer = useRef<NodeJS.Timeout>();
  const { user } = useAuth();
  const [product, setproduct] = useState<any>(null);
  const [iswishlist, setiswishlist] = useState(false);

  const { addToRecentlyViewed } = useRecentlyViewed();
  const { theme } = useTheme();

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
  });

  const showAlert = (title: string, message: string) => {
    setAlertConfig({ visible: true, title, message });
  };

  const hideAlert = () => {
    setAlertConfig({ ...alertConfig, visible: false });
  };

  useEffect(() => {
    // Simulate loading time

    const fetchproduct = async () => {
      try {
        setIsLoading(true);
        const product = await axios.get(
          `https://myntrabackend-eal6.onrender.com/product/${id}`,
        );
        setproduct(product.data);
        addToRecentlyViewed(product.data);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchproduct();
  }, [id]);

  useEffect(() => {
    // Start auto-scroll
    startAutoScroll();

    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, []);

  const startAutoScroll = () => {
    autoScrollTimer.current = setInterval(() => {
      if (product && scrollViewRef.current) {
        const nextIndex = (currentImageIndex + 1) % product.images.length;
        scrollViewRef.current.scrollTo({
          x: nextIndex * width,
          animated: true,
        });
        setCurrentImageIndex(nextIndex);
      }
    }, 3000);
  };

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Product not found</Text>
      </View>
    );
  }
  const handleAddwishlist = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      await axios.post(`https://myntrabackend-eal6.onrender.com/wishlist`, {
        userId: user._id,
        productId: id,
      });
      setiswishlist(true);
      router.push("/wishlist");
    } catch (error) {
      console.log(error);
    }
  };
  const handleAddToBag = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!selectedSize) {
      showAlert(
        "Please Select Size",
        "Please select a size before adding to bag",
      );
      return;
    }
    try {
      setLoading(true);
      await axios.post(`https://myntrabackend-eal6.onrender.com/bag`, {
        userId: user._id,
        productId: id,
        size: selectedSize,
        quantity: 1,
      });
      router.push("/bag");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
    // In a real app, this would add the item to the cart in your state management solution
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const imageIndex = Math.round(contentOffset.x / width);
    setCurrentImageIndex(imageIndex);

    // Reset auto-scroll timer when user manually scrolls
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      startAutoScroll();
    }
  };

  if (isLoading) {
    return (
      <View
        style={[styles.loaderContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color="#ff3f6c" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Floating Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.background }]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View style={styles.carouselContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {product.images.map((image: any, index: any) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={[styles.productImage, { width }]}
                contentFit="cover"
                transition={200}
              />
            ))}
          </ScrollView>
          <View style={styles.pagination}>
            {product.images.map((_: any, index: any) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  currentImageIndex === index && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.brand, { color: theme.icon }]}>
                {product.brand}
              </Text>
              <Text style={[styles.name, { color: theme.text }]}>
                {product.name}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.wishlistButton}
              onPress={handleAddwishlist}
            >
              <Heart
                size={24}
                color={iswishlist ? "#ff3f6c" : "#ccc"}
                fill={iswishlist ? "#ff3f6c" : "none"}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: theme.text }]}>
              ₹{product.price}
            </Text>
            <Text style={styles.discount}>{product.discount}</Text>
          </View>

          <Text style={[styles.description, { color: theme.icon }]}>
            {product.description}
          </Text>

          <View style={styles.sizeSection}>
            <Text style={[styles.sizeTitle, { color: theme.text }]}>
              Select Size
            </Text>
            <View style={styles.sizeGrid}>
              {product.sizes.map((size: any) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeButton,
                    { borderColor: theme.border },
                    selectedSize === size && {
                      borderColor: theme.tint,
                      backgroundColor: theme.surface, // Or a tint-based surface if supported, but surface is safe
                    },
                  ]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      { color: theme.text },
                      selectedSize === size && styles.selectedSizeText,
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <RecommendationCarousel currentProductId={id as string} />
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.background,
            borderTopColor: theme.icon,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.addToBagButton}
          onPress={handleAddToBag}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ff3f6c" />
          ) : (
            <>
              <ShoppingBag size={20} color="#fff" />
              <Text style={[styles.addToBagText, { color: theme.tintText }]}>
                ADD TO BAG
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={hideAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  carouselContainer: {
    position: "relative",
  },
  productImage: {
    height: 400,
  },
  pagination: {
    position: "absolute",
    bottom: 16,
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#fff",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  brand: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3e3e3e",
    marginBottom: 10,
  },
  wishlistButton: {
    padding: 10,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3e3e3e",
    marginRight: 10,
  },
  discount: {
    fontSize: 16,
    color: "#ff3f6c",
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: 20,
  },
  sizeSection: {
    marginBottom: 20,
  },
  sizeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3e3e3e",
    marginBottom: 10,
  },
  sizeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  sizeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  sizeText: {
    fontSize: 16,
    color: "#3e3e3e",
  },
  selectedSizeText: {
    color: "#ff3f6c",
  },
  footer: {
    padding: 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  addToBagButton: {
    backgroundColor: "#ff3f6c",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    gap: 10,
    maxWidth: 175,
    width: "100%",
    alignSelf: "center",
  },
  addToBagText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  topHeader: {
    position: "absolute",
    top: 40, // Adjust for status bar
    left: 20,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});
