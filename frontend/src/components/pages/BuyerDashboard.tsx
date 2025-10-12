import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  DollarSign,
  Package,
  Download,
  Bell,
  RefreshCw,
  Calendar,
  TrendingDown,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Loader,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";
import { useWallet } from "../../hooks/useWallet";
import { useMarketplace } from "../../hooks/useMarketplace";
import { useNotifications } from "../../hooks/useNotifications";
import { useNotificationContext } from "../../contexts/NotificationContext";
import {
  downloadFile,
  getFileNameFromUri,
  extractOriginalFilename,
} from "../../utils/download";

interface BuyerStats {
  totalPurchases: number;
  totalSpent: string;
  averagePrice: string;
  purchasedProducts: any[];
  recentPurchases: any[];
}

interface PurchaseNotification {
  id: string;
  productName: string;
  seller: string;
  amount: string;
  timestamp: Date;
  read: boolean;
  downloadAvailable: boolean;
}

const BuyerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<BuyerStats | null>(null);
  const [notifications, setNotifications] = useState<PurchaseNotification[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "purchases" | "library" | "notifications"
  >("overview");

  const { account, signer } = useWallet();
  const { getPurchasedProducts, weiToBdag, isContractConnected } =
    useMarketplace(signer);
  const { getBuyerEvents } = useNotifications();
  const { addPopupNotification } = useNotificationContext();

  // Navigate to product details page
  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const loadBuyerData = useCallback(async () => {
    if (!signer || !isContractConnected || !account) return;

    setIsLoading(true);
    setError(null);
    try {
      // Get buyer's purchased products
      const purchasedProducts = await getPurchasedProducts(account);

      // Calculate statistics
      let totalSpent = 0n;
      const recentPurchases: any[] = [];

      // Get real purchase data from blockchain events
      const buyerEvents = getBuyerEvents();

      // Process real purchase events
      buyerEvents.forEach((event) => {
        totalSpent += BigInt(event.amount);

        recentPurchases.push({
          id: event.id,
          productName: event.productName,
          seller: event.seller,
          amount: event.amount,
          timestamp: event.timestamp,
          read: true, // All historical events are considered read
          downloadAvailable: true,
        });
      });

      // If no real events, fall back to purchased products (for demo purposes)
      if (buyerEvents.length === 0) {
        purchasedProducts.forEach((product: any) => {
          totalSpent += BigInt(product.price);
        });
      }

      const averagePrice =
        purchasedProducts.length > 0
          ? (totalSpent / BigInt(purchasedProducts.length)).toString()
          : "0";

      setStats({
        totalPurchases: buyerEvents.length || purchasedProducts.length,
        totalSpent: totalSpent.toString(),
        averagePrice,
        purchasedProducts,
        recentPurchases: recentPurchases.sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        ),
      });

      // Set notifications from real events
      setNotifications(
        recentPurchases.map((purchase) => ({
          ...purchase,
          id: `notification-${purchase.id}`,
        }))
      );
    } catch (error: any) {
      console.error("Failed to load buyer data:", error);
      setError(error.message || "Failed to load buyer statistics");
    } finally {
      setIsLoading(false);
    }
  }, [
    signer,
    isContractConnected,
    account,
    getPurchasedProducts,
    getBuyerEvents,
  ]);

  useEffect(() => {
    if (signer && isContractConnected && account) {
      loadBuyerData();
    }
  }, [signer, isContractConnected, account, loadBuyerData]);

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const handleDownload = async (product: any) => {
    if (!product.uri) {
      alert("No file available for download");
      return;
    }

    try {
      const originalFilename = extractOriginalFilename(product.description);
      const fileName = await getFileNameFromUri(
        product.uri,
        product.name,
        originalFilename || undefined
      );
      await downloadFile(product.uri, fileName);
    } catch (error: any) {
      console.error("Download failed:", error);
      alert(`Download failed: ${error.message}`);
    }
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

  const unreadCount = notifications.filter((n) => !n.read).length;

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
            Please connect your wallet to access your buyer dashboard.
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
                Buyer <span className="text-blue-400">Dashboard</span>
              </h1>
              <p className="text-slate-400">
                Track your purchases, downloads, and digital library
              </p>
              <div className="text-sm text-gray-400 mt-2">
                Account: {formatAddress(account)}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={loadBuyerData}
                disabled={isLoading}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
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
              {
                id: "purchases",
                label: "Purchase History",
                icon: ShoppingCart,
              },
              { id: "library", label: "Digital Library", icon: Package },
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
                    ? "bg-blue-600 text-white"
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
              <Loader className="w-8 h-8 animate-spin text-blue-400" />
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
                            Total Purchases
                          </p>
                          <p className="text-2xl font-bold text-white">
                            {stats.totalPurchases}
                          </p>
                        </div>
                        <ShoppingCart className="w-8 h-8 text-blue-400" />
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
                          <p className="text-slate-400 text-sm">Total Spent</p>
                          <p className="text-2xl font-bold text-white">
                            {parseFloat(weiToBdag(stats.totalSpent)).toFixed(4)}{" "}
                            BDAG
                          </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-red-400" />
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
                          <p className="text-slate-400 text-sm">Avg. Price</p>
                          <p className="text-2xl font-bold text-white">
                            {parseFloat(weiToBdag(stats.averagePrice)).toFixed(
                              4
                            )}{" "}
                            BDAG
                          </p>
                        </div>
                        <TrendingDown className="w-8 h-8 text-purple-400" />
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
                          <p className="text-slate-400 text-sm">
                            Library Items
                          </p>
                          <p className="text-2xl font-bold text-white">
                            {stats.purchasedProducts.length}
                          </p>
                        </div>
                        <Package className="w-8 h-8 text-green-400" />
                      </div>
                    </motion.div>
                  </div>

                  {/* Recent Purchases */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-slate-800 rounded-xl p-6 border border-slate-700"
                  >
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-400" />
                      Recent Purchases
                    </h3>
                    {stats.recentPurchases.length > 0 ? (
                      <div className="space-y-3">
                        {stats.recentPurchases.slice(0, 5).map((purchase) => (
                          <div
                            key={purchase.id}
                            className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                              <div>
                                <p className="font-medium">
                                  {purchase.productName}
                                </p>
                                <p className="text-sm text-slate-400">
                                  From {formatAddress(purchase.seller)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {parseFloat(weiToBdag(purchase.amount)).toFixed(
                                  4
                                )}{" "}
                                BDAG
                              </p>
                              <p className="text-sm text-slate-400">
                                {formatDate(purchase.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-center py-8">
                        No purchases yet. Start exploring the marketplace!
                      </p>
                    )}
                  </motion.div>
                </div>
              )}

              {/* Purchase History Tab */}
              {activeTab === "purchases" && stats && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-2xl font-semibold flex items-center gap-2">
                    <ShoppingCart className="w-6 h-6 text-blue-400" />
                    Purchase History ({stats.recentPurchases.length})
                  </h3>

                  {stats.recentPurchases.length > 0 ? (
                    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-700/50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                Product
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                Seller
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                Amount
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700">
                            {stats.recentPurchases.map((purchase) => (
                              <tr
                                key={purchase.id}
                                className="hover:bg-slate-700/30"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-white">
                                    {purchase.productName}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-slate-300">
                                    {formatAddress(purchase.seller)}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-red-400">
                                    {parseFloat(
                                      weiToBdag(purchase.amount)
                                    ).toFixed(4)}{" "}
                                    BDAG
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-slate-400">
                                    {formatDate(purchase.timestamp)}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span className="text-sm text-green-400">
                                      Completed
                                    </span>
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
                        No Purchases Yet
                      </h3>
                      <p className="text-slate-400">
                        Your purchase history will appear here once you start
                        buying products.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Digital Library Tab */}
              {activeTab === "library" && stats && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-2xl font-semibold flex items-center gap-2">
                    <Package className="w-6 h-6 text-green-400" />
                    Digital Library ({stats.purchasedProducts.length})
                  </h3>

                  {stats.purchasedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {stats.purchasedProducts.map((product) => (
                        <div
                          key={product.id}
                          className="bg-slate-800 rounded-xl p-6 border border-slate-700 cursor-pointer hover:bg-slate-750 transition-colors"
                          onClick={() => handleProductClick(product.id)}
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
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Seller:</span>
                              <span className="text-slate-300">
                                {formatAddress(product.seller)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">
                                Price Paid:
                              </span>
                              <span className="font-medium text-red-400">
                                {parseFloat(weiToBdag(product.price)).toFixed(
                                  4
                                )}{" "}
                                BDAG
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Status:</span>
                              <span className="text-green-400 font-medium">
                                Available
                              </span>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(product);
                                }}
                                className="flex-1 bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProductClick(product.id);
                                }}
                                className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm transition-colors flex items-center justify-center gap-2"
                                title="View product details"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        Empty Library
                      </h3>
                      <p className="text-slate-400">
                        Your purchased digital products will appear here for
                        easy access and downloads.
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
                    Notifications ({notifications.length})
                  </h3>

                  {notifications.length > 0 ? (
                    <div className="space-y-4">
                      {notifications.map((notification) => (
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
                                    Purchase Complete:{" "}
                                    {notification.productName}
                                  </h4>
                                  {!notification.read && (
                                    <span className="px-2 py-1 bg-yellow-600 text-xs rounded-full">
                                      New
                                    </span>
                                  )}
                                </div>
                                <p className="text-slate-400 mb-3">
                                  Your purchase from{" "}
                                  {formatAddress(notification.seller)} is ready
                                  for download
                                </p>
                                <div className="flex items-center gap-6 text-sm">
                                  <span className="text-red-400 font-medium">
                                    -
                                    {parseFloat(
                                      weiToBdag(notification.amount)
                                    ).toFixed(4)}{" "}
                                    BDAG
                                  </span>
                                  <span className="text-slate-400">
                                    {formatDate(notification.timestamp)}
                                  </span>
                                  {notification.downloadAvailable && (
                                    <span className="text-green-400 flex items-center gap-1">
                                      <Download className="w-3 h-3" />
                                      Ready to download
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
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
                              {notification.downloadAvailable && (
                                <button
                                  onClick={() => handleDownload(notification)}
                                  className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1"
                                >
                                  <Download className="w-3 h-3" />
                                  Download
                                </button>
                              )}
                            </div>
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
                        You'll receive notifications here when your purchases
                        are completed and ready for download.
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

export default BuyerDashboard;
