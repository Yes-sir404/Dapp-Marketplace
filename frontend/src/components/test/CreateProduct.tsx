// src/components/CreateProduct.tsx
import React, { useState } from "react";
import { useMarketplace } from "../../hooks/useMarketplace";

export const CreateProduct: React.FC = () => {
  const { createProduct, isLoading, error } = useMarketplace();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.name || !formData.description || !formData.price) {
      alert("Please fill in all fields");
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      alert("Price must be greater than 0");
      return;
    }

    try {
      await createProduct(formData.name, formData.description, formData.price);
      alert("Product created successfully! 🎉");

      // Reset form
      setFormData({ name: "", description: "", price: "" });
    } catch (err) {
      alert("Failed to create product. Please try again.");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Create Digital Product
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Logo Template Pack"
            maxLength={100}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe what buyers will get..."
            maxLength={500}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price (ETH)
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            step="0.001"
            min="0.001"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.1"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400"
        >
          {isLoading ? "Creating Product..." : "Create Product"}
        </button>
      </form>

      <div className="mt-6 text-xs text-gray-500">
        <p>💡 Tips:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Digital products can be NFTs, ebooks, templates, etc.</li>
          <li>Price in ETH (marketplace takes 2.5% fee)</li>
          <li>Products are delivered instantly after purchase</li>
        </ul>
      </div>
    </div>
  );
};
