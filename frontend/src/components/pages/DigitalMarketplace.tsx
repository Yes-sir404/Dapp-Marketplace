// frontend/src/components/marketplace/DigitalMarketplace.tsx

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Wallet,
  Loader,
  RefreshCw,
  AlertCircle,
  Package,
  Download,
  CheckCircle,
  Eye,
  ArrowLeft,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import { useWallet } from "../../hooks/useWallet";
import { useMarketplace } from "../../hooks/useMarketplace";
import { useNotificationContext } from "../../contexts/NotificationContext";
import { formatEther } from "ethers";
import {
  downloadFile,
  getFileNameFromUri,
  extractOriginalFilename,
} from "../../utils/download";
import IpfsImage from "../IpfsImage";
import { testFailingUrl, testMultipleUrls } from "../../utils/ipfsTest";
import FileUploadInterface from "../FileUploadInterface";
import ThumbnailUpload from "../ThumbnailUpload";
import { uploadFileToPinata } from "../../services/pinata";

interface Product {
  id: string;
  name: string;
  description: string;
  category?: string;
  uri?: string; // IPFS URI for product content
  thumbnailUri?: string; // IPFS URI for product thumbnail
  price: string; // in wei
  seller: string;
  salesCount: string;
}

const DigitalMarketplace: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showMyPurchases, setShowMyPurchases] = useState(false);
  const [showMyListings, setShowMyListings] = useState(false);
  const [purchasedProductIds, setPurchasedProductIds] = useState<Set<string>>(
    new Set()
  );
  const [purchaseStatus, setPurchaseStatus] = useState<{
    productId: string | null;
    status: "idle" | "pending" | "success" | "error";
    message: string;
  }>({
    productId: null,
    status: "idle",
    message: "",
  });
  const [editProduct, setEditProduct] = useState<{
    id: string;
    name: string;
    description: string;
    category: string;
    price: string;
    uri: string;
    thumbnailUri: string;
    newProductFile: File | null;
    newThumbnailFile: File | null;
  } | null>(null);

  // Wallet and contract hooks
  const { account, signer, connectWallet, isConnecting } = useWallet();
  const {
    getAvailableProducts,
    getProductsByCategory,
    purchaseProduct,
    updateProduct,
    updateProductMedia,
    isLoading,
    error: contractError,
    weiToBdag,
    isContractConnected,
    contractAddress,
    getPurchasedProducts,
    getSellerProducts,
    hasUserPurchased,
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

  // Navigate to product details page
  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  // Load products from blockchain
  const loadProducts = useCallback(async () => {
    if (!signer || !isContractConnected) {
      setProducts([]);
      return;
    }

    setLoadError(null);
    try {
      console.log("🔄 Loading products from contract:", contractAddress);
      let blockchainProducts;

      // Use indexed category query if a specific category is selected
      if (selectedCategory !== "All") {
        blockchainProducts = await getProductsByCategory(selectedCategory);
        console.log(
          `✅ Loaded ${blockchainProducts.length} products in category: ${selectedCategory}`
        );
      } else {
        blockchainProducts = await getAvailableProducts();
        console.log("✅ Loaded all products:", blockchainProducts.length);
      }

      setProducts(blockchainProducts);
    } catch (error: any) {
      console.error("❌ Failed to load products:", error);
      setLoadError(error.message || "Failed to load products from blockchain");
      setProducts([]);
    }
  }, [
    signer,
    isContractConnected,
    getAvailableProducts,
    getProductsByCategory,
    selectedCategory,
    contractAddress,
  ]);

  const loadMyPurchases = useCallback(async () => {
    if (!signer || !isContractConnected || !account) {
      setProducts([]);
      return;
    }
    setLoadError(null);
    try {
      console.log("🔄 Loading my purchases for:", account);
      const myProducts = await getPurchasedProducts(account);
      setProducts(myProducts);
      console.log("✅ Loaded my purchases:", myProducts.length);
    } catch (error: any) {
      console.error("❌ Failed to load my purchases:", error);
      setLoadError(error.message || "Failed to load purchased products");
      setProducts([]);
    }
  }, [signer, isContractConnected, account, getPurchasedProducts]);

  const loadMyListings = useCallback(async () => {
    if (!signer || !isContractConnected || !account) {
      setProducts([]);
      return;
    }
    setLoadError(null);
    try {
      console.log("🔄 Loading my listings for:", account);
      const myProducts = await getSellerProducts(account);
      setProducts(myProducts);
      console.log("✅ Loaded my listings:", myProducts.length);
    } catch (error: any) {
      console.error("❌ Failed to load my listings:", error);
      setLoadError(error.message || "Failed to load listed products");
      setProducts([]);
    }
  }, [signer, isContractConnected, account, getSellerProducts]);

  const checkPurchaseStatus = useCallback(
    async (products: Product[]) => {
      if (!account || !signer || !isContractConnected) return;

      try {
        const purchasedIds = new Set<string>();
        for (const product of products) {
          const hasPurchased = await hasUserPurchased(product.id, account);
          if (hasPurchased) {
            purchasedIds.add(product.id);
          }
        }
        setPurchasedProductIds(purchasedIds);
      } catch (error) {
        console.error("Error checking purchase status:", error);
      }
    },
    [account, signer, isContractConnected, hasUserPurchased]
  );

  // Trigger load when signer/contract ready
  useEffect(() => {
    if (signer && isContractConnected) {
      if (showMyPurchases) {
        loadMyPurchases();
      } else if (showMyListings) {
        loadMyListings();
      } else {
        loadProducts();
      }
    } else {
      setProducts([]);
      setLoadError(null);
    }
  }, [
    signer,
    isContractConnected,
    loadProducts,
    loadMyPurchases,
    loadMyListings,
    showMyPurchases,
    showMyListings,
  ]);

  // Check purchase status when products change
  useEffect(() => {
    if (products.length > 0 && !showMyPurchases) {
      checkPurchaseStatus(products);
    }
  }, [products, showMyPurchases, checkPurchaseStatus]);

  // Test IPFS URL function (available in console)
  useEffect(() => {
    // Make test functions available globally for debugging
    (window as any).testIpfsUrl = testFailingUrl;
    (window as any).testMultipleIpfsUrls = testMultipleUrls;
    console.log("🧪 IPFS test functions available:");
    console.log("  - window.testIpfsUrl() - Test single failing URL");
    console.log(
      "  - window.testMultipleIpfsUrls() - Test multiple failing URLs"
    );
  }, []);

  // Filter products based on search and category, and hide own/purchased by default
  useEffect(() => {
    const q = searchQuery.toLowerCase();
    const filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q);

      // Prefer on-chain category if available; fallback to legacy encoded description
      let productCategory = product.category || "Digital Art";
      if (!product.category) {
        const match = product.description.match(/^cat:(.*?)\|(.*)$/);
        productCategory = match ? match[1] : "Digital Art";
      }

      const matchesCategory =
        selectedCategory === "All" || selectedCategory === productCategory;

      // By default (marketplace view), hide user's own listings and already purchased items
      if (!showMyPurchases && !showMyListings && account) {
        const isOwnListing =
          product.seller.toLowerCase() === account.toLowerCase();
        const isPurchased = purchasedProductIds.has(product.id);
        if (isOwnListing || isPurchased) return false;
      }

      return matchesSearch && matchesCategory;
    });

    setFilteredProducts(filtered);
  }, [
    products,
    searchQuery,
    selectedCategory,
    showMyPurchases,
    showMyListings,
    account,
    purchasedProductIds,
  ]);

  const handleEditProduct = (product: Product) => {
    setEditProduct({
      id: product.id,
      name: product.name,
      description: product.description,
      category:
        product.category ||
        product.description.match(/^cat:(.*?)\|(.*)$/)?.[1] ||
        "Digital Art",
      price: weiToBdag(product.price),
      uri: product.uri || "",
      thumbnailUri: product.thumbnailUri || "",
      newProductFile: null,
      newThumbnailFile: null,
    });
  };

  const handleEditProductInPage = (productId: string) => {
    navigate(`/edit-product/${productId}`);
  };

  const handleUpdateProduct = async () => {
    if (!editProduct) return;

    setPurchaseStatus({
      productId: editProduct.id,
      status: "pending",
      message: "Updating product...",
    });

    try {
      const result = await updateProduct(
        editProduct.id,
        editProduct.name,
        editProduct.description,
        editProduct.category,
        editProduct.price
      );

      if (result.success) {
        setPurchaseStatus({
          productId: editProduct.id,
          status: "success",
          message: `Product updated successfully! Tx: ${result.transactionHash?.slice(
            0,
            10
          )}...`,
        });

        setEditProduct(null);
        setTimeout(() => {
          if (showMyListings) {
            loadMyListings();
          } else {
            loadProducts();
          }
        }, 1000);
        setTimeout(
          () =>
            setPurchaseStatus({ productId: null, status: "idle", message: "" }),
          5000
        );
      } else {
        // Check if it's a pause error and handle it with popup
        if (handlePauseError(result.error || "")) {
          setPurchaseStatus({
            productId: editProduct.id,
            status: "idle",
            message: "",
          });
        } else {
          setPurchaseStatus({
            productId: editProduct.id,
            status: "error",
            message: result.error || "Update failed",
          });
        }
      }
    } catch (error: any) {
      console.error("❌ Update error:", error);

      // Check if it's a pause error and handle it with popup
      const errorMessage = error.message || "An unexpected error occurred";
      if (handlePauseError(errorMessage)) {
        setPurchaseStatus({
          productId: editProduct.id,
          status: "idle",
          message: "",
        });
      } else {
        setPurchaseStatus({
          productId: editProduct.id,
          status: "error",
          message: errorMessage,
        });
      }
    }
  };

  const handleUpdateProductMedia = async () => {
    if (!editProduct) return;

    setPurchaseStatus({
      productId: editProduct.id,
      status: "pending",
      message: "Uploading files and updating product media...",
    });

    try {
      let productUri = editProduct.uri;
      let thumbnailUri = editProduct.thumbnailUri;

      // Upload new product file if provided
      if (editProduct.newProductFile) {
        setPurchaseStatus({
          productId: editProduct.id,
          status: "pending",
          message: "Uploading product file to IPFS...",
        });
        const productUpload = await uploadFileToPinata(
          editProduct.newProductFile
        );
        productUri = productUpload.uri;
      }

      // Upload new thumbnail if provided
      if (editProduct.newThumbnailFile) {
        setPurchaseStatus({
          productId: editProduct.id,
          status: "pending",
          message: "Uploading thumbnail to IPFS...",
        });
        const thumbnailUpload = await uploadFileToPinata(
          editProduct.newThumbnailFile
        );
        thumbnailUri = thumbnailUpload.uri;
      }

      // Update the product media on blockchain
      setPurchaseStatus({
        productId: editProduct.id,
        status: "pending",
        message: "Updating product media on blockchain...",
      });

      const result = await updateProductMedia(
        editProduct.id,
        productUri,
        thumbnailUri
      );

      if (result.success) {
        setPurchaseStatus({
          productId: editProduct.id,
          status: "success",
          message: `Product media updated successfully! Tx: ${result.transactionHash?.slice(
            0,
            10
          )}...`,
        });

        setEditProduct(null);
        setTimeout(() => {
          if (showMyListings) {
            loadMyListings();
          } else {
            loadProducts();
          }
        }, 1000);
        setTimeout(
          () =>
            setPurchaseStatus({ productId: null, status: "idle", message: "" }),
          5000
        );
      } else {
        // Check if it's a pause error and handle it with popup
        if (handlePauseError(result.error || "")) {
          setPurchaseStatus({
            productId: editProduct.id,
            status: "idle",
            message: "",
          });
        } else {
          setPurchaseStatus({
            productId: editProduct.id,
            status: "error",
            message: result.error || "Media update failed",
          });
        }
      }
    } catch (error: any) {
      console.error("❌ Media update error:", error);

      // Check if it's a pause error and handle it with popup
      const errorMessage = error.message || "An unexpected error occurred";
      if (handlePauseError(errorMessage)) {
        setPurchaseStatus({
          productId: editProduct.id,
          status: "idle",
          message: "",
        });
      } else {
        setPurchaseStatus({
          productId: editProduct.id,
          status: "error",
          message: errorMessage,
        });
      }
    }
  };

  const handleDownload = async (product: Product) => {
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

  // Purchase
  const handlePurchase = async (product: Product) => {
    if (!account || !signer || !isContractConnected) {
      setPurchaseStatus({
        productId: product.id,
        status: "error",
        message: "Wallet not connected or contract unavailable",
      });
      return;
    }

    if (product.seller.toLowerCase() === account.toLowerCase()) {
      setPurchaseStatus({
        productId: product.id,
        status: "error",
        message: "You cannot buy your own product",
      });
      return;
    }

    setPurchaseStatus({
      productId: product.id,
      status: "pending",
      message: "Preparing transaction...",
    });

    try {
      // PRODUCT PRICE MUST BE BIGINT (from contract)
      const priceInWei = BigInt(product.price);

      console.log("🛒 Initiating purchase:", {
        productId: product.id,
        priceInWei: priceInWei.toString(),
        priceInBdag: formatEther(priceInWei),
      });

      // SEND BIGINT TO HOOK
      const result = await purchaseProduct(product.id, priceInWei);

      if (result.success) {
        setPurchaseStatus({
          productId: product.id,
          status: "pending",
          message: "Purchase successful! Downloading your file...",
        });

        // Auto-download the file after successful purchase
        try {
          if (product.uri) {
            console.log("🔄 Auto-downloading purchased file...");
            const originalFilename = extractOriginalFilename(
              product.description
            );
            const fileName = await getFileNameFromUri(
              product.uri,
              product.name,
              originalFilename || undefined
            );
            await downloadFile(product.uri, fileName);
            console.log("✅ Auto-download completed");

            setPurchaseStatus({
              productId: product.id,
              status: "success",
              message: `Purchase successful! File downloaded. Tx: ${result.transactionHash?.slice(
                0,
                10
              )}...`,
            });
          } else {
            setPurchaseStatus({
              productId: product.id,
              status: "success",
              message: `Purchase successful! No file available for download. Tx: ${result.transactionHash?.slice(
                0,
                10
              )}...`,
            });
          }
        } catch (downloadError: any) {
          console.error("❌ Auto-download failed:", downloadError);
          setPurchaseStatus({
            productId: product.id,
            status: "success",
            message: `Purchase successful! Download failed: ${
              downloadError.message
            }. Tx: ${result.transactionHash?.slice(0, 10)}...`,
          });
        }

        setTimeout(() => {
          if (showMyPurchases) {
            loadMyPurchases();
          } else {
            loadProducts();
          }
        }, 1000);
        setTimeout(
          () =>
            setPurchaseStatus({ productId: null, status: "idle", message: "" }),
          5000
        );
      } else {
        // Check if it's a pause error and handle it with popup
        if (handlePauseError(result.error || "")) {
          setPurchaseStatus({
            productId: product.id,
            status: "idle",
            message: "",
          });
        } else {
          setPurchaseStatus({
            productId: product.id,
            status: "error",
            message: result.error || "Purchase failed",
          });
        }
      }
    } catch (error: any) {
      console.error("❌ Purchase error:", error);

      // Check if it's a pause error and handle it with popup
      const errorMessage = error.message || "An unexpected error occurred";
      if (handlePauseError(errorMessage)) {
        setPurchaseStatus({
          productId: product.id,
          status: "idle",
          message: "",
        });
      } else {
        setPurchaseStatus({
          productId: product.id,
          status: "error",
          message: errorMessage,
        });
      }
    }
  };

  const categories = [
    "All",
    "Digital Art",
    "Music",
    "Photography",
    "Software",
    "Video",
    "Template",
    "Course",
  ];

  const formatAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const getGradient = (id: string) => {
    const gradients = [
      "from-purple-500 to-blue-600",
      "from-blue-500 to-teal-600",
      "from-teal-500 to-cyan-600",
      "from-purple-600 to-pink-600",
      "from-indigo-600 to-purple-700",
      "from-green-500 to-blue-600",
    ];
    const index = parseInt(id) % gradients.length;
    return gradients[index];
  };

  const getEmoji = (id: string) => {
    const emojis = ["🎨", "🎵", "🏙️", "🎯", "📸", "💻"];
    const index = parseInt(id) % emojis.length;
    return emojis[index];
  };

  // Wallet connection screen
  if (!account) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center max-w-md"
        >
          <Wallet className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-slate-400 mb-6">
            Connect your wallet to browse and purchase digital assets
          </p>
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50"
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>
        </motion.div>
      </div>
    );
  }

  // Contract connection status
  if (!isContractConnected) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center max-w-md"
        >
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Contract Not Available
          </h2>
          <p className="text-slate-400 mb-4">
            Unable to connect to the marketplace contract.
          </p>
          <p className="text-xs text-slate-500 mb-6">
            Contract: {contractAddress}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
          >
            Refresh Page
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 bg-dot-pattern"></div>

      {/* Subtle Grid Lines */}
      <div className="absolute inset-0 opacity-10 bg-grid-pattern"></div>
      {/* Header */}
      <header className="px-6 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Digital <span className="text-purple-400">Marketplace</span>
            </h1>
            <p className="text-slate-400">
              Discover and purchase amazing digital assets from talented
              creators worldwide.
            </p>
            <div className="text-sm text-gray-400 mt-2">
              Connected: {formatAddress(account)}
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/buyer-dashboard")}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-2xl transition-all duration-300 shadow-lg"
              >
                <BarChart3 className="w-5 h-5" />
                Dashboard
              </motion.button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search digital assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 text-white placeholder-gray-400 transition-all duration-300"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                // Trigger reload when category changes to use indexed query
                if (
                  signer &&
                  isContractConnected &&
                  !showMyPurchases &&
                  !showMyListings
                ) {
                  setTimeout(() => loadProducts(), 100);
                }
              }}
              className="px-4 py-3 bg-slate-800/80 backdrop-blur-xl border border-slate-600/50 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 text-white transition-all duration-300"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (showMyPurchases) {
                  loadMyPurchases();
                } else if (showMyListings) {
                  loadMyListings();
                } else {
                  loadProducts();
                }
              }}
              disabled={isLoading}
              className="px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-2xl text-sm font-medium transition-all duration-300 flex items-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-purple-500/25"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowMyPurchases(false);
                setShowMyListings((v) => !v);
              }}
              className={`px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 flex items-center gap-2 border ${
                showMyListings
                  ? "bg-white/10 backdrop-blur-xl border-white/20 text-white"
                  : "bg-white/5 backdrop-blur-xl border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              {showMyListings ? "Showing: My Listings" : "My Listings"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowMyListings(false);
                setShowMyPurchases((v) => !v);
              }}
              className={`px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 flex items-center gap-2 border ${
                showMyPurchases
                  ? "bg-white/10 backdrop-blur-xl border-white/20 text-white"
                  : "bg-white/5 backdrop-blur-xl border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              {showMyPurchases ? "Showing: My Purchases" : "Show My Purchases"}
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="px-6 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader className="w-6 h-6 animate-spin" />
                  Loading products...
                </div>
              ) : showMyPurchases ? (
                `${filteredProducts.length} Purchases`
              ) : showMyListings ? (
                `${filteredProducts.length} My Listings`
              ) : (
                `${filteredProducts.length} Digital Assets Found`
              )}
            </h2>
          </div>

          {/* Errors */}
          {(contractError || loadError) && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-300 p-4 rounded-xl mb-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Error</span>
              </div>
              <p className="mt-1">{contractError || loadError}</p>
              <button
                onClick={loadProducts}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 60, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -20, scale: 1.05 }}
                className="group relative cursor-pointer"
                onClick={() => handleProductClick(product.id)}
              >
                {/* Main Card */}
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-500 shadow-2xl">
                  {/* Card Header with Gradient */}
                  <div
                    className={`relative h-64 bg-gradient-to-br ${getGradient(
                      product.id
                    )} overflow-hidden`}
                  >
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent"></div>
                    </div>

                    {product.thumbnailUri ? (
                      <IpfsImage
                        src={product.thumbnailUri}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onLoad={() => {
                          console.log(
                            "✅ Thumbnail loaded successfully:",
                            product.thumbnailUri
                          );
                        }}
                        onError={() => {
                          console.warn(
                            "❌ All gateways failed for thumbnail:",
                            product.thumbnailUri
                          );
                        }}
                        fallbackComponent={
                          <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                              whileHover={{ scale: 1.2, rotate: 10 }}
                              transition={{ duration: 0.3 }}
                              className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/20"
                            >
                              <div className="text-4xl opacity-60">
                                {getEmoji(product.id)}
                              </div>
                            </motion.div>
                          </div>
                        }
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          transition={{ duration: 0.3 }}
                          className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/20"
                        >
                          <div className="text-4xl opacity-60">
                            {getEmoji(product.id)}
                          </div>
                        </motion.div>
                      </div>
                    )}

                    {/* Category Badge */}
                    {(() => {
                      const cat =
                        product.category ||
                        product.description.match(/^cat:(.*?)\|(.*)$/)?.[1] ||
                        "Digital Art";
                      return (
                        <div className="absolute top-4 left-4">
                          <span className="bg-white/20 backdrop-blur-xl border border-white/30 text-white text-sm font-medium px-4 py-2 rounded-full">
                            {cat}
                          </span>
                        </div>
                      );
                    })()}

                    {/* Sales Count */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-black/30 backdrop-blur-xl rounded-full px-3 py-1 border border-white/20">
                      <Package className="w-4 h-4 text-white/80" />
                      <span className="text-white/80 text-sm font-medium">
                        {product.salesCount} sold
                      </span>
                    </div>

                    {/* View Button */}
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(product.id);
                        }}
                        className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all duration-300"
                        title="View product details"
                      >
                        <Eye className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-8">
                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                      {product.name}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-300 text-sm mb-6 line-clamp-2">
                      {product.category
                        ? product.description
                        : product.description.replace(/^cat:(.*?)\|/, "")}
                    </p>

                    {/* Author */}
                    <p className="text-gray-400 text-sm mb-6">
                      by{" "}
                      <span className="text-white font-medium">
                        {formatAddress(product.seller)}
                      </span>
                    </p>

                    {/* Price Section */}
                    <div className="mb-8">
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-3xl font-bold text-white">
                          {parseFloat(weiToBdag(product.price)).toFixed(3)} BDAG
                        </span>
                      </div>
                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "60%" }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-center">
                      {product.seller.toLowerCase() ===
                      account.toLowerCase() ? (
                        <div className="flex flex-col gap-3 w-full">
                          <div className="px-6 py-3 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-500/50 flex items-center justify-center space-x-2">
                            <Package className="w-5 h-5" />
                            <span className="font-medium">Your Product</span>
                          </div>
                          {showMyListings && (
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditProduct(product);
                                }}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-blue-500/25"
                                title="Edit in modal"
                              >
                                <RefreshCw className="w-4 h-4" />
                                <span>Quick Edit</span>
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditProductInPage(product.id);
                                }}
                                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-purple-500/25"
                                title="Edit in full page"
                              >
                                <RefreshCw className="w-4 h-4" />
                                <span>Full Edit</span>
                              </motion.button>
                            </div>
                          )}
                        </div>
                      ) : purchasedProductIds.has(product.id) ? (
                        <div className="flex flex-col gap-3 w-full">
                          <div className="px-6 py-3 rounded-2xl bg-green-500/20 text-green-300 border border-green-500/50 flex items-center justify-center space-x-2">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Purchased</span>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(product);
                            }}
                            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-green-500/25"
                          >
                            <Download className="w-5 h-5" />
                            <span>Download</span>
                          </motion.button>
                        </div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePurchase(product);
                          }}
                          disabled={
                            (purchaseStatus.productId === product.id &&
                              purchaseStatus.status === "pending") ||
                            isLoading
                          }
                          className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-blue-500/25 relative overflow-hidden group"
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            {purchaseStatus.productId === product.id &&
                            purchaseStatus.status === "pending" ? (
                              <>
                                <Loader className="w-5 h-5 animate-spin" />
                                <span>Buying...</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-5 h-5" />
                                <span>Buy Now</span>
                              </>
                            )}
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Glow Effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${getGradient(
                    product.id
                  )} opacity-0 group-hover:opacity-20 blur-xl -z-10 transition-opacity duration-500`}
                ></div>

                {/* Purchase Status */}
                {purchaseStatus.productId === product.id &&
                  purchaseStatus.status !== "idle" && (
                    <div
                      className={`mt-4 p-4 rounded-2xl backdrop-blur-xl border text-sm ${
                        purchaseStatus.status === "success"
                          ? "bg-green-500/10 text-green-300 border-green-500/20"
                          : purchaseStatus.status === "error"
                          ? "bg-red-500/10 text-red-300 border-red-500/20"
                          : "bg-blue-500/10 text-blue-300 border-blue-500/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {purchaseStatus.message.includes("Downloading") && (
                          <Download className="w-5 h-5 animate-pulse" />
                        )}
                        {purchaseStatus.status === "success" &&
                          purchaseStatus.message.includes("downloaded") && (
                            <CheckCircle className="w-5 h-5" />
                          )}
                        {purchaseStatus.status === "error" && (
                          <AlertCircle className="w-5 h-5" />
                        )}
                        <span className="font-medium">
                          {purchaseStatus.message}
                        </span>
                      </div>
                    </div>
                  )}

                {/* Product Info */}
                <div className="mt-4 pt-4 border-t border-white/10 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Product ID: #{product.id}</span>
                    <span className="text-green-400">On-chain</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredProducts.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="text-slate-400 text-lg mb-4">
                {products.length === 0
                  ? "No digital assets have been listed yet."
                  : "No digital assets found matching your criteria."}
              </div>
              {products.length === 0 ? (
                <p className="text-slate-500 text-sm">
                  Be the first to list a digital asset on this marketplace!
                </p>
              ) : (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* Edit Product Modal */}
          {editProduct && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-800 rounded-xl max-w-2xl w-full border border-slate-700 max-h-[90vh] flex flex-col"
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-700">
                  <h3 className="text-xl font-semibold text-white">
                    Edit Product
                  </h3>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={editProduct.name}
                        onChange={(e) =>
                          setEditProduct({
                            ...editProduct,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Category
                      </label>
                      <select
                        value={editProduct.category}
                        onChange={(e) =>
                          setEditProduct({
                            ...editProduct,
                            category: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {categories
                          .filter((c) => c !== "All")
                          .map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={editProduct.description}
                        onChange={(e) =>
                          setEditProduct({
                            ...editProduct,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Price (BDAG)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={editProduct.price}
                        onChange={(e) =>
                          setEditProduct({
                            ...editProduct,
                            price: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Update Product File
                      </label>
                      <FileUploadInterface
                        onFilesSelected={(file) =>
                          setEditProduct({
                            ...editProduct,
                            newProductFile: file,
                          })
                        }
                        className="mb-4"
                      />
                      {editProduct.newProductFile && (
                        <div className="text-sm text-green-400 mb-2">
                          ✅ New file selected:{" "}
                          {editProduct.newProductFile.name}
                        </div>
                      )}
                      {editProduct.uri && !editProduct.newProductFile && (
                        <div className="text-sm text-slate-400 mb-2">
                          Current file: {editProduct.uri.split("/").pop()}
                        </div>
                      )}
                    </div>

                    <div>
                      <ThumbnailUpload
                        onFileSelected={(file) =>
                          setEditProduct({
                            ...editProduct,
                            newThumbnailFile: file,
                          })
                        }
                        currentThumbnail={editProduct.thumbnailUri}
                        className="mb-4"
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-slate-700">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditProduct(null)}
                      className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg text-white font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateProduct}
                      disabled={
                        !editProduct.name.trim() ||
                        !editProduct.description.trim() ||
                        !editProduct.category.trim() ||
                        !editProduct.price ||
                        parseFloat(editProduct.price) <= 0
                      }
                      className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Update Product Info
                    </button>
                    {(editProduct.newProductFile ||
                      editProduct.newThumbnailFile) && (
                      <button
                        onClick={handleUpdateProductMedia}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Update Media
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DigitalMarketplace;
