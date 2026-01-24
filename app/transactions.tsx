import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Download,
  Filter,
  FileText,
  Calendar,
  ArrowUpDown,
} from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ORDER_STATUSES } from "@/constants/orders";
import { useFocusEffect } from "expo-router";
import { useTheme } from "../hooks/useTheme";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import { CustomAlert } from "@/components/CustomAlert";

// Types
interface Transaction {
  _id: string;
  date: string;
  amount: number;
  type: "Online" | "COD" | "Refund";
  status: "Success" | "Pending" | "Failed";
  description: string;
  paymentMode: string;
  orderId?: {
    status: string;
  };
}

type SortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

export default function Transactions() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv">("pdf");
  const [showExportMenu, setShowExportMenu] = useState(false);

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

  // Date range state
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [showDateFilter, setShowDateFilter] = useState(false);

  // Shared status state removed

  useEffect(() => {
    fetchTransactions();
  }, [user, filterType, sortBy, dateFrom, dateTo]);

  // Persistence loading and simulation loop removed

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      // Construct query params
      const params: any = { userId: user._id };
      if (filterType) params.type = filterType;
      if (dateFrom) params.dateFrom = dateFrom.toISOString();
      if (dateTo) params.dateTo = dateTo.toISOString();

      const response = await axios.get(
        `https://myntrabackend-eal6.onrender.com/api/transactions`,
        { params },
      );

      // Sort transactions locally
      let sorted = [...response.data];
      switch (sortBy) {
        case "date-desc":
          sorted.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );
          break;
        case "date-asc":
          sorted.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          );
          break;
        case "amount-desc":
          sorted.sort((a, b) => b.amount - a.amount);
          break;
        case "amount-asc":
          sorted.sort((a, b) => a.amount - b.amount);
          break;
      }

      setTransactions(sorted);

      setTransactions(sorted);
    } catch (error) {
      console.error("Failed to fetch transactions", error);
      showAlert("Error", "Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!user) return;
    try {
      setShowExportMenu(false);
      showAlert(
        "Exporting",
        `Preparing ${exportFormat.toUpperCase()} download...`,
      );

      const response = await axios.get(
        `https://myntrabackend-eal6.onrender.com/api/transactions/export`,
        {
          params: { userId: user._id, format: exportFormat },
          responseType: "blob",
        },
      );

      // Handle file download based on platform
      if (Platform.OS === "web") {
        // Web download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `transactions.${exportFormat}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        const fr = new FileReader();
        fr.onload = async () => {
          const base64 =
            typeof fr.result === "string" ? fr.result.split(",")[1] : "";
          const fileUri =
            FileSystem.documentDirectory + `transactions.${exportFormat}`;

          await FileSystem.writeAsStringAsync(fileUri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });

          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri);
          } else {
            showAlert("Error", "Sharing is not available on this device");
          }
        };
        fr.readAsDataURL(response.data); // response.data is a Blob
      }

      showAlert("Success", "Transaction history exported successfully.");
    } catch (error) {
      console.error("Export failed", error);
      showAlert("Error", "Failed to export transactions. Please try again.");
    }
  };

  const handleReceiptDownload = async (transactionId: string) => {
    try {
      const transaction = transactions.find((t) => t._id === transactionId);
      if (!transaction) return;

      showAlert("Downloading", "Generating receipt...");

      const html = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', sans-serif; padding: 20px; color: #333; }
              .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #ff3f6c; padding-bottom: 20px; }
              .logo { font-size: 24px; font-weight: bold; color: #ff3f6c; margin-bottom: 10px; }
              .title { font-size: 18px; color: #666; }
              .details { margin-bottom: 30px; }
              .row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
              .label { font-weight: bold; color: #666; }
              .value { text-align: right; }
              .amount-row { font-size: 18px; font-weight: bold; margin-top: 20px; border-top: 2px solid #333; padding-top: 10px; }
              .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">Myntra</div>
              <div class="title">Transaction Receipt</div>
            </div>
            
            <div class="details">
              <div class="row">
                <span class="label">Transaction ID</span>
                <span class="value">${transaction._id}</span>
              </div>
              <div class="row">
                <span class="label">Date</span>
                <span class="value">${new Date(transaction.date).toLocaleString()}</span>
              </div>
              <div class="row">
                <span class="label">Type</span>
                <span class="value">${transaction.type}</span>
              </div>
              <div class="row">
                <span class="label">Payment Mode</span>
                <span class="value">${transaction.paymentMode}</span>
              </div>
               <div class="row">
                <span class="label">Status</span>
                <span class="value" style="color: ${getStatusColor(transaction.status)}">${transaction.status}</span>
              </div>
              
              <div class="row amount-row">
                <span class="label">Amount Paid</span>
                <span class="value">₹${transaction.amount}</span>
              </div>
            </div>

            <div class="footer">
              <p>Thank you for shopping with us!</p>
              <p>This is a computer generated receipt and does not require a physical signature.</p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: ".pdf",
          mimeType: "application/pdf",
        });
      } else {
        showAlert("Success", "Receipt saved to " + uri);
      }
    } catch (error) {
      console.error("Receipt download failed", error);
      showAlert("Error", "Failed to generate receipt.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "#00b852";
      case "pending":
        return "#f0ad4e";
      case "failed":
        return "#ff3f6c";
      default:
        return "#666";
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const clearDateFilter = () => {
    setDateFrom(null);
    setDateTo(null);
    setShowDateFilter(false);
  };

  const setQuickDateRange = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    setDateFrom(from);
    setDateTo(to);
    setShowDateFilter(false);
  };

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>
          Please login to view transactions.
        </Text>
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
      {/* Header */}
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
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          My Transactions
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setShowSortMenu(!showSortMenu)}
            style={styles.iconButton}
          >
            <ArrowUpDown size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowExportMenu(!showExportMenu)}
            style={styles.iconButton}
          >
            <Download size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sort Menu */}
      {showSortMenu && (
        <View
          style={[styles.menuContainer, { backgroundColor: theme.surface }]}
        >
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setSortBy("date-desc");
              setShowSortMenu(false);
            }}
          >
            <Text style={[styles.menuText, { color: theme.text }]}>
              Date (Newest First)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: theme.border }]}
            onPress={() => {
              setSortBy("date-asc");
              setShowSortMenu(false);
            }}
          >
            <Text style={styles.menuText}>Date (Oldest First)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setSortBy("amount-desc");
              setShowSortMenu(false);
            }}
          >
            <Text style={styles.menuText}>Amount (High to Low)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setSortBy("amount-asc");
              setShowSortMenu(false);
            }}
          >
            <Text style={styles.menuText}>Amount (Low to High)</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Export Menu */}
      {showExportMenu && (
        <View
          style={[styles.menuContainer, { backgroundColor: theme.background }]}
        >
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: theme.border }]}
            onPress={() => {
              setExportFormat("pdf");
              handleExport();
            }}
          >
            <Text style={[styles.menuText, { color: theme.text }]}>
              Export as PDF
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setExportFormat("csv");
              handleExport();
            }}
          >
            <Text style={[styles.menuText, { color: theme.text }]}>
              Export as CSV
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filters */}
      <View
        style={[styles.filterSection, { backgroundColor: theme.background }]}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {["All", "Online", "COD", "Refund"].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterChip,
                { backgroundColor: theme.surface }, // Default bg
                (filterType === type || (type === "All" && !filterType)) &&
                  styles.activeFilter,
              ]}
              onPress={() => setFilterType(type === "All" ? null : type)}
            >
              <Text
                style={[
                  styles.filterText,
                  filterType === type || (type === "All" && !filterType)
                    ? styles.activeFilterText
                    : { color: theme.text },
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Date Range Quick Filters */}
        <View style={styles.dateFilterRow}>
          <TouchableOpacity
            style={[
              styles.dateFilterButton,
              { backgroundColor: theme.surface },
            ]}
            onPress={() => setQuickDateRange(7)}
          >
            <Calendar size={16} color="#ff3f6c" />
            <Text style={styles.dateFilterText}>Last 7 days</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.dateFilterButton,
              { backgroundColor: theme.surface },
            ]}
            onPress={() => setQuickDateRange(30)}
          >
            <Calendar size={16} color="#ff3f6c" />
            <Text style={styles.dateFilterText}>Last 30 days</Text>
          </TouchableOpacity>
          {(dateFrom || dateTo) && (
            <TouchableOpacity
              style={[
                styles.clearFilterButton,
                { backgroundColor: theme.surface },
              ]}
              onPress={clearDateFilter}
            >
              <Text style={[styles.clearFilterText, { color: theme.icon }]}>
                Clear
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={[styles.center, { backgroundColor: theme.surface }]}>
          <ActivityIndicator size="large" color="#ff3f6c" />
        </View>
      ) : transactions.length === 0 ? (
        <View style={[styles.center, { backgroundColor: theme.surface }]}>
          <FileText size={48} color={theme.icon} />
          <Text style={[styles.emptyText, { color: theme.text }]}>
            No transactions found
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {transactions.map((txn) => {
            const { date, time } = formatDateTime(txn.date);
            return (
              <View
                key={txn._id}
                style={[styles.card, { backgroundColor: theme.background }]}
              >
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={[styles.txnId, { color: theme.text }]}>
                      ID: {txn._id.slice(-8)}
                    </Text>
                    <Text style={[styles.txnDate, { color: theme.icon }]}>
                      {date}
                    </Text>
                    <Text style={[styles.txnTime, { color: theme.icon }]}>
                      {time}
                    </Text>
                  </View>
                  <Text style={[styles.amount, { color: theme.text }]}>
                    ₹{txn.amount}
                  </Text>
                </View>

                <View
                  style={[styles.divider, { backgroundColor: theme.border }]}
                />

                <View style={styles.cardBody}>
                  <View style={styles.row}>
                    <Text style={[styles.label, { color: theme.icon }]}>
                      Order Status
                    </Text>
                    <Text
                      style={[
                        styles.value,
                        { color: "#ff3f6c", fontWeight: "bold" },
                      ]}
                    >
                      {txn.orderId?.status || "Processing"}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={[styles.label, { color: theme.icon }]}>
                      Type
                    </Text>
                    <Text style={[styles.value, { color: theme.text }]}>
                      {txn.type}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={[styles.label, { color: theme.icon }]}>
                      Mode
                    </Text>
                    <Text style={[styles.value, { color: theme.text }]}>
                      {txn.paymentMode}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={[styles.label, { color: theme.icon }]}>
                      Status
                    </Text>
                    <View style={styles.statusBadge}>
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: getStatusColor(txn.status) },
                        ]}
                      />
                      <Text
                        style={[
                          styles.status,
                          { color: getStatusColor(txn.status) },
                        ]}
                      >
                        {txn.status}
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.receiptButton}
                  onPress={() => handleReceiptDownload(txn._id)}
                >
                  <Download size={16} color="#ff3f6c" />
                  <Text style={styles.receiptText}>Download Receipt</Text>
                </TouchableOpacity>
              </View>
            );
          })}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}
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
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3e3e3e",
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
  },
  iconButton: {
    padding: 5,
  },
  menuContainer: {
    marginTop: 5,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  menuItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuText: {
    fontSize: 16,
    color: "#3e3e3e",
  },
  filterSection: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
  },
  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  activeFilter: {
    backgroundColor: "#ff3f6c",
    borderColor: "#ff3f6c",
  },
  filterText: {
    color: "#666",
    fontSize: 14,
  },
  activeFilterText: {
    color: "#fff",
    fontWeight: "bold",
  },
  dateFilterRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },
  dateFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#ff3f6c",
  },
  dateFilterText: {
    fontSize: 12,
    color: "#ff3f6c",
    fontWeight: "500",
  },
  clearFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  clearFilterText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  content: {
    flex: 1,
    padding: 15,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  txnId: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#3e3e3e",
  },
  txnDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  txnTime: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3e3e3e",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 10,
  },
  cardBody: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 14,
    color: "#666",
  },
  value: {
    fontSize: 14,
    color: "#3e3e3e",
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: "bold",
  },
  receiptButton: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ff3f6c",
    borderRadius: 5,
  },
  receiptText: {
    color: "#ff3f6c",
    fontWeight: "bold",
    fontSize: 14,
  },
});
