import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "recently_viewed";
const MAX_ITEMS = 10;

export interface Product {
  _id: string; // or number, based on your API
  name: string;
  price: number;
  // Add other necessary fields (image, etc.) that you want to display in the list
  images: string[];
  brand?: string;
  discount?: string;
}

import { useAuth } from "@/context/AuthContext";
import axios from "axios";

// ... previous imports

export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Get user context

  // Helper to get storage key based on user
  const getStorageKey = useCallback((userId?: string) => {
    return userId ? `recently_viewed_${userId}` : "recently_viewed_guest";
  }, []);

  const loadRecentlyViewed = useCallback(async () => {
    try {
      setLoading(true);
      const key = getStorageKey(user?._id);
      const jsonValue = await AsyncStorage.getItem(key);

      if (jsonValue != null) {
        setRecentlyViewed(JSON.parse(jsonValue));
      } else {
        setRecentlyViewed([]); // Clear if nothing found for this user
      }
    } catch (e) {
      console.error("Failed to load recently viewed products", e);
    } finally {
      setLoading(false);
    }
  }, [user, getStorageKey]);

  // Reload when user changes
  useEffect(() => {
    loadRecentlyViewed();
  }, [loadRecentlyViewed]);

  const addToRecentlyViewed = useCallback(
    async (product: Product) => {
      try {
        const key = getStorageKey(user?._id);

        // 1. Local Storage Update
        const jsonValue = await AsyncStorage.getItem(key);
        let currentList: Product[] =
          jsonValue != null ? JSON.parse(jsonValue) : [];

        // Remove if already exists to move it to the top
        currentList = currentList.filter((item) => item._id !== product._id);

        // Add to the front
        currentList.unshift(product);

        // Limit size
        if (currentList.length > MAX_ITEMS) {
          currentList = currentList.slice(0, MAX_ITEMS);
        }

        setRecentlyViewed(currentList);
        await AsyncStorage.setItem(key, JSON.stringify(currentList));

        // 2. Server Side Sync
        if (user && user._id) {
          axios
            .post("https://myntrabackend-eal6.onrender.com/api/history", {
              userId: user._id,
              productId: product._id,
            })
            .catch((err) =>
              console.log("Failed to sync history to backend:", err),
            );
        }
      } catch (e) {
        console.error("Failed to save recently viewed product", e);
      }
    },
    [user, getStorageKey],
  );

  return {
    recentlyViewed,
    addToRecentlyViewed,
    loading,
    refresh: loadRecentlyViewed,
  };
};
