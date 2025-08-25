// frontend/src/components/marketplace/DigitalMarketplace.tsx

import React, { useEffect, useState, useCallback } from "react";
import {
  Search,
  Heart,
  ShoppingCart,
  Star,
  Wallet,
  Loader,
  RefreshCw,
  AlertCircle,
  Package,
  Download,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useWallet } from "../../hooks/useWallet";
import { useMarketplace } from "../../hooks/useMarketplace";
import { formatEther } from "ethers";
import { downloadFile, getFileNameFromUri } from "../../utils/download";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
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
  } | null>(null);

  // Wallet and contract hooks
  const { account, signer, connectWallet, isConnecting } = useWallet();
  const {
    getAllProducts,
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
        blockchainProducts = await getAllProducts();
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
    getAllProducts,
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

  const toggleLike = (id: string) => {
    const next = new Set(likedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setLikedItems(next);
  };

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
    });
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
        setPurchaseStatus({
          productId: editProduct.id,
          status: "error",
          message: result.error || "Update failed",
        });
      }
    } catch (error: any) {
      console.error("❌ Update error:", error);
      setPurchaseStatus({
        productId: editProduct.id,
        status: "error",
        message: error.message || "An unexpected error occurred",
      });
    }
  };

  const handleUpdateProductMedia = async () => {
    if (!editProduct) return;

    setPurchaseStatus({
      productId: editProduct.id,
      status: "pending",
      message: "Updating product media...",
    });

    try {
      const result = await updateProductMedia(
        editProduct.id,
        editProduct.uri,
        editProduct.thumbnailUri
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
        setPurchaseStatus({
          productId: editProduct.id,
          status: "error",
          message: result.error || "Media update failed",
        });
      }
    } catch (error: any) {
      console.error("❌ Media update error:", error);
      setPurchaseStatus({
        productId: editProduct.id,
        status: "error",
        message: error.message || "An unexpected error occurred",
      });
    }
  };

  const handleDownload = async (product: Product) => {
    if (!product.uri) {
      alert("No file available for download");
      return;
    }

    try {
      const fileName = getFileNameFromUri(product.uri, product.name);
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
            const fileName = getFileNameFromUri(product.uri, product.name);
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
        setPurchaseStatus({
          productId: product.id,
          status: "error",
          message: result.error || "Purchase failed",
        });
      }
    } catch (error: any) {
      console.error("❌ Purchase error:", error);
      setPurchaseStatus({
        productId: product.id,
        status: "error",
        message: error.message || "An unexpected error occurred",
      });
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
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="px-6 py-8">
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
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-slate-400"
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
              className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <button
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
              className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            <button
              onClick={() => {
                setShowMyPurchases(false);
                setShowMyListings((v) => !v);
              }}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-slate-700 ${
                showMyListings
                  ? "bg-slate-700 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {showMyListings ? "Showing: My Listings" : "My Listings"}
            </button>

            <button
              onClick={() => {
                setShowMyListings(false);
                setShowMyPurchases((v) => !v);
              }}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-slate-700 ${
                showMyPurchases
                  ? "bg-slate-700 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {showMyPurchases ? "Showing: My Purchases" : "Show My Purchases"}
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="px-6 pb-12">
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
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (parseInt(product.id) % 6) * 0.05 }}
                className="bg-slate-800 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 hover:shadow-2xl border border-slate-700"
              >
                {/* Card Header */}
                <div
                  className={`h-48 bg-slate-900 relative flex items-center justify-center`}
                >
                  {product.thumbnailUri ? (
                    <img
                      src={
                        (product.thumbnailUri.startsWith("ipfs://")
                          ? `https://gateway.pinata.cloud/ipfs/${product.thumbnailUri.replace(
                              "ipfs://",
                              ""
                            )}`
                          : product.thumbnailUri) as any
                      }
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${getGradient(
                        product.id
                      )}`}
                    >
                      <div className="text-6xl opacity-30">
                        {getEmoji(product.id)}
                      </div>
                    </div>
                  )}
                  {(() => {
                    const cat =
                      product.category ||
                      product.description.match(/^cat:(.*?)\|(.*)$/)?.[1] ||
                      "Digital Art";
                    return (
                      <span className="absolute top-4 left-4 bg-black bg-opacity-50 px-3 py-1 rounded-full text-xs font-medium">
                        {cat}
                      </span>
                    );
                  })()}
                  {/* Sales pill */}
                  <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-full text-xs">
                    {product.salesCount} sold
                  </div>
                  <button
                    onClick={() => toggleLike(product.id)}
                    className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all duration-200"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        likedItems.has(product.id)
                          ? "text-red-500 fill-current"
                          : "text-white"
                      }`}
                    />
                  </button>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2 text-white">
                    {product.name}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {product.category
                      ? product.description
                      : product.description.replace(/^cat:(.*?)\|/, "")}
                  </p>

                  <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                    <span>by {formatAddress(product.seller)}</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-white">
                        4.{Math.floor(Math.random() * 5) + 5}
                      </span>
                      <span className="ml-1">
                        ({Math.floor(Math.random() * 100) + 20})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-white">
                        {parseFloat(weiToBdag(product.price)).toFixed(3)} BDAG
                      </span>
                    </div>

                    {product.seller.toLowerCase() === account.toLowerCase() ? (
                      <div className="flex gap-2">
                        <div className="px-6 py-2 rounded-lg bg-blue-900/20 text-blue-300 border border-blue-500/50 flex items-center space-x-2">
                          <Package className="w-4 h-4 fill-current" />
                          <span>Your Product</span>
                        </div>
                        {showMyListings && (
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200 flex items-center space-x-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                        )}
                      </div>
                    ) : purchasedProductIds.has(product.id) ? (
                      <div className="flex gap-2">
                        <div className="px-6 py-2 rounded-lg bg-green-900/20 text-green-300 border border-green-500/50 flex items-center space-x-2">
                          <Star className="w-4 h-4 fill-current" />
                          <span>Purchased</span>
                        </div>
                        <button
                          onClick={() => handleDownload(product)}
                          className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors duration-200 flex items-center space-x-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handlePurchase(product)}
                        disabled={
                          (purchaseStatus.productId === product.id &&
                            purchaseStatus.status === "pending") ||
                          isLoading
                        }
                        className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {purchaseStatus.productId === product.id &&
                        purchaseStatus.status === "pending" ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            <span>Buying...</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4" />
                            <span>Buy Now</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Purchase Status */}
                  {purchaseStatus.productId === product.id &&
                    purchaseStatus.status !== "idle" && (
                      <div
                        className={`mt-3 p-2 rounded text-sm ${
                          purchaseStatus.status === "success"
                            ? "bg-green-900/20 text-green-300"
                            : purchaseStatus.status === "error"
                            ? "bg-red-900/20 text-red-300"
                            : "bg-blue-900/20 text-blue-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {purchaseStatus.message.includes("Downloading") && (
                            <Download className="w-4 h-4 animate-pulse" />
                          )}
                          {purchaseStatus.status === "success" &&
                            purchaseStatus.message.includes("downloaded") && (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          {purchaseStatus.status === "error" && (
                            <AlertCircle className="w-4 h-4" />
                          )}
                          <span>{purchaseStatus.message}</span>
                        </div>
                      </div>
                    )}

                  <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-500">
                    <div className="flex justify-between">
                      <span>Product ID: #{product.id}</span>
                      <span>On-chain</span>
                    </div>
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
                className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700"
              >
                <h3 className="text-xl font-semibold mb-4 text-white">
                  Edit Product
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={editProduct.name}
                      onChange={(e) =>
                        setEditProduct({ ...editProduct, name: e.target.value })
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
                      Product URI (IPFS)
                    </label>
                    <input
                      type="text"
                      value={editProduct.uri}
                      onChange={(e) =>
                        setEditProduct({
                          ...editProduct,
                          uri: e.target.value,
                        })
                      }
                      placeholder="ipfs://..."
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Thumbnail URI (IPFS)
                    </label>
                    <input
                      type="text"
                      value={editProduct.thumbnailUri}
                      onChange={(e) =>
                        setEditProduct({
                          ...editProduct,
                          thumbnailUri: e.target.value,
                        })
                      }
                      placeholder="ipfs://..."
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
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
                    Update Product
                  </button>
                  <button
                    onClick={handleUpdateProductMedia}
                    disabled={
                      !editProduct.uri || !editProduct.thumbnailUri || isLoading
                    }
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Update Media
                  </button>
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
