import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Bookmark, ShoppingBag } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";

interface SavedItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    brand: string;
    price: number;
    images: string[];
  };
  size: string;
}

interface SavedForLaterSectionProps {
  items: SavedItem[];
  loading: boolean;
  onMoveToCart: (itemId: string) => void;
  movingItemId: string | null;
}

export const SavedForLaterSection: React.FC<SavedForLaterSectionProps> = ({
  items,
  loading,
  onMoveToCart,
  movingItemId,
}) => {
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#ff3f6c" />
      </View>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Bookmark size={20} color={theme.icon} />
        <Text style={[styles.title, { color: theme.text }]}>
          Saved for Later ({items.length})
        </Text>
      </View>

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
              onPress={() => onMoveToCart(item._id)}
              disabled={movingItemId === item._id}
            >
              {movingItemId === item._id ? (
                <ActivityIndicator size="small" color="#ff3f6c" />
              ) : (
                <>
                  <ShoppingBag size={16} color="#ff3f6c" />
                  <Text style={styles.moveButtonText}>MOVE TO BAG</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3e3e3e",
  },
  savedItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    overflow: "hidden",
    opacity: 0.85,
  },
  itemImage: {
    width: 90,
    height: 110,
  },
  itemInfo: {
    flex: 1,
    padding: 12,
  },
  brandName: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    color: "#3e3e3e",
    marginBottom: 4,
  },
  itemSize: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#3e3e3e",
    marginBottom: 8,
  },
  moveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ff3f6c",
    gap: 6,
    alignSelf: "flex-start",
  },
  moveButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ff3f6c",
  },
});
