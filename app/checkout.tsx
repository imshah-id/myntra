import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useRouter } from "expo-router";
import { CreditCard, MapPin, Truck } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export default function Checkout() {
  const [loading, setLoading] = useState(false);
  const [bagLoading, setBagLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();
  const { cancelAllNotifications } = usePushNotifications();

  // Form state
  const [fullName, setFullName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  // Payment state
  const [paymentMode, setPaymentMode] = useState<"Online" | "COD">("Online");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  // Cart state
  const [bag, setBag] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(99);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchBag();
  }, [user]);

  useEffect(() => {
    // Calculate totals
    const calculatedSubtotal = bag.reduce(
      (sum, item) => sum + item.productId.price * item.quantity,
      0,
    );
    const calculatedTax = Math.round(calculatedSubtotal * 0.05); // 5% tax
    const calculatedTotal = calculatedSubtotal + shipping + calculatedTax;

    setSubtotal(calculatedSubtotal);
    setTax(calculatedTax);
    setTotal(calculatedTotal);
  }, [bag, shipping]);

  const fetchBag = async () => {
    if (!user) return;

    try {
      setBagLoading(true);
      const response = await axios.get(
        `https://myntrabackend-eal6.onrender.com/bag/${user._id}`,
      );
      setBag(response.data || []);
    } catch (error) {
      console.error("Failed to fetch bag", error);
      Alert.alert("Error", "Failed to load cart items");
    } finally {
      setBagLoading(false);
    }
  };

  const validateForm = () => {
    if (!fullName.trim()) {
      Alert.alert("Validation Error", "Please enter your full name");
      return false;
    }
    if (!addressLine1.trim()) {
      Alert.alert("Validation Error", "Please enter your address");
      return false;
    }
    if (!city.trim()) {
      Alert.alert("Validation Error", "Please enter your city");
      return false;
    }
    if (!state.trim()) {
      Alert.alert("Validation Error", "Please enter your state");
      return false;
    }
    if (!postalCode.trim()) {
      Alert.alert("Validation Error", "Please enter your postal code");
      return false;
    }
    if (!country.trim()) {
      Alert.alert("Validation Error", "Please enter your country");
      return false;
    }

    if (paymentMode === "Online") {
      if (!cardNumber.trim()) {
        Alert.alert("Validation Error", "Please enter card number");
        return false;
      }
      if (!expiryDate.trim()) {
        Alert.alert("Validation Error", "Please enter expiry date");
        return false;
      }
      if (!cvv.trim()) {
        Alert.alert("Validation Error", "Please enter CVV");
        return false;
      }
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (bag.length === 0) {
      Alert.alert("Error", "Your cart is empty");
      return;
    }

    try {
      setLoading(true);

      // Construct shipping address
      const shippingAddress = `${addressLine1}, ${addressLine2 ? addressLine2 + ", " : ""}${city}, ${state}, ${postalCode}, ${country}`;

      // Create order
      const orderResponse = await axios.post(
        `https://myntrabackend-eal6.onrender.com/order/create/${user._id}`,
        {
          shippingAddress,
          paymentMethod:
            paymentMode === "Online" ? cardNumber.slice(-4) : "COD",
          items: bag.map((item) => ({
            productId: item.productId._id,
            quantity: item.quantity,
            size: item.size,
            price: item.productId.price,
          })),
          total: total,
          status: "Order Confirmed",
        },
      );

      const orderId = orderResponse.data.order._id;

      // Create transaction record
      await axios.post(
        `https://myntrabackend-eal6.onrender.com/api/transactions`,
        {
          userId: user._id,
          date: new Date().toISOString(),
          amount: total,
          type: paymentMode,
          status: paymentMode === "Online" ? "Success" : "Pending",
          paymentMode:
            paymentMode === "Online"
              ? `Card ending in ${cardNumber.slice(-4)}`
              : "Cash on Delivery",
          orderId: orderId, // Link transaction to order
        },
      );

      await cancelAllNotifications();
      Alert.alert("Success", "Order placed successfully!");
      router.push("/orders");
    } catch (error) {
      console.error("Order placement failed", error);
      Alert.alert("Error", "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loginText}>Please login to checkout</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginButtonText}>LOGIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (bagLoading) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color="#ff3f6c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>
      <ScrollView style={styles.content}>
        {/* Shipping Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={24} color="#ff3f6c" />
            <Text style={styles.sectionTitle}>Shipping Address</Text>
          </View>
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
            />
            <TextInput
              style={styles.input}
              placeholder="Address Line 1"
              value={addressLine1}
              onChangeText={setAddressLine1}
            />
            <TextInput
              style={styles.input}
              placeholder="Address Line 2 (Optional)"
              value={addressLine2}
              onChangeText={setAddressLine2}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="City"
                value={city}
                onChangeText={setCity}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="State"
                value={state}
                onChangeText={setState}
              />
            </View>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Postal Code"
                value={postalCode}
                onChangeText={setPostalCode}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Country"
                value={country}
                onChangeText={setCountry}
              />
            </View>
          </View>
        </View>

        {/* Payment Mode Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard size={24} color="#ff3f6c" />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>
          <View style={styles.paymentModeContainer}>
            <TouchableOpacity
              style={[
                styles.paymentModeButton,
                paymentMode === "Online" && styles.paymentModeButtonActive,
              ]}
              onPress={() => setPaymentMode("Online")}
            >
              <Text
                style={[
                  styles.paymentModeText,
                  paymentMode === "Online" && styles.paymentModeTextActive,
                ]}
              >
                Online Payment
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentModeButton,
                paymentMode === "COD" && styles.paymentModeButtonActive,
              ]}
              onPress={() => setPaymentMode("COD")}
            >
              <Text
                style={[
                  styles.paymentModeText,
                  paymentMode === "COD" && styles.paymentModeTextActive,
                ]}
              >
                Cash on Delivery
              </Text>
            </TouchableOpacity>
          </View>

          {paymentMode === "Online" && (
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Card Number"
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="numeric"
                maxLength={16}
              />
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Expiry Date (MM/YY)"
                  value={expiryDate}
                  onChangeText={setExpiryDate}
                  maxLength={5}
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="CVV"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Truck size={24} color="#ff3f6c" />
            <Text style={styles.sectionTitle}>Order Summary</Text>
          </View>
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Subtotal ({bag.length} items)
              </Text>
              <Text style={styles.summaryValue}>₹{subtotal}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>₹{shipping}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (5%)</Text>
              <Text style={styles.summaryValue}>₹{tax}</Text>
            </View>
            <View style={[styles.summaryRow, styles.total]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{total}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            loading && styles.placeOrderButtonDisabled,
          ]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.placeOrderButtonText}>PLACE ORDER</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loginText: {
    fontSize: 18,
    color: "#3e3e3e",
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
  header: {
    padding: 15,
    paddingTop: 50,
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
  section: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3e3e3e",
    marginLeft: 10,
  },
  form: {
    gap: 10,
  },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  paymentModeContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
  },
  paymentModeButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  paymentModeButtonActive: {
    borderColor: "#ff3f6c",
    backgroundColor: "#fff",
  },
  paymentModeText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  paymentModeTextActive: {
    color: "#ff3f6c",
    fontWeight: "bold",
  },
  summary: {
    gap: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#666",
  },
  summaryValue: {
    fontSize: 16,
    color: "#3e3e3e",
  },
  total: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginTop: 10,
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3e3e3e",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff3f6c",
  },
  footer: {
    padding: 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  placeOrderButton: {
    backgroundColor: "#ff3f6c",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  placeOrderButtonDisabled: {
    backgroundColor: "#ffb3c6",
  },
  placeOrderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
