import { ethers } from "ethers";
import marketplaceArtifact from "../../../artifacts/contracts/Marketplace.sol/Marketplace.json";

// Your deployed contract address (you'll get this after deploying)
export const CONTRACT_ADDRESS = "0x52e244B0aAcB70DD7F1eD68DF7D965BE8f62193A";

// ABI (Application Binary Interface) - tells frontend how to talk to your contract
// This is generated when you compile your Solidity contract
export const MARKETPLACE_ABI = marketplaceArtifact.abi;
// ✅ Utility functions with proper error handling
export const bdagToWei = (bdag: string): string => {
  try {
    if (!bdag || isNaN(parseFloat(bdag))) {
      throw new Error("Invalid BDAG amount");
    }
    return ethers.parseEther(bdag).toString();
  } catch (error) {
    console.error("Error converting BDAG to Wei:", error);
    throw new Error("Failed to convert BDAG to Wei");
  }
};

export const weiToBdag = (wei: string): string => {
  try {
    if (!wei || isNaN(parseFloat(wei))) {
      throw new Error("Invalid Wei amount");
    }
    return ethers.formatEther(wei);
  } catch (error) {
    console.error("Error converting Wei to BDAG:", error);
    return "0";
  }
};

// ✅ Price conversion with caching
class PriceCache {
  private cache: { price: number; timestamp: number } | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getBDAGPrice(): Promise<number> {
    const now = Date.now();

    if (this.cache && now - this.cache.timestamp < this.CACHE_DURATION) {
      return this.cache.price;
    }

    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
        {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(5000), // 5 second timeout
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const price = data.ethereum?.usd;

      if (typeof price !== "number") {
        throw new Error("Invalid price data received");
      }

      this.cache = { price, timestamp: now };
      return price;
    } catch (error) {
      console.error("Error fetching BDAG price:", error);
      // Return cached price if available, otherwise default
      return this.cache?.price || 2000; // Fallback price
    }
  }
}

const priceCache = new PriceCache();

export const weiToUSD = async (weiAmount: string): Promise<string> => {
  try {
    const bdagAmount = parseFloat(weiToBdag(weiAmount));
    const bdagPrice = await priceCache.getBDAGPrice();
    const usdValue = bdagAmount * bdagPrice;
    return usdValue.toFixed(2);
  } catch (error) {
    console.error("Error converting Wei to USD:", error);
    return "0.00";
  }
};

export const bdagToUSD = async (bdagAmount: string): Promise<string> => {
  try {
    const bdagPrice = await priceCache.getBDAGPrice();
    const usdValue = parseFloat(bdagAmount) * bdagPrice;
    return usdValue.toFixed(2);
  } catch (error) {
    console.error("Error converting BDAG to USD:", error);
    return "0.00";
  }
};

// ✅ Contract validation
export const validateContractAddress = (address: string): boolean => {
  return ethers.isAddress(address);
};

// ✅ Export types for better TypeScript support
export interface ContractError {
  reason?: string;
  message: string;
  code?: string | number;
  data?: any;
}

export interface TransactionResponse {
  success: boolean;
  transactionHash?: string;
  error?: string;
  productId?: string;
}

//////////////////////////////////////////////////////////////////////////////////////
