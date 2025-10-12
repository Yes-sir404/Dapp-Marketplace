import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Download,
  CheckCircle,
  AlertCircle,
  Loader,
  User,
  Tag,
  Package,
  DollarSign,
  Eye,
  Share2,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";
import { useWallet } from "../../hooks/useWallet";
import { useMarketplace } from "../../hooks/useMarketplace";
import { useNotificationContext } from "../../contexts/NotificationContext";
import {
  downloadFile,
  getFileNameFromUri,
  extractOriginalFilename,
} from "../../utils/download";
import IpfsImage from "../IpfsImage";

interface Product {
  id: string;
  name: string;
  description: string;
  category?: string;
  uri?: string;
  thumbnailUri?: string;
  price: string;
  seller: string;
  salesCount: string;
}

const ProductDetails: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<{
    status: "idle" | "pending" | "success" | "error";
    message: string;
  }>({
    status: "idle",
    message: "",
  });
  const [hasPurchased, setHasPurchased] = useState(false);
  // Wallet and contract hooks
  const { account, signer, connectWallet, isConnecting } = useWallet();
  const {
    getProduct,
    purchaseProduct,
    hasUserPurchased: checkUserPurchase,
    isLoading: contractLoading,
    weiToBdag,
  } = useMarketplace(signer);
  const { addPopupNotification } = useNotificationContext();

  // Helper function to handle pause errors
  const handlePauseError = (error: string) => {
    if (
      error.includes("marketplace is currently paused") ||
      error.includes("maintenance")
    ) {
      addPopupNotification({
        type: "warning",
        title: "Marketplace Temporarily Unavailable",
        message: error,
        duration: 8000,
      });
      return true;
    }
    return false;
  };

  // Load product details
  const loadProduct = useCallback(async () => {
    if (!productId) {
      setError("Product ID not found");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const productData = await getProduct(productId);
      if (productData) {
        setProduct(productData);
      } else {
        setError("Product not found");
      }
    } catch (err: any) {
      console.error("Error loading product:", err);
      setError("Failed to load product details");
    } finally {
      setIsLoading(false);
    }
  }, [productId, getProduct]);

  // Check if user has purchased this product
  const checkPurchaseStatus = useCallback(async () => {
    if (!account || !productId) return;

    try {
      const purchased = await checkUserPurchase(productId, account);
      setHasPurchased(purchased);
    } catch (err) {
      console.error("Error checking purchase status:", err);
    }
  }, [account, productId, checkUserPurchase]);

  // Load product and check purchase status on mount
  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  useEffect(() => {
    checkPurchaseStatus();
  }, [checkPurchaseStatus]);

  // Handle product purchase
  const handlePurchase = async () => {
    if (!account) {
      addPopupNotification({
        type: "warning",
        title: "Wallet Required",
        message: "Please connect your wallet to purchase this product",
        duration: 5000,
      });
      return;
    }

    if (!product) return;

    try {
      setPurchaseStatus({
        status: "pending",
        message: "Processing purchase...",
      });

      const priceInWei = BigInt(product.price);
      const result = await purchaseProduct(product.id, priceInWei);

      if (result.success) {
        setPurchaseStatus({
          status: "success",
          message: "Purchase successful! You can now download the product.",
        });
        setHasPurchased(true);
        addPopupNotification({
          type: "success",
          title: "Purchase Successful!",
          message: `You have successfully purchased ${product.name}`,
          duration: 5000,
        });
      } else {
        const errorMsg = result.error || "Purchase failed";
        if (!handlePauseError(errorMsg)) {
          setPurchaseStatus({ status: "error", message: errorMsg });
          addPopupNotification({
            type: "error",
            title: "Purchase Failed",
            message: errorMsg,
            duration: 5000,
          });
        }
      }
    } catch (err: any) {
      console.error("Purchase error:", err);
      const errorMsg = err.message || "Purchase failed";
      if (!handlePauseError(errorMsg)) {
        setPurchaseStatus({ status: "error", message: errorMsg });
        addPopupNotification({
          type: "error",
          title: "Purchase Failed",
          message: errorMsg,
          duration: 5000,
        });
      }
    }
  };

  // Handle download
  const handleDownload = async () => {
    if (!product?.uri) {
      addPopupNotification({
        type: "error",
        title: "Download Failed",
        message: "No download link available for this product",
        duration: 5000,
      });
      return;
    }

    try {
      console.log("🔄 Starting download for product:", product.name);
      console.log("📁 Product URI:", product.uri);

      const originalFilename = extractOriginalFilename(product.description);
      const fileName = await getFileNameFromUri(
        product.uri,
        product.name,
        originalFilename || undefined
      );
      console.log("📄 Generated filename:", fileName);

      await downloadFile(product.uri, fileName);

      addPopupNotification({
        type: "success",
        title: "Download Started",
        message: `Downloading ${fileName}`,
        duration: 3000,
      });
    } catch (err: any) {
      console.error("Download error:", err);

      let errorMessage = "Failed to download the product";

      if (err.message) {
        if (err.message.includes("All IPFS gateways failed")) {
          errorMessage = "Unable to access the file. Please try again later.";
        } else if (err.message.includes("Invalid URI format")) {
          errorMessage = "Invalid file link. Please contact the seller.";
        } else if (err.message.includes("Downloaded file is empty")) {
          errorMessage =
            "The file appears to be empty. Please contact the seller.";
        } else if (err.message.includes("No URI provided")) {
          errorMessage = "No download link available for this product.";
        } else {
          errorMessage = err.message;
        }
      }

      addPopupNotification({
        type: "error",
        title: "Download Failed",
        message: errorMessage,
        duration: 8000,
      });
    }
  };

  // Handle share
  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.share({
        title: product?.name || "Digital Product",
        text: product?.description || "Check out this digital product",
        url: url,
      });
    } catch (err) {
      // Fallback to clipboard
      navigator.clipboard.writeText(url);
      addPopupNotification({
        type: "info",
        title: "Link Copied",
        message: "Product link copied to clipboard",
        duration: 3000,
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-white">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h1 className="text-2xl font-bold text-white mb-2">
            Product Not Found
          </h1>
          <p className="text-gray-300 mb-6">
            {error || "The product you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => navigate("/digital-marketplace")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const priceInBdag = weiToBdag(product.price);
  const isOwner = account?.toLowerCase() === product.seller.toLowerCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 bg-dot-pattern"></div>

      {/* Subtle Grid Lines */}
      <div className="absolute inset-0 opacity-10 bg-grid-pattern"></div>

      {/* Header */}
      <div className="bg-white/5 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </motion.button>

            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
                className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
                title="Share product"
              >
                <Share2 className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
          {/* Product Image */}
          <div className="space-y-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="aspect-square bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl group"
            >
              {product.thumbnailUri ? (
                <IpfsImage
                  src={product.thumbnailUri}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onLoad={() => {
                    console.log(
                      "✅ Product image loaded successfully:",
                      product.thumbnailUri
                    );
                  }}
                  onError={() => {
                    console.warn(
                      "❌ All gateways failed for product image:",
                      product.thumbnailUri
                    );
                  }}
                  fallbackComponent={
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        transition={{ duration: 0.3 }}
                        className="w-32 h-32 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/20"
                      >
                        <Package className="w-16 h-16 text-white/60" />
                      </motion.div>
                    </div>
                  }
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ duration: 0.3 }}
                    className="w-32 h-32 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/20"
                  >
                    <Package className="w-16 h-16 text-white/60" />
                  </motion.div>
                </div>
              )}
            </motion.div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-6">
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
                className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl"
              >
                <div className="flex items-center gap-3 text-gray-300 mb-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Eye className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-sm font-medium">Sales</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {product.salesCount}
                </p>
              </motion.div>
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
                className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl"
              >
                <div className="flex items-center gap-3 text-gray-300 mb-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Tag className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="text-sm font-medium">Category</span>
                </div>
                <p className="text-lg font-semibold text-white">
                  {product.category || "Uncategorized"}
                </p>
              </motion.div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Title and Price */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {product.name}
                </span>
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <span className="text-4xl font-bold text-white">
                      {priceInBdag} BDAG
                    </span>
                    <p className="text-gray-400 text-sm">Current Price</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-xl"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Package className="w-4 h-4 text-blue-400" />
                </div>
                Description
              </h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
                {product.description}
              </p>
            </motion.div>

            {/* Seller Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-xl"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-purple-400" />
                </div>
                Seller Information
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">
                    {product.seller.slice(0, 6)}...{product.seller.slice(-4)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <p className="text-green-400 text-sm font-medium">
                      Verified Seller
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Purchase Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-xl"
            >
              {isOwner ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-gray-300 text-lg mb-6">
                    This is your product
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/seller-dashboard")}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                  >
                    Manage Product
                  </motion.button>
                </div>
              ) : hasPurchased ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="flex items-center justify-center gap-3 text-green-400 mb-6">
                    <CheckCircle className="w-6 h-6" />
                    <span className="font-bold text-xl">
                      You own this product
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownload}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-green-500/25"
                  >
                    <Download className="w-6 h-6" />
                    Download Now
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="w-8 h-8 text-green-400" />
                    </div>
                    <p className="text-gray-300 text-lg mb-2">Current Price</p>
                    <p className="text-3xl font-bold text-white">
                      {priceInBdag} BDAG
                    </p>
                  </div>

                  {purchaseStatus.status === "pending" && (
                    <div className="flex items-center justify-center gap-3 text-blue-400 bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-4">
                      <Loader className="w-6 h-6 animate-spin" />
                      <span className="font-medium">
                        {purchaseStatus.message}
                      </span>
                    </div>
                  )}

                  {purchaseStatus.status === "error" && (
                    <div className="flex items-center justify-center gap-3 text-red-400 bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-4">
                      <AlertCircle className="w-6 h-6" />
                      <span className="font-medium">
                        {purchaseStatus.message}
                      </span>
                    </div>
                  )}

                  {purchaseStatus.status === "success" && (
                    <div className="flex items-center justify-center gap-3 text-green-400 bg-green-500/10 backdrop-blur-xl border border-green-500/20 rounded-2xl p-4">
                      <CheckCircle className="w-6 h-6" />
                      <span className="font-medium">
                        {purchaseStatus.message}
                      </span>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePurchase}
                    disabled={
                      !account ||
                      purchaseStatus.status === "pending" ||
                      contractLoading
                    }
                    className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:via-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl hover:shadow-blue-500/25 relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {!account ? (
                        <>
                          <Wallet className="w-6 h-6" />
                          Connect Wallet to Purchase
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-6 h-6" />
                          Purchase Now
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  </motion.button>

                  {!account && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={connectWallet}
                      disabled={isConnecting}
                      className="w-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 disabled:bg-white/5 text-white py-3 rounded-2xl font-semibold transition-all duration-300"
                    >
                      {isConnecting ? "Connecting..." : "Connect Wallet"}
                    </motion.button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetails;
