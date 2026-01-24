import React, { useEffect, useState } from "react";
import { Image } from "expo-image";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useTheme } from "@/hooks/useTheme";
import { useRouter } from "expo-router";
import { ArrowLeft, ShoppingBag, Bookmark } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SavedItems() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [movingItemId, setMovingItemId] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedItems();
  }, [user]);

  const fetchSavedItems = async () => {
    if (user) {
      try {
        setLoading(true);
        // Updated endpoint: /saved/:userid
        const response = await axios.get(
          `https://myntrabackend-eal6.onrender.com/saved/${user._id}`,
        );
        setItems(response.data || []);
      } catch (error) {
        console.log("Error fetching saved items:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMoveToCart = async (itemId: string) => {
    try {
      setMovingItemId(itemId);
      // Updated endpoint: /saved/move-to-bag/:itemid
      await axios.patch(
        `https://myntrabackend-eal6.onrender.com/saved/move-to-bag/${itemId}`,
      );
      // Remove item from list locally to avoid full refetch delay
      setItems((prev) => prev.filter((item) => item._id !== itemId));
    } catch (error) {
      console.log("Error moving to cart:", error);
    } finally {
      setMovingItemId(null);
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.center}>
          <Text style={{ color: theme.text }}>
            Please login to view saved items.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, paddingTop: insets.top },
      ]}
    >
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Saved for Later
        </Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.tint} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Bookmark size={64} color={theme.icon} />
          <Text style={[styles.emptyText, { color: theme.text }]}>
            No saved items
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.icon }]}>
            Items you save for later will appear here
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {items.map((item) => (
            <View
              key={item._id}
              style={[
                styles.savedItem,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Image
                source={{ uri: item.productId.images[0] }}
                style={styles.itemImage}
                contentFit="cover"
                transition={200}
              />
              <View style={styles.itemInfo}>
                <Text style={[styles.brandName, { color: theme.icon }]}>
                  {item.productId.brand}
                </Text>
                <Text
                  style={[styles.itemName, { color: theme.text }]}
                  numberOfLines={1}
                >
                  {item.productId.name}
                </Text>
                <Text style={[styles.itemSize, { color: theme.icon }]}>
                  Size: {item.size}
                </Text>
                <Text style={[styles.itemPrice, { color: theme.text }]}>
                  ₹{item.productId.price}
                </Text>

                <TouchableOpacity
                  style={[styles.moveButton, { borderColor: theme.tint }]}
                  onPress={() => handleMoveToCart(item._id)}
                  disabled={movingItemId === item._id}
                >
                  {movingItemId === item._id ? (
                    <ActivityIndicator size="small" color={theme.tint} />
                  ) : (
                    <>
                      <ShoppingBag size={16} color={theme.tint} />
                      <Text
                        style={[styles.moveButtonText, { color: theme.tint }]}
                      >
                        MOVE TO BAG
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    backgroundColor: "transparent",
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  savedItem: {
    flexDirection: "row",
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    overflow: "hidden",
  },
  itemImage: {
    width: 100,
    height: 120,
  },
  itemInfo: {
    flex: 1,
    padding: 12,
  },
  brandName: {
    fontSize: 12,
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "500",
  },
  itemSize: {
    fontSize: 12,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  moveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: "flex-start",
    gap: 6,
  },
  moveButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
});
