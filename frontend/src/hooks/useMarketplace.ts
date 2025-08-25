import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import {
  MARKETPLACE_ABI,
  CONTRACT_ADDRESS,
  bdagToWei,
  weiToBdag,
  validateContractAddress,
  type TransactionResponse,
} from "../contracts/contractConfig";

// ✅ Updated interface
export interface Product {
  id: string;
  name: string;
  description: string;
  category?: string;
  uri?: string; // IPFS URI for product content
  thumbnailUri?: string; // IPFS URI for product thumbnail
  price: string; // in wei
  seller: string;
  salesCount: string; // ✅ new
}

export interface MarketplaceStats {
  totalProducts: string;
  totalSales: string;
  totalFeesCollected: string;
  currentFeePercent: string;
}

export interface UseMarketplaceReturn {
  // State
  isLoading: boolean;
  error: string | null;

  // Functions
  createProduct: (
    name: string,
    description: string,
    category: string,
    priceInBdag: string,
    uri: string,
    thumbnailUri: string
  ) => Promise<TransactionResponse>;
  purchaseProduct: (
    productId: string,
    priceInWei: bigint
  ) => Promise<TransactionResponse>;
  updateProduct: (
    productId: string,
    name: string,
    description: string,
    category: string,
    priceInBdag: string
  ) => Promise<TransactionResponse>;
  getAllProducts: () => Promise<Product[]>;
  getSellerProducts: (sellerAddress: string) => Promise<Product[]>;
  getProductsByCategory: (category: string) => Promise<Product[]>;
  getMarketplaceStats: () => Promise<MarketplaceStats | null>;
  verifyContract: () => Promise<boolean>;
  getPurchasedProducts: (buyerAddress: string) => Promise<Product[]>;
  hasUserPurchased: (
    productId: string,
    userAddress: string
  ) => Promise<boolean>;
  getContractOwner: () => Promise<string>;
  updateProductMedia: (
    productId: string,
    uri: string,
    thumbnailUri: string
  ) => Promise<TransactionResponse>;

  // Utilities
  weiToBdag: (weiAmount: string) => string;
  bdagToWei: (bdagAmount: string) => string;

  // Contract info
  contractAddress: string;
  isContractConnected: boolean;
}

