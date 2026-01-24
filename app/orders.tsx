import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import {
  Package,
  ChevronRight,
  MapPin,
  Truck,
  Clock,
  CheckCircle,
  Circle,
  CreditCard,
  ArrowLeft,
} from "lucide-react-native";
import React from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ORDER_STATUSES } from "@/constants/orders";
import { useTheme } from "../hooks/useTheme";

// Status colors removed from here as they are now used from persistence util if needed,
// but actually they are still here for UI.

// Status colors
const getStatusColor = (status: string) => {
  switch (status) {
    case "Delivered":
      return "#00b852";
    case "Out for Delivery":
      return "#ff9800";
    case "In Transit":
      return "#2196f3";
    case "Shipped":
      return "#9c27b0";
    case "Order Confirmed":
      return "#ff3f6c";
    default:
      return "#666";
  }
};

// Generate random tracking number
const generateTrackingNumber = () => {
  return `TRK${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
};

// Generate tracking timeline based on current status
const generateTimeline = (currentStatus: string, orderDate: Date) => {
  const statusIndex = ORDER_STATUSES.indexOf(currentStatus);
  const timeline = [];

  for (let i = 0; i <= statusIndex; i++) {
    const eventDate = new Date(orderDate);
    eventDate.setHours(eventDate.getHours() + i * 12); // 12 hours between each status

    timeline.push({
      status: ORDER_STATUSES[i],
      location:
        i === 0
          ? "Online"
          : i === statusIndex
            ? "Your City"
            : "Distribution Center",
      timestamp: eventDate.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  }

  return timeline.reverse(); // Show newest first
};

export default function Orders() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    fetchOrders();
  }, [user]);

  // Refresh orders when page comes into focus (e.g., after placing an order)
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchOrders();
      }
    }, [user]),
  );

  const fetchOrders = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const response = await axios.get(
        `https://myntrabackend-eal6.onrender.com/order/user/${user._id}`,
      );

      const fetchedOrders = response.data || [];
      // Sort newest first
      fetchedOrders.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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

  if (!orders || orders.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, backgroundColor: theme.surface },
        ]}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.background,
              borderBottomColor: theme.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 10 }}
          >
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            My Orders
          </Text>
        </View>
        <View style={styles.emptyState}>
          <Package size={64} color={theme.icon} />
          <Text style={[styles.emptyText, { color: theme.text }]}>
            No orders found
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.icon }]}>
            Your orders will appear here once you make a purchase
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: theme.surface },
      ]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.background,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 10 }}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            My Orders
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.icon }]}>
            {orders.length} orders
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {orders.map((order: any) => {
          const currentStatus = order.status || "Order Confirmed";
          const statusColor = getStatusColor(currentStatus);
          const trackingNumber = generateTrackingNumber();
          const timeline = generateTimeline(
            currentStatus,
            new Date(order.createdAt),
          );

          return (
            <View
              key={order._id}
              style={[styles.orderCard, { backgroundColor: theme.background }]}
            >
              <TouchableOpacity
                style={[
                  styles.orderHeader,
                  { borderBottomColor: theme.border },
                ]}
                onPress={() => toggleOrderDetails(order._id)}
              >
                <View>
                  <Text style={[styles.orderId, { color: theme.text }]}>
                    Order #{order._id.slice(-8)}
                  </Text>
                  <Text style={[styles.orderDate, { color: theme.icon }]}>
                    {formatDate(order.createdAt)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${statusColor}15` },
                  ]}
                >
                  <View
                    style={[styles.statusDot, { backgroundColor: statusColor }]}
                  />
                  <Text style={[styles.orderStatus, { color: statusColor }]}>
                    {currentStatus}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.itemsContainer}>
                {order.items.map((item: any) => (
                  <View key={item._id} style={styles.orderItem}>
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
                        numberOfLines={2}
                      >
                        {item.productId.name}
                      </Text>
                      <Text style={[styles.itemDetails, { color: theme.icon }]}>
                        Size: {item.size} | Qty: {item.quantity}
                      </Text>
                      <Text style={[styles.itemPrice, { color: theme.text }]}>
                        ₹{item.price}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {expandedOrder === order._id && (
                <View
                  style={[
                    styles.orderDetails,
                    { borderTopColor: theme.border },
                  ]}
                >
                  {/* Shipping Address */}
                  <View style={styles.detailSection}>
                    <View style={styles.detailHeader}>
                      <MapPin size={20} color="#ff3f6c" />
                      <Text style={[styles.detailTitle, { color: theme.text }]}>
                        Shipping Address
                      </Text>
                    </View>
                    <Text style={[styles.detailText, { color: theme.icon }]}>
                      {order.shippingAddress}
                    </Text>
                  </View>

                  {/* Payment Method */}
                  <View style={styles.detailSection}>
                    <View style={styles.detailHeader}>
                      <CreditCard size={20} color="#ff3f6c" />
                      <Text style={[styles.detailTitle, { color: theme.text }]}>
                        Payment Method
                      </Text>
                    </View>
                    <Text style={[styles.detailText, { color: theme.icon }]}>
                      {order.paymentMethod}
                    </Text>
                  </View>

                  {/* Tracking Information */}
                  <View style={styles.detailSection}>
                    <View style={styles.detailHeader}>
                      <Truck size={20} color="#ff3f6c" />
                      <Text style={[styles.detailTitle, { color: theme.text }]}>
                        Order Tracking
                      </Text>
                    </View>
                    <View style={styles.trackingInfo}>
                      <Text
                        style={[styles.trackingNumber, { color: theme.icon }]}
                      >
                        Tracking: {trackingNumber}
                      </Text>
                      <Text
                        style={[styles.trackingCarrier, { color: theme.icon }]}
                      >
                        Carrier: {Math.random() > 0.5 ? "FedEx" : "DHL Express"}
                      </Text>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                      {ORDER_STATUSES.map((status, index) => {
                        const isCompleted =
                          ORDER_STATUSES.indexOf(currentStatus) >= index;
                        return (
                          <View key={status} style={styles.progressStep}>
                            <View style={styles.progressIconContainer}>
                              {isCompleted ? (
                                <CheckCircle size={24} color={statusColor} />
                              ) : (
                                <Circle size={24} color="#e0e0e0" />
                              )}
                              {index < ORDER_STATUSES.length - 1 && (
                                <View
                                  style={[
                                    styles.progressLine,
                                    isCompleted && {
                                      backgroundColor: statusColor,
                                    },
                                  ]}
                                />
                              )}
                            </View>
                            <Text
                              style={[
                                styles.progressLabel,
                                isCompleted && {
                                  color: statusColor,
                                  fontWeight: "600",
                                },
                              ]}
                            >
                              {status}
                            </Text>
                          </View>
                        );
                      })}
                    </View>

                    {/* Timeline */}
                    <View style={styles.timeline}>
                      <Text
                        style={[styles.timelineTitle, { color: theme.text }]}
                      >
                        Order History
                      </Text>
                      {timeline.map((event: any, index: number) => (
                        <View key={index} style={styles.timelineEvent}>
                          <View
                            style={[
                              styles.timelinePoint,
                              { backgroundColor: statusColor },
                            ]}
                          />
                          <View style={styles.timelineContent}>
                            <Text
                              style={[
                                styles.timelineStatus,
                                { color: theme.text },
                              ]}
                            >
                              {event.status}
                            </Text>
                            <Text
                              style={[
                                styles.timelineLocation,
                                { color: theme.icon },
                              ]}
                            >
                              {event.location}
                            </Text>
                            <Text
                              style={[
                                styles.timelineTimestamp,
                                { color: theme.icon },
                              ]}
                            >
                              {event.timestamp}
                            </Text>
                          </View>
                          {index !== timeline.length - 1 && (
                            <View
                              style={[
                                styles.timelineLine,
                                { backgroundColor: theme.border },
                              ]}
                            />
                          )}
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              <View
                style={[styles.orderFooter, { borderTopColor: theme.border }]}
              >
                <View style={styles.totalContainer}>
                  <Text style={[styles.totalLabel, { color: theme.icon }]}>
                    Order Total
                  </Text>
                  <Text style={[styles.totalAmount, { color: theme.text }]}>
                    ₹{order.total}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => toggleOrderDetails(order._id)}
                >
                  <Text style={styles.detailsButtonText}>
                    {expandedOrder === order._id
                      ? "Hide Details"
                      : "View Details"}
                  </Text>
                  <ChevronRight
                    size={20}
                    color="#ff3f6c"
                    style={{
                      transform: [
                        {
                          rotate:
                            expandedOrder === order._id ? "90deg" : "0deg",
                        },
                      ],
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
        <View style={{ height: 20 }} />
      </ScrollView>
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
  header: {
    padding: 15,
    paddingTop: 50,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3e3e3e",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3e3e3e",
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 15,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3e3e3e",
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  orderStatus: {
    fontSize: 13,
    fontWeight: "600",
  },
  itemsContainer: {
    padding: 15,
  },
  orderItem: {
    flexDirection: "row",
    marginBottom: 15,
  },
  itemImage: {
    width: 80,
    height: 100,
    borderRadius: 5,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 15,
  },
  brandName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  itemName: {
    fontSize: 16,
    color: "#3e3e3e",
    marginBottom: 2,
  },
  itemDetails: {
    fontSize: 13,
    color: "#999",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3e3e3e",
  },
  orderDetails: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  detailSection: {
    marginBottom: 20,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3e3e3e",
    marginLeft: 10,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  trackingInfo: {
    marginBottom: 15,
  },
  trackingNumber: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  trackingCarrier: {
    fontSize: 14,
    color: "#666",
  },
  progressContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  progressStep: {
    marginBottom: 15,
  },
  progressIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#e0e0e0",
    marginLeft: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: "#666",
    marginLeft: 32,
  },
  timeline: {
    marginTop: 20,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3e3e3e",
    marginBottom: 15,
  },
  timelineEvent: {
    flexDirection: "row",
    marginBottom: 20,
    position: "relative",
  },
  timelinePoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ff3f6c",
    marginTop: 5,
  },
  timelineLine: {
    position: "absolute",
    left: 5,
    top: 17,
    width: 2,
    height: "100%",
    backgroundColor: "#f0f0f0",
  },
  timelineContent: {
    marginLeft: 15,
    flex: 1,
  },
  timelineStatus: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#3e3e3e",
    marginBottom: 2,
  },
  timelineLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  timelineTimestamp: {
    fontSize: 12,
    color: "#999",
  },
  orderFooter: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 16,
    color: "#666",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3e3e3e",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  detailsButtonText: {
    fontSize: 16,
    color: "#ff3f6c",
    marginRight: 5,
  },
});
