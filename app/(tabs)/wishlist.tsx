import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useRouter } from "expo-router";
import { Heart, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export default function Wishlist() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [wishlist, setwishlist] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    fetchproduct();
  }, [user]);
  const fetchproduct = async () => {
    if (user) {
      try {
        setIsLoading(true);
        const bag = await axios.get(
          `https://myntrabackend-eal6.onrender.com/wishlist/${user._id}`,
        );
        setwishlist(bag.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handledelete = async (itemid: any) => {
    try {
      await axios.delete(
        `https://myntrabackend-eal6.onrender.com/wishlist/${itemid}`,
      );
      fetchproduct();
    } catch (error) {
      console.log(error);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
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
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Wishlist
          </Text>
        </View>

        <View style={styles.emptyState}>
          <Heart size={64} color={theme.tint} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            Please login to view your wishlist
          </Text>

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: theme.tint }]}
            onPress={() => router.push("/login")}
          >
            <Text style={[styles.loginButtonText, { color: theme.background }]}>
              LOGIN
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.loaderContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.tint} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Wishlist
        </Text>
      </View>

      {/* CONTENT */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.content,
          { backgroundColor: theme.background },
        ]}
      >
        {wishlist?.map((item: any) => (
          <View
            key={item._id}
            style={[
              styles.wishlistItem,
              { backgroundColor: theme.surface, shadowColor: theme.icon },
            ]}
          >
            <Image
              source={{ uri: item.productId.images[0] }}
              style={styles.itemImage}
            />

            <View style={styles.itemInfo}>
              <Text style={[styles.brandName, { color: theme.icon }]}>
                {item.productId.brand}
              </Text>
              <Text style={[styles.itemName, { color: theme.text }]}>
                {item.productId.name}
              </Text>

              <View style={styles.priceContainer}>
                <Text style={[styles.price, { color: theme.text }]}>
                  {item.productId.price}
                </Text>
                <Text style={[styles.discount, { color: theme.tint }]}>
                  {item.productId.discount}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handledelete(item._id)}
            >
              <Trash2 size={24} color={theme.tint} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
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
  content: {
    padding: 15,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#ff3f6c",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  wishlistItem: {
    flexDirection: "row",
    borderRadius: 10,
    marginBottom: 15,
    elevation: 5,
    overflow: "hidden",
  },
  itemImage: {
    width: 100,
    height: 120,
  },
  itemInfo: {
    flex: 1,
    padding: 15,
  },
  brandName: {
    fontSize: 14,
    marginBottom: 5,
  },
  itemName: {
    fontSize: 16,
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  discount: {
    fontSize: 14,
    color: "#ff3f6c",
  },
  removeButton: {
    padding: 15,
    justifyContent: "center",
  },
});
