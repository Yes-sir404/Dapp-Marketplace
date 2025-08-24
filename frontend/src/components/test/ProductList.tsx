// src/components/ProductList.tsx
import React, { useState, useEffect } from "react";
import { useMarketplace, type Product } from "../../hooks/useMarketplace";

export const ProductList: React.FC = () => {
  const { getAllProducts, purchaseProduct, isLoading, error } =
    useMarketplace();
  const [products, setProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load products when component mounts
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setRefreshing(true);
    try {
      const allProducts = await getAllProducts();
      setProducts(allProducts);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handlePurchase = async (product: Product) => {
    if (window.confirm(`Buy "${product.name}" for ${product.price} ETH?`)) {
      try {
        await purchaseProduct(product.id, product.price);
        alert("Purchase successful! 🎉");
        // Refresh product list to show updated status
        await loadProducts();
      } catch (err) {
        alert("Purchase failed. Please try again.");
      }
    }
  };

  if (isLoading || refreshing) {
    return <div className="text-center p-4">Loading products... ⏳</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Digital Marketplace</h2>
        <button
          onClick={loadProducts}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No products available yet. Be the first to create one! 🚀
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md p-6 border"
            >
              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-4 text-sm">
                {product.description}
              </p>

              <div className="space-y-2 text-sm">
                <div>
                  <strong>Price:</strong> {product.price} ETH
                </div>
                <div>
                  <strong>Seller:</strong> {product.seller.slice(0, 6)}...
                  {product.seller.slice(-4)}
                </div>
                <div>
                  <strong>Status:</strong>
                  <span
                    className={
                      product.isSold
                        ? "text-red-600 ml-1"
                        : "text-green-600 ml-1"
                    }
                  >
                    {product.isSold ? "SOLD" : "AVAILABLE"}
                  </span>
                </div>
              </div>

              {!product.isSold && (
                <button
                  onClick={() => handlePurchase(product)}
                  className="w-full mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
                  disabled={isLoading}
                >
                  Buy Now - {product.price} ETH
                </button>
              )}

              {product.isSold && (
                <div className="mt-4 p-2 bg-gray-100 rounded text-center text-gray-600 text-sm">
                  Sold to: {product.buyer.slice(0, 6)}...
                  {product.buyer.slice(-4)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
