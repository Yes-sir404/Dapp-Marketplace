import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Upload, AlertCircle, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { useWallet } from "../../hooks/useWallet";
import { useMarketplace } from "../../hooks/useMarketplace";
import { useNotificationContext } from "../../contexts/NotificationContext";
import { uploadFileToPinata } from "../../services/pinata";
import FileUploadInterface from "../FileUploadInterface";
import ThumbnailUpload from "../ThumbnailUpload";

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

const EditProduct: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    status: "idle" | "pending" | "success" | "error";
    message: string;
  }>({
    status: "idle",
    message: "",
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Digital Art",
    price: "",
    newProductFile: null as File | null,
    newThumbnailFile: null as File | null,
  });

  // Wallet and contract hooks
  const { signer } = useWallet();
  const { getProduct, updateProduct, updateProductMedia, weiToBdag } =
    useMarketplace(signer);
  const { addPopupNotification } = useNotificationContext();

  // Categories
  const categories = [
    "Digital Art",
    "Music",
    "Video",
    "Document",
    "Software",
    "E-book",
    "Photography",
    "3D Model",
    "Other",
  ];

  // Load product data
  const loadProduct = useCallback(async () => {
    if (!productId || !signer) return;

    try {
      setIsLoading(true);
      setError(null);
      const productData = await getProduct(productId);

      if (productData) {
        setProduct(productData);
        setFormData({
          name: productData.name,
          description: productData.description,
          category:
            productData.category ||
            productData.description.match(/^cat:(.*?)\|(.*)$/)?.[1] ||
            "Digital Art",
          price: weiToBdag(productData.price),
          newProductFile: null,
          newThumbnailFile: null,
        });
      } else {
        setError("Product not found");
      }
    } catch (err: any) {
      setError("Failed to load product");
    } finally {
      setIsLoading(false);
    }
  }, [productId, signer, getProduct, weiToBdag]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle file selection
  const handleProductFileSelect = (file: File | null) => {
    setFormData((prev) => ({ ...prev, newProductFile: file }));
  };

  const handleThumbnailFileSelect = (file: File | null) => {
    setFormData((prev) => ({ ...prev, newThumbnailFile: file }));
  };

  // Save product info
  const handleSaveProductInfo = async () => {
    if (!product || !signer) return;

    setIsSaving(true);
    setSaveStatus({
      status: "pending",
      message: "Updating product information...",
    });

    try {
      const result = await updateProduct(
        product.id,
        formData.name,
        formData.description,
        formData.category,
        formData.price
      );

      if (result.success) {
        setSaveStatus({
          status: "success",
          message: "Product information updated successfully!",
        });

        addPopupNotification({
          type: "success",
          title: "Product Updated",
          message: "Product information has been updated successfully.",
          duration: 5000,
        });

        // Reload product data
        setTimeout(() => loadProduct(), 1000);
      } else {
        setSaveStatus({
          status: "error",
          message: result.error || "Failed to update product",
        });
      }
    } catch (error: any) {
      setSaveStatus({
        status: "error",
        message: "Failed to update product",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Save product media
  const handleSaveProductMedia = async () => {
    if (!product || !signer) return;

    setIsSaving(true);
    setSaveStatus({
      status: "pending",
      message: "Uploading files and updating media...",
    });

    try {
      let productUri = product.uri || "";
      let thumbnailUri = product.thumbnailUri || "";

      // Upload new product file if provided
      if (formData.newProductFile) {
        setSaveStatus({
          status: "pending",
          message: "Uploading product file to IPFS...",
        });
        const productUpload = await uploadFileToPinata(formData.newProductFile);
        productUri = productUpload.uri;
      }

      // Upload new thumbnail if provided
      if (formData.newThumbnailFile) {
        setSaveStatus({
          status: "pending",
          message: "Uploading thumbnail to IPFS...",
        });
        const thumbnailUpload = await uploadFileToPinata(
          formData.newThumbnailFile
        );
        thumbnailUri = thumbnailUpload.uri;
      }

      // Update the product media on blockchain
      setSaveStatus({
        status: "pending",
        message: "Updating product media on blockchain...",
      });

      const result = await updateProductMedia(
        product.id,
        productUri,
        thumbnailUri
      );

      // If a new product file was uploaded, update the description with the new filename
      if (formData.newProductFile && result.success) {
        setSaveStatus({
          status: "pending",
          message: "Updating product description with new filename...",
        });

        // Extract the current description without the old filename
        const currentDesc = formData.description;
        const descWithoutFilename = currentDesc.replace(
          /(\n\n\[FILENAME:[^\]]+\]|\n\nOriginal filename: .+)$/,
          ""
        );
        const newDescription = `${descWithoutFilename}\n\n[FILENAME:${formData.newProductFile.name}]`;

        const updateResult = await updateProduct(
          product.id,
          formData.name,
          newDescription,
          formData.category,
          formData.price
        );

        if (!updateResult.success) {
          // silently continue if description update fails
        }
      }

      if (result.success) {
        setSaveStatus({
          status: "success",
          message: "Product media updated successfully!",
        });

        addPopupNotification({
          type: "success",
          title: "Media Updated",
          message: "Product media has been updated successfully.",
          duration: 5000,
        });

        // Clear file selections and reload
        setFormData((prev) => ({
          ...prev,
          newProductFile: null,
          newThumbnailFile: null,
        }));
        setTimeout(() => loadProduct(), 1000);
      } else {
        setSaveStatus({
          status: "error",
          message: result.error || "Failed to update media",
        });
      }
    } catch (error: any) {
      setSaveStatus({
        status: "error",
        message: "Failed to update media",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-slate-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">{error || "Product not found"}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Edit Product</h1>
              <p className="text-slate-400">
                Update your product information and media
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Status Message */}
          {saveStatus.status !== "idle" && (
            <div
              className={`p-4 rounded-lg border ${
                saveStatus.status === "success"
                  ? "bg-green-900/20 border-green-700 text-green-400"
                  : saveStatus.status === "error"
                  ? "bg-red-900/20 border-red-700 text-red-400"
                  : "bg-blue-900/20 border-blue-700 text-blue-400"
              }`}
            >
              <div className="flex items-center gap-2">
                {saveStatus.status === "pending" && (
                  <Loader className="w-4 h-4 animate-spin" />
                )}
                <span className="text-sm">{saveStatus.message}</span>
              </div>
            </div>
          )}

          {/* Product Information */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-6">
              Product Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Price (BDAG)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleSaveProductInfo}
                disabled={
                  !formData.name.trim() ||
                  !formData.description.trim() ||
                  !formData.category.trim() ||
                  !formData.price ||
                  parseFloat(formData.price) <= 0 ||
                  isSaving
                }
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Update Product Info
              </button>
            </div>
          </div>

          {/* Product Media */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-6">
              Product Media
            </h2>

            <div className="space-y-6">
              {/* Product File Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Update Product File
                </label>
                <FileUploadInterface
                  onFilesSelected={handleProductFileSelect}
                  className="mb-4"
                />
                {formData.newProductFile && (
                  <div className="text-sm text-green-400 mb-2">
                    ✅ New file selected: {formData.newProductFile.name}
                  </div>
                )}
                {product.uri && !formData.newProductFile && (
                  <div className="text-sm text-slate-400 mb-2">
                    Current file: {product.uri.split("/").pop()}
                  </div>
                )}
              </div>

              {/* Thumbnail Upload */}
              <div>
                <ThumbnailUpload
                  onFileSelected={handleThumbnailFileSelect}
                  currentThumbnail={product.thumbnailUri}
                  className="mb-4"
                />
              </div>
            </div>

            {(formData.newProductFile || formData.newThumbnailFile) && (
              <div className="mt-6">
                <button
                  onClick={handleSaveProductMedia}
                  disabled={isSaving}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Update Media
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EditProduct;
