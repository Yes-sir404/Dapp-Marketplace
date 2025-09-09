import React, { useEffect, useState, useCallback } from "react";
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  Bell,
  RefreshCw,
  Calendar,
  BarChart3,
  AlertTriangle,
  Loader,
} from "lucide-react";
import { motion } from "framer-motion";
import { useWallet } from "../../hooks/useWallet";
import { useMarketplace } from "../../hooks/useMarketplace";
import { useNotifications } from "../../hooks/useNotifications";
import NotificationSystem from "../NotificationSystem";
import { useNotificationContext } from "../../contexts/NotificationContext";

interface SellerStats {
  totalProducts: number;
  totalSales: number;
  totalRevenue: string;
  averagePrice: string;
  products: any[];
  recentSales: any[];
}

interface SaleNotification {
  id: string;
  productName: string;
  buyer: string;
  amount: string;
  timestamp: Date;
  read: boolean;
}

const SellerDashboard: React.FC = () => {
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [localNotifications, setLocalNotifications] = useState<
    SaleNotification[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "products" | "sales" | "notifications"
  >("overview");

  const { account, signer } = useWallet();
  const { getSellerProducts, weiToBdag, isContractConnected } =
    useMarketplace(signer);
  const { notifications, getSellerEvents, markAsRead, dismissNotification } =
    useNotifications();
  const { addPopupNotification } = useNotificationContext();

  const loadSellerData = useCallback(async () => {
    if (!signer || !isContractConnected || !account) return;

    setIsLoading(true);
    setError(null);
    try {
      // Get seller's products
      const products = await getSellerProducts(account);

      // Get real sales data from blockchain events
      const sellerEvents = getSellerEvents();
      const recentSales: any[] = [];

      // Calculate statistics from real events
      let totalSales = sellerEvents.length;
      let totalRevenue = 0n;

      // Process real sales events
      sellerEvents.forEach((event) => {
        totalRevenue += BigInt(event.amount);

        recentSales.push({
          id: event.id,
          productName: event.productName,
          buyer: event.buyer,
          amount: event.amount,
          timestamp: event.timestamp,
          read: true, // All historical events are considered read
        });
      });

      // If no real events, fall back to product sales count (for demo purposes)
      if (totalSales === 0) {
        products.forEach((product: any) => {
          const salesCount = parseInt(product.salesCount);
          totalSales += salesCount;
          totalRevenue += BigInt(product.price) * BigInt(salesCount);
        });
      }

      const averagePrice =
        products.length > 0
          ? (totalRevenue / BigInt(products.length)).toString()
          : "0";

      setStats({
        totalProducts: products.length,
        totalSales,
        totalRevenue: totalRevenue.toString(),
        averagePrice,
        products,
        recentSales: recentSales.sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        ),
      });

      // Set local notifications from real events
      setLocalNotifications(
        recentSales.map((sale) => ({
          ...sale,
          id: `notification-${sale.id}`,
        }))
      );
    } catch (error: any) {
      console.error("Failed to load seller data:", error);
      setError(error.message || "Failed to load seller statistics");
    } finally {
      setIsLoading(false);
    }
  }, [
    signer,
    isContractConnected,
    account,
    getSellerProducts,
    getSellerEvents,
  ]);

  useEffect(() => {
    if (signer && isContractConnected && account) {
      loadSellerData();
    }
  }, [signer, isContractConnected, account, loadSellerData]);

  const markNotificationAsRead = (notificationId: string) => {
    setLocalNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const formatAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const unreadCount = localNotifications.filter((n) => !n.read).length;

  // Not connected
  if (!account || !isContractConnected) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center max-w-md"
        >
          <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
          <p className="text-slate-400">
            Please connect your wallet to access your seller dashboard.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="px-6 py-8 border-b border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Seller <span className="text-green-400">Dashboard</span>
              </h1>
              <p className="text-slate-400">
                Track your sales, revenue, and product performance
              </p>
              <div className="text-sm text-gray-400 mt-2">
                Account: {formatAddress(account)}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <NotificationSystem
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onDismiss={dismissNotification}
              />
              <button
                onClick={loadSellerData}
                disabled={isLoading}
                className="px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <button
                onClick={() => {
                  addPopupNotification({
                    type: "success",
                    title: "Test Notification",
                    message: "This is a test popup notification!",
                    duration: 5000,
                  });
                }}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                Test Popup
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="px-6 py-4 border-b border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-8">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "products", label: "Products", icon: Package },
              { id: "sales", label: "Sales History", icon: ShoppingCart },
              {
                id: "notifications",
                label: `Notifications ${
                  unreadCount > 0 ? `(${unreadCount})` : ""
                }`,
                icon: Bell,
              },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === id
                    ? "bg-green-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-300 p-4 rounded-xl mb-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Error</span>
              </div>
              <p className="mt-1">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-green-400" />
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === "overview" && stats && (
                <div className="space-y-8">
                  {/* Statistics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-800 rounded-xl p-6 border border-slate-700"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">
                            Total Products
                          </p>
                          <p className="text-2xl font-bold text-white">
                            {stats.totalProducts}
                          </p>
                        </div>
                        <Package className="w-8 h-8 text-blue-400" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-slate-800 rounded-xl p-6 border border-slate-700"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">Total Sales</p>
                          <p className="text-2xl font-bold text-white">
                            {stats.totalSales}
                          </p>
                        </div>
                        <ShoppingCart className="w-8 h-8 text-green-400" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-slate-800 rounded-xl p-6 border border-slate-700"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">
                            Total Revenue
                          </p>
                          <p className="text-2xl font-bold text-white">
                            {parseFloat(weiToBdag(stats.totalRevenue)).toFixed(
                              4
                            )}{" "}
                            BDAG
                          </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-yellow-400" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-slate-800 rounded-xl p-6 border border-slate-700"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">Avg. Price</p>
                          <p className="text-2xl font-bold text-white">
                            {parseFloat(weiToBdag(stats.averagePrice)).toFixed(
                              4
                            )}{" "}
                            BDAG
                          </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-purple-400" />
                      </div>
                    </motion.div>
                  </div>

                  {/* Recent Activity */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-slate-800 rounded-xl p-6 border border-slate-700"
                  >
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-green-400" />
                      Recent Sales Activity
                    </h3>
                    {stats.recentSales.length > 0 ? (
                      <div className="space-y-3">
                        {stats.recentSales.slice(0, 5).map((sale) => (
                          <div
                            key={sale.id}
                            className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <div>
                                <p className="font-medium">
                                  {sale.productName}
                                </p>
                                <p className="text-sm text-slate-400">
                                  Sold to {formatAddress(sale.buyer)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {parseFloat(weiToBdag(sale.amount)).toFixed(4)}{" "}
                                BDAG
                              </p>
                              <p className="text-sm text-slate-400">
                                {formatDate(sale.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-center py-8">
                        No sales activity yet. Start promoting your products!
                      </p>
                    )}
                  </motion.div>
                </div>
              )}

              {/* Products Tab */}
              {activeTab === "products" && stats && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-2xl font-semibold flex items-center gap-2">
                    <Package className="w-6 h-6 text-blue-400" />
                    Your Products ({stats.products.length})
                  </h3>

                  {stats.products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {stats.products.map((product) => (
                        <div
                          key={product.id}
                          className="bg-slate-800 rounded-xl p-6 border border-slate-700"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="font-semibold text-lg">
                              {product.name}
                            </h4>
                            <span className="text-sm text-slate-400">
                              #{product.id}
                            </span>
                          </div>
                          <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Price:</span>
                              <span className="font-medium">
                                {parseFloat(weiToBdag(product.price)).toFixed(
                                  4
                                )}{" "}
                                BDAG
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Sales:</span>
                              <span className="font-medium text-green-400">
                                {product.salesCount}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Revenue:</span>
                              <span className="font-medium text-yellow-400">
                                {parseFloat(
                                  weiToBdag(
                                    (
                                      BigInt(product.price) *
                                      BigInt(product.salesCount)
                                    ).toString()
                                  )
                                ).toFixed(4)}{" "}
                                BDAG
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        No Products Yet
                      </h3>
                      <p className="text-slate-400">
                        Start by creating your first digital product to begin
                        selling.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Sales History Tab */}
              {activeTab === "sales" && stats && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-2xl font-semibold flex items-center gap-2">
                    <ShoppingCart className="w-6 h-6 text-green-400" />
                    Sales History ({stats.recentSales.length})
                  </h3>

                  {stats.recentSales.length > 0 ? (
                    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-700/50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                Product
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                Buyer
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                Amount
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                Date
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700">
                            {stats.recentSales.map((sale) => (
                              <tr
                                key={sale.id}
                                className="hover:bg-slate-700/30"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-white">
                                    {sale.productName}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-slate-300">
                                    {formatAddress(sale.buyer)}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-green-400">
                                    {parseFloat(weiToBdag(sale.amount)).toFixed(
                                      4
                                    )}{" "}
                                    BDAG
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-slate-400">
                                    {formatDate(sale.timestamp)}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ShoppingCart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        No Sales Yet
                      </h3>
                      <p className="text-slate-400">
                        Your sales history will appear here once customers start
                        purchasing your products.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-2xl font-semibold flex items-center gap-2">
                    <Bell className="w-6 h-6 text-yellow-400" />
                    Notifications ({localNotifications.length})
                  </h3>

                  {localNotifications.length > 0 ? (
                    <div className="space-y-4">
                      {localNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`bg-slate-800 rounded-xl p-6 border border-slate-700 transition-colors ${
                            !notification.read
                              ? "border-yellow-500/50 bg-yellow-900/10"
                              : ""
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <div
                                className={`w-3 h-3 rounded-full mt-2 ${
                                  !notification.read
                                    ? "bg-yellow-400"
                                    : "bg-green-400"
                                }`}
                              ></div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-lg">
                                    New Sale: {notification.productName}
                                  </h4>
                                  {!notification.read && (
                                    <span className="px-2 py-1 bg-yellow-600 text-xs rounded-full">
                                      New
                                    </span>
                                  )}
                                </div>
                                <p className="text-slate-400 mb-3">
                                  Your product was purchased by{" "}
                                  {formatAddress(notification.buyer)}
                                </p>
                                <div className="flex items-center gap-6 text-sm">
                                  <span className="text-green-400 font-medium">
                                    +
                                    {parseFloat(
                                      weiToBdag(notification.amount)
                                    ).toFixed(4)}{" "}
                                    BDAG
                                  </span>
                                  <span className="text-slate-400">
                                    {formatDate(notification.timestamp)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {!notification.read && (
                              <button
                                onClick={() =>
                                  markNotificationAsRead(notification.id)
                                }
                                className="text-yellow-400 hover:text-yellow-300 text-sm"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        No Notifications
                      </h3>
                      <p className="text-slate-400">
                        You'll receive notifications here when customers
                        purchase your products.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default SellerDashboard;
