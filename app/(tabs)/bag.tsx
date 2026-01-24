import { Image } from "expo-image";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  Bookmark,
} from "lucide-react-native";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useTheme } from "@/hooks/useTheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const bagItems = [
  {
    id: 1,
    name: "White Cotton T-Shirt",
    brand: "H&M",
    size: "L",
    price: 799,
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Blue Denim Jacket",
    brand: "Levis",
    size: "M",
    price: 2999,
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=500&auto=format&fit=crop",
  },
];

export default function Bag() {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const [bag, setbag] = useState<any>(null);
  const [savingItemId, setSavingItemId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchproduct();
    }, [user]),
  );

  const fetchproduct = async () => {
    if (user) {
      try {
        setIsLoading(true);
        const bag = await axios.get(
          `https://myntrabackend-eal6.onrender.com/bag/${user._id}`,
        );
        setbag(bag.data);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSaveForLater = async (itemId: string) => {
    try {
      setSavingItemId(itemId);
      // Updated endpoint: /saved/add/:itemid (was bagging/saveforlater)
      await axios.patch(
        `https://myntrabackend-eal6.onrender.com/saved/add/${itemId}`,
      );
      // Refresh bag list
      await fetchproduct();
    } catch (error) {
      console.log("Error saving for later:", error);
    } finally {
      setSavingItemId(null);
    }
  };

  if (!user) {
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
            Shopping Bag
          </Text>
        </View>
        <View style={styles.emptyState}>
          <ShoppingBag size={64} color={theme.tint} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            Please login to view your bag
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
      </View>
    );
  }
  if (isLoading) {
    return (
      <View
        style={[styles.loaderContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }
  const total = bag?.reduce(
    (sum: any, item: any) => sum + item.productId.price * item.quantity,
    0,
  );
  const handledelete = async (itemid: any) => {
    try {
      await axios.delete(
        `https://myntrabackend-eal6.onrender.com/bag/${itemid}`,
      );
      fetchproduct();
    } catch (error) {
      console.log(error);
    }
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
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Shopping Bag
          </Text>
          <TouchableOpacity
            style={[styles.savedButton, { backgroundColor: theme.surface }]}
            onPress={() => router.push("/saved")}
          >
            <Bookmark size={20} color={theme.tint} />
            <Text style={[styles.savedButtonText, { color: theme.tint }]}>
              Saved
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {bag?.map((item: any) => (
          <View
            key={item._id}
            style={[
              styles.bagItem,
              { backgroundColor: theme.surface, shadowColor: theme.icon },
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
              <Text style={[styles.itemName, { color: theme.text }]}>
                {item.productId.name}
              </Text>
              <Text style={[styles.itemSize, { color: theme.icon }]}>
                Size: {item.size}
              </Text>
              <Text style={[styles.itemPrice, { color: theme.text }]}>
                ₹{item.productId.price}
              </Text>

              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    { backgroundColor: theme.background },
                  ]}
                >
                  <Minus size={20} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.quantity, { color: theme.text }]}>
                  {item.quantity}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    { backgroundColor: theme.background },
                  ]}
                >
                  <Plus size={20} color={theme.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handledelete(item._id)}
                >
                  <Trash2 size={20} color={theme.tint} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.saveForLaterButton, { borderColor: theme.tint }]}
                onPress={() => handleSaveForLater(item._id)}
                disabled={savingItemId === item._id}
              >
                {savingItemId === item._id ? (
                  <ActivityIndicator size="small" color={theme.tint} />
                ) : (
                  <>
                    <Bookmark size={14} color={theme.tint} />
                    <Text
                      style={[styles.saveForLaterText, { color: theme.tint }]}
                    >
                      SAVE FOR LATER
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: theme.background, borderTopColor: theme.border },
        ]}
      >
        <View style={styles.totalContainer}>
          <Text style={[styles.totalLabel, { color: theme.text }]}>
            Total Amount
          </Text>
          <Text style={[styles.totalAmount, { color: theme.text }]}>
            ₹{total}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.checkoutButton, { backgroundColor: theme.tint }]}
          onPress={() => router.push("/checkout")}
        >
          <Text
            style={[styles.checkoutButtonText, { color: theme.background }]}
          >
            PLACE ORDER
          </Text>
        </TouchableOpacity>
      </View>
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
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
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
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  bagItem: {
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
    color: "#666",
    marginBottom: 5,
  },
  itemName: {
    fontSize: 16,
    color: "#3e3e3e",
    marginBottom: 5,
  },
  itemSize: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3e3e3e",
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  quantity: {
    marginHorizontal: 15,
    fontSize: 16,
  },
  removeButton: {
    marginLeft: "auto",
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 16,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  checkoutButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  saveForLaterButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: "flex-start",
    gap: 6,
  },
  saveForLaterText: {
    fontSize: 12,
    fontWeight: "600",
  },
  total: {
    borderTopWidth: 1,
    marginTop: 10,
    paddingTop: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  savedButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
  savedButtonText: {
    fontWeight: "600",
    fontSize: 14,
  },
});
