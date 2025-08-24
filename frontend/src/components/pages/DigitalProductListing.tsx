import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  FileText,
  Eye,
  Package,
  TrendingUp,
  Wallet,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useWallet } from "../../hooks/useWallet";
import { useMarketplace } from "../../hooks/useMarketplace";

interface ProductFormData {
  name: string;
  description: string;
  price: string; // in BDAG
}

const CATEGORIES = [
  "Digital Art",
  "Music",
  "Photography",
  "Software",
  "Video",
  "Template",
  "Course",
];

const DigitalProductListing: React.FC = () => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
  });
  const [category, setCategory] = useState<string>(CATEGORIES[0]);

  const [transactionStatus, setTransactionStatus] = useState<{
    status: "idle" | "pending" | "success" | "error";
    message: string;
    txHash?: string;
    productId?: string;
  }>({
    status: "idle",
    message: "",
  });

  const { account, signer, connectWallet, isConnecting } = useWallet();

  const {
    createProduct,
    isLoading: isCreatingProduct,
    bdagToWei,
    isContractConnected,
  } = useMarketplace(signer);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (transactionStatus.status !== "idle") {
      setTransactionStatus({ status: "idle", message: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      setTransactionStatus({
        status: "error",
        message: "Please connect your wallet first",
      });
      return;
    }

    if (!formData.name.trim()) {
      setTransactionStatus({
        status: "error",
        message: "Product name cannot be empty",
      });
      return;
    }
    if (formData.name.length > 100) {
      setTransactionStatus({
        status: "error",
        message: "Product name too long (max 100 characters)",
      });
      return;
    }
    if (formData.description.length > 500) {
      setTransactionStatus({
        status: "error",
        message: "Description too long (max 500 characters)",
      });
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setTransactionStatus({
        status: "error",
        message: "Product price must be greater than 0",
      });
      return;
    }
    const priceInBdag = parseFloat(formData.price);
    if (priceInBdag > 5000) {
      setTransactionStatus({
        status: "error",
        message: "Product price too high (max 5000 BDAG)",
      });
      return;
    }

    setTransactionStatus({
      status: "pending",
      message: "Creating product on blockchain...",
    });

    try {
      const result = await createProduct(
        formData.name,
        `cat:${category}|${formData.description}`,
        formData.price // hook internally converts BDAG → wei
      );

      if (result.success) {
        setTransactionStatus({
          status: "success",
          message: "Product listed successfully!",
          txHash: result.transactionHash,
          productId: result.productId,
        });
        setFormData({ name: "", description: "", price: "" });
      } else {
        setTransactionStatus({
          status: "error",
          message: result.error || "Failed to create product",
        });
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setTransactionStatus({
        status: "error",
        message: "An unexpected error occurred. Please try again.",
      });
    }
  };

  const priceInWei = formData.price ? bdagToWei(formData.price) : "0";
  const marketplaceFee = formData.price
    ? (parseFloat(formData.price) * 0.025).toFixed(4)
    : "0";
  const sellerReceives = formData.price
    ? (parseFloat(formData.price) * 0.975).toFixed(4)
    : "0";

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800/50 border border-purple-500/20 rounded-2xl p-8 text-center max-w-md"
        >
          <Wallet className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-gray-400 mb-6">
            You need to connect your wallet to list products
          </p>
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-6 rounded-xl disabled:opacity-50"
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            List Your Digital Product
          </h1>
          <p className="text-purple-300">
            Share your creativity with the world and earn crypto
          </p>
          <div className="text-sm text-gray-400 mt-2">
            Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
          </div>
        </motion.div>

        {/* Status messages */}
        {transactionStatus.status !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl border ${
              transactionStatus.status === "success"
                ? "bg-green-900/20 border-green-500/50 text-green-300"
                : transactionStatus.status === "error"
                ? "bg-red-900/20 border-red-500/50 text-red-300"
                : "bg-blue-900/20 border-blue-500/50 text-blue-300"
            }`}
          >
            <div className="flex items-center gap-3">
              {transactionStatus.status === "success" && (
                <CheckCircle className="w-5 h-5" />
              )}
              {transactionStatus.status === "error" && (
                <XCircle className="w-5 h-5" />
              )}
              {transactionStatus.status === "pending" && (
                <div className="animate-spin h-5 w-5 border-b-2 border-current rounded-full"></div>
              )}
              <span>{transactionStatus.message}</span>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-slate-800/50 border border-purple-500/20 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-semibold text-white">
                  Product Information
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Name */}
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. The NFT Art of Joop"
                  maxLength={100}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-4 text-white"
                  required
                />

                {/* Category */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-4 text-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Description */}
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your product..."
                  maxLength={500}
                  rows={6}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-4 text-white"
                  required
                />

                {/* Price */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Price (BDAG)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.001"
                    min="0.001"
                    max="1000"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-4 text-white"
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={
                    isCreatingProduct ||
                    !formData.name ||
                    !formData.description ||
                    !formData.price ||
                    !isContractConnected ||
                    transactionStatus.status === "pending"
                  }
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 px-6 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                >
                  {isCreatingProduct ? "Creating..." : "List Product"}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Preview Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-slate-800/50 border border-purple-500/20 rounded-2xl p-6 sticky top-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-semibold text-white">Preview</h2>
              </div>

              <motion.div className="bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden mb-6">
                <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  <FileText className="w-16 h-16 text-purple-400" />
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-2 truncate">
                    {formData.name || "Your Product Title"}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {formData.description ||
                      "Your product description will appear here..."}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-400 text-sm">
                      {formData.price ? `${formData.price} BDAG` : "0.1 BDAG"}
                    </span>
                    <span className="text-gray-400 text-xs">
                      Sales: 0 (new)
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Fee Breakdown */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <div className="text-purple-400 font-semibold text-sm">
                    Fee
                  </div>
                  <div className="text-white">{marketplaceFee} BDAG</div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <div className="text-green-400 font-semibold text-sm">
                    You Receive
                  </div>
                  <div className="text-white">{sellerReceives} BDAG</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Smart Contract Call Preview */}
        {(formData.name || formData.description || formData.price) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-slate-800/30 border border-purple-500/20 rounded-xl p-6 font-mono text-sm"
          >
            <span className="text-purple-400">createProduct</span>( "
            {formData.name || "name"}", "{formData.description || "description"}
            ", {priceInWei} )
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DigitalProductListing;
