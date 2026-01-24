import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  Bookmark,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useTheme } from "@/hooks/useTheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SavedForLaterSection } from "@/components/SavedForLaterSection";

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
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savingItemId, setSavingItemId] = useState<string | null>(null);
  const [movingItemId, setMovingItemId] = useState<string | null>(null);

  useEffect(() => {
    fetchproduct();
    fetchSavedItems();
  }, [user]);

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

  const fetchSavedItems = async () => {
    if (user) {
      try {
        setSavedLoading(true);
        const response = await axios.get(
          `https://myntrabackend-eal6.onrender.com/bag/saved-for-later/${user._id}`,
        );
        setSavedItems(response.data || []);
      } catch (error) {
        console.log("Error fetching saved items:", error);
      } finally {
        setSavedLoading(false);
      }
    }
  };

  const handleSaveForLater = async (itemId: string) => {
    try {
      setSavingItemId(itemId);
      await axios.patch(
        `https://myntrabackend-eal6.onrender.com/bag/saveforlater/${itemId}`,
      );
      // Refresh both lists
      await Promise.all([fetchproduct(), fetchSavedItems()]);
    } catch (error) {
      console.log("Error saving for later:", error);
    } finally {
      setSavingItemId(null);
    }
  };

  const handleMoveToCart = async (itemId: string) => {
    try {
      setMovingItemId(itemId);
      await axios.patch(
        `https://myntrabackend-eal6.onrender.com/bag/movetobag/${itemId}`,
      );
      // Refresh both lists
      await Promise.all([fetchproduct(), fetchSavedItems()]);
    } catch (error) {
      console.log("Error moving to cart:", error);
    } finally {
      setMovingItemId(null);
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
            <Text style={styles.loginButtonText}>LOGIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#ff3f6c" />
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Shopping Bag
        </Text>
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
                style={styles.saveForLaterButton}
                onPress={() => handleSaveForLater(item._id)}
                disabled={savingItemId === item._id}
              >
                {savingItemId === item._id ? (
                  <ActivityIndicator size="small" color="#666" />
                ) : (
                  <>
                    <Bookmark size={14} color="#666" />
                    <Text style={styles.saveForLaterText}>SAVE FOR LATER</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <SavedForLaterSection
          items={savedItems}
          loading={savedLoading}
          onMoveToCart={handleMoveToCart}
          movingItemId={movingItemId}
        />
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
          style={styles.checkoutButton}
          onPress={() => router.push("/checkout")}
        >
          <Text style={styles.checkoutButtonText}>PLACE ORDER</Text>
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
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 15,
    // paddingTop: 50,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3e3e3e",
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
    color: "#3e3e3e",
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
  bagItem: {
    flexDirection: "row",
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
    backgroundColor: "#f5f5f5",
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
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 16,
    color: "#3e3e3e",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3e3e3e",
  },
  checkoutButton: {
    backgroundColor: "#ff3f6c",
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
    marginTop: 10,
    paddingVertical: 8,
    gap: 6,
  },
  saveForLaterText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
});