export const useMarketplace = (
  signer: ethers.JsonRpcSigner | null
): UseMarketplaceReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Validate contract address on mount
  useEffect(() => {
    if (!validateContractAddress(CONTRACT_ADDRESS)) {
      setError("Invalid contract address configured");
    }
  }, []);

  const getContract = useCallback(() => {
    if (!signer) {
      throw new Error("No signer available. Please connect your wallet.");
    }
    if (!validateContractAddress(CONTRACT_ADDRESS)) {
      throw new Error("Invalid contract address");
    }

    return new ethers.Contract(CONTRACT_ADDRESS, MARKETPLACE_ABI, signer);
  }, [signer]);
  //*********** */ Handle contract error HERE**************************
  const handleContractError = (error: any, operation: string): string => {
    console.error(`❌ ${operation} failed:`, error);

    // User rejected or insufficient funds
    if (error.code === "INSUFFICIENT_FUNDS") return "Insufficient funds";
    if (error.code === 4001 || error.code === "ACTION_REJECTED")
      return "Transaction rejected";

    // Ethers.js revert reason
    if (error.reason) return error.reason;

    // Nested error object (common with ethers v6)
    if (error.error?.message) {
      const msg = error.error.message as string;
      // Strip the "execution reverted: " prefix if exists
      return msg.replace(/^execution reverted: /, "");
    }

    // Fallback
    if (error.message) return error.message;

    return `Failed to ${operation}`;
  };

  const verifyContract = useCallback(async (): Promise<boolean> => {
    try {
      const contract = await getContract();
      await Promise.all([
        contract.productCount(),
        contract.owner(),
        contract.marketplaceFeePercent(),
      ]);
      return true;
    } catch (error) {
      setError(handleContractError(error, "verify contract"));
      return false;
    }
  }, [getContract]);

  const createProduct = useCallback(
    async (
      name: string,
      description: string,
      category: string,
      priceInBdag: string,
      uri: string,
      thumbnailUri: string
    ): Promise<TransactionResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        if (!name.trim()) throw new Error("Product name required");
        if (!description.trim()) throw new Error("Description required");
        if (!priceInBdag || parseFloat(priceInBdag) <= 0)
          throw new Error("Valid price required");

        const contract = await getContract();
        const priceInWei = ethers.parseEther(priceInBdag);

        const tx = await contract.createProduct(
          name.trim(),
          description.trim(),
          category.trim(),
          priceInWei,
          uri,
          thumbnailUri
        );
        const receipt = await tx.wait();

        return { success: true, transactionHash: receipt.hash };
      } catch (error) {
        const msg = handleContractError(error, "create product");
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setIsLoading(false);
      }
    },
    [getContract]
  );

  const updateProduct = useCallback(
    async (
      productId: string,
      name: string,
      description: string,
      category: string,
      priceInBdag: string
    ): Promise<TransactionResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        if (!name.trim()) throw new Error("Product name required");
        if (!description.trim()) throw new Error("Description required");
        if (!priceInBdag || parseFloat(priceInBdag) <= 0)
          throw new Error("Valid price required");

        const contract = await getContract();
        const priceInWei = ethers.parseEther(priceInBdag);
        const id = parseInt(productId);
        if (isNaN(id) || id <= 0) throw new Error("Invalid product ID");

        const tx = await contract.updateProduct(
          id,
          name.trim(),
          description.trim(),
          category.trim(),
          priceInWei
        );
        const receipt = await tx.wait();

        return { success: true, transactionHash: receipt.hash };
      } catch (error) {
        const msg = handleContractError(error, "update product");
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setIsLoading(false);
      }
    },
    [getContract]
  );

  const purchaseProduct = useCallback(
    async (
      productId: string,
      priceInWei: bigint
    ): Promise<TransactionResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const id = parseInt(productId);
        if (isNaN(id) || id <= 0) throw new Error("Invalid product ID");

        const contract = await getContract();
        const product = await contract.products(id);

        // CHECK PRICE MATCH (both are bigint in ethers v6)
        if (product.price !== priceInWei) {
          throw new Error("Price mismatch");
        }

        // SEND BIGINT AS VALUE
        const tx = await contract.purchaseProduct(id, { value: priceInWei });
        const receipt = await tx.wait();

        if (receipt.status !== 1) throw new Error("Transaction failed");

        return { success: true, transactionHash: receipt.hash };
      } catch (error: any) {
        const msg = handleContractError(error, "purchase product");
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setIsLoading(false);
      }
    },
    [getContract]
  );

  const getAllProducts = useCallback(async (): Promise<Product[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = await getContract();
      const products = await contract.getAllProducts();
      return products.map((p: any) => ({
        id: p.id.toString(),
        name: p.name,
        description: p.description,
        category: p.category,
        uri: p.uri,
        thumbnailUri: p.thumbnailUri,
        price: p.price.toString(),
        seller: p.seller,
        salesCount: p.salesCount.toString(),
      }));
    } catch (error) {
      setError(handleContractError(error, "fetch all products"));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [getContract]);

  const getSellerProducts = useCallback(
    async (sellerAddress: string): Promise<Product[]> => {
      setIsLoading(true);
      setError(null);
      try {
        if (!ethers.isAddress(sellerAddress)) {
          throw new Error("Invalid seller address");
        }
        const contract = await getContract();
        const products = await contract.getSellerProducts(sellerAddress);
        return products.map((p: any) => ({
          id: p.id.toString(),
          name: p.name,
          description: p.description,
          category: p.category,
          uri: p.uri,
          thumbnailUri: p.thumbnailUri,
          price: p.price.toString(),
          seller: p.seller,
          salesCount: p.salesCount.toString(),
        }));
      } catch (error) {
        setError(handleContractError(error, "fetch seller products"));
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [getContract]
  );

  const getProductsByCategory = useCallback(
    async (category: string): Promise<Product[]> => {
      setIsLoading(true);
      setError(null);
      try {
        if (!category.trim()) {
          throw new Error("Category required");
        }
        const contract = await getContract();
        const products = await contract.getProductsByCategory(category.trim());
        return products.map((p: any) => ({
          id: p.id.toString(),
          name: p.name,
          description: p.description,
          category: p.category,
          uri: p.uri,
          thumbnailUri: p.thumbnailUri,
          price: p.price.toString(),
          seller: p.seller,
          salesCount: p.salesCount.toString(),
        }));
      } catch (error) {
        setError(handleContractError(error, "fetch products by category"));
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [getContract]
  );

  const getMarketplaceStats =
    useCallback(async (): Promise<MarketplaceStats | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const contract = await getContract();
        const stats = await contract.getMarketplaceStats();
        return {
          totalProducts: stats.totalProducts.toString(),
          totalSales: stats.totalSales.toString(),
          totalFeesCollected: stats.totalFeesCollected.toString(),
          currentFeePercent: stats.currentFeePercent.toString(),
        };
      } catch (error) {
        setError(handleContractError(error, "fetch stats"));
        return null;
      } finally {
        setIsLoading(false);
      }
    }, [getContract]);

  const getPurchasedProducts = useCallback(
    async (buyerAddress: string): Promise<Product[]> => {
      setIsLoading(true);
      setError(null);
      try {
        if (!ethers.isAddress(buyerAddress)) {
          throw new Error("Invalid buyer address");
        }
        const contract = await getContract();
        const provider = signer?.provider;
        if (!provider) throw new Error("No provider available");

        const currentBlock = await provider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 200000); // scan recent blocks

        const filter = contract.filters.ProductPurchased();
        const events = await contract.queryFilter(
          filter,
          fromBlock,
          currentBlock
        );

        const purchasedIds = Array.from(
          new Set(
            events
              .filter(
                (e: any) =>
                  (e.args?.buyer || e.args?.[2])?.toLowerCase() ===
                  buyerAddress.toLowerCase()
              )
              .map((e: any) => (e.args?.id || e.args?.[0]).toString())
          )
        );

        const results: Product[] = [];
        for (const idStr of purchasedIds) {
          const id = parseInt(idStr, 10);
          const p = await contract.getProduct(id);
          results.push({
            id: p.id.toString(),
            name: p.name,
            description: p.description,
            category: p.category,
            uri: p.uri,
            thumbnailUri: p.thumbnailUri,
            price: p.price.toString(),
            seller: p.seller,
            salesCount: p.salesCount.toString(),
          });
        }
        return results;
      } catch (error) {
        setError(handleContractError(error, "fetch purchased products"));
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [getContract, signer]
  );

  const hasUserPurchased = useCallback(
    async (productId: string, userAddress: string): Promise<boolean> => {
      try {
        if (!ethers.isAddress(userAddress)) {
          throw new Error("Invalid user address");
        }
        const contract = await getContract();
        const id = parseInt(productId);
        if (isNaN(id) || id <= 0) throw new Error("Invalid product ID");

        return await contract.hasUserPurchased(id, userAddress);
      } catch (error) {
        console.error("Error checking purchase status:", error);
        return false;
      }
    },
    [getContract]
  );

  const getContractOwner = useCallback(async (): Promise<string> => {
    try {
      const contract = await getContract();
      return await contract.owner();
    } catch (error) {
      console.error("Error getting contract owner:", error);
      throw error;
    }
  }, [getContract]);

  const updateProductMedia = useCallback(
    async (
      productId: string,
      uri: string,
      thumbnailUri: string
    ): Promise<TransactionResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        if (!uri.trim()) throw new Error("Product URI required");
        if (!thumbnailUri.trim()) throw new Error("Thumbnail URI required");

        const contract = await getContract();
        const id = parseInt(productId);
        if (isNaN(id) || id <= 0) throw new Error("Invalid product ID");

        const tx = await contract.updateProductMedia(
          id,
          uri.trim(),
          thumbnailUri.trim()
        );
        const receipt = await tx.wait();

        return { success: true, transactionHash: receipt.hash };
      } catch (error) {
        const msg = handleContractError(error, "update product media");
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setIsLoading(false);
      }
    },
    [getContract]
  );

  return {
    isLoading,
    error,
    createProduct,
    purchaseProduct,
    updateProduct,
    updateProductMedia,
    getAllProducts,
    getSellerProducts,
    getProductsByCategory,
    getMarketplaceStats,
    verifyContract,
    getPurchasedProducts,
    hasUserPurchased,
    getContractOwner,
    weiToBdag: weiToBdag,
    bdagToWei: bdagToWei,
    contractAddress: CONTRACT_ADDRESS,
    isContractConnected: !!signer,
  };
};
