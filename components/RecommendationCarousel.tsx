import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  brand: string;
  discount: string;
}

interface RecommendationCarouselProps {
  currentProductId: string;
}

export const RecommendationCarousel: React.FC<RecommendationCarouselProps> = ({
  currentProductId,
}) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const { theme } = useTheme();

  // Calculate card width based on screen width (e.g., 40% of screen width)
  const cardWidth = width * 0.4;

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Using the existing backend URL structure
        const response = await axios.get(
          `https://myntrabackend-eal6.onrender.com/api/recommendations`,
          {
            params: {
              userId: user._id,
              currentProductId: currentProductId,
            },
          },
        );
        setRecommendations(response.data);
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentProductId, user]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color="#ff3f6c" />
      </View>
    );
  }

  if (recommendations.length === 0) {
    return null; // Don't render anything if no recommendations
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        You May Also Like
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {recommendations.map((item) => (
          <TouchableOpacity
            key={item._id}
            style={[
              styles.card,
              {
                width: cardWidth,
                backgroundColor: theme.background,
                borderColor: theme.border,
              },
            ]}
            onPress={() => router.push(`/product/${item._id}`)}
          >
            <Image
              source={{ uri: item.images[0] }}
              style={[styles.image, { backgroundColor: theme.surface }]}
              resizeMode="cover"
            />
            <View style={styles.info}>
              <Text
                style={[styles.brand, { color: theme.icon }]}
                numberOfLines={1}
              >
                {item.brand}
              </Text>
              <Text
                style={[styles.name, { color: theme.text }]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <View style={styles.priceContainer}>
                <Text style={[styles.price, { color: theme.text }]}>
                  ₹{item.price}
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
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    // backgroundColor handled inline
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3e3e3e",
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  loaderContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 15,
    gap: 15,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  image: {
    width: "100%",
    height: 150,
    backgroundColor: "#f5f5f5",
  },
  info: {
    padding: 10,
  },
  brand: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    color: "#3e3e3e",
    marginBottom: 6,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 5,
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#3e3e3e",
  },
  discount: {
    fontSize: 12,
    color: "#ff3f6c",
  },
});
