import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import type { Notification } from "../components/NotificationSystem";
import { useMarketplace } from "./useMarketplace";
import { useWallet } from "./useWallet";
import { useNotificationContext } from "../contexts/NotificationContext";

export interface PaymentEvent {
  id: string;
  type: "purchase" | "sale" | "refund";
  productId: string;
  productName: string;
  amount: string;
  buyer: string;
  seller: string;
  timestamp: Date;
  transactionHash: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [paymentEvents, setPaymentEvents] = useState<PaymentEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { account, signer } = useWallet();
  const { contractAddress, weiToBdag } = useMarketplace(signer);
  const { addPopupNotification } = useNotificationContext();

  // Add a new notification
  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp">) => {
      const newNotification: Notification = {
        ...notification,
        id: `notification-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
      };

      setNotifications((prev) => [newNotification, ...prev]);
    },
    []
  );

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  }, []);

  // Dismiss notification
  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  // Add payment event
  const addPaymentEvent = useCallback(
    (event: Omit<PaymentEvent, "id" | "timestamp">) => {
      const newEvent: PaymentEvent = {
        ...event,
        id: `payment-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
      };

      setPaymentEvents((prev) => [newEvent, ...prev]);
    },
    []
  );

  // Listen for contract events
  const listenForEvents = useCallback(async () => {
    if (!signer || !account || !contractAddress) return;

    try {
      const contract = new ethers.Contract(
        contractAddress,
        (await import("../contracts/contractConfig")).MARKETPLACE_ABI,
        signer.provider
      );

      // Listen for ProductPurchased events
      contract.on(
        "ProductPurchased",
        async (productId: any, seller: any, buyer: any, event: any) => {
          try {
            // Get product details
            const product = await contract.getProduct(productId);

            const paymentEvent: Omit<PaymentEvent, "id" | "timestamp"> = {
              type: "purchase",
              productId: productId.toString(),
              productName: product.name,
              amount: product.price.toString(),
              buyer: buyer,
              seller: seller,
              transactionHash: event.transactionHash,
            };

            addPaymentEvent(paymentEvent);

            // Create notifications based on user role
            if (buyer.toLowerCase() === account.toLowerCase()) {
              // Buyer notification
              addNotification({
                type: "success",
                title: "Purchase Successful!",
                message: `You successfully purchased "${
                  product.name
                }" for ${parseFloat(
                  weiToBdag(product.price.toString())
                ).toFixed(4)} BDAG`,
                read: false,
                action: {
                  label: "Download",
                  onClick: async () => {
                    try {
                      const {
                        downloadFile,
                        getFileNameFromUri,
                        extractOriginalFilename,
                      } = await import("../utils/download");
                      const originalFilename = extractOriginalFilename(
                        product.description
                      );
                      const fileName = await getFileNameFromUri(
                        product.uri,
                        product.name,
                        originalFilename || undefined
                      );
                      await downloadFile(product.uri, fileName);
                    } catch (error) {
                      console.error("Download failed:", error);
                      alert(
                        `Download failed: ${
                          error instanceof Error
                            ? error.message
                            : "Unknown error"
                        }`
                      );
                    }
                  },
                },
              });

              // Add popup notification for buyer
              addPopupNotification({
                type: "success",
                title: "Purchase Successful!",
                message: `You purchased "${product.name}" for ${parseFloat(
                  weiToBdag(product.price.toString())
                ).toFixed(4)} BDAG`,
                duration: 5000,
              });
            }

            if (seller.toLowerCase() === account.toLowerCase()) {
              // Seller notification
              const sellerAmount =
                BigInt(product.price) - (BigInt(product.price) * 250n) / 10000n; // Subtract 2.5% fee
              addNotification({
                type: "success",
                title: "New Sale!",
                message: `Your product "${
                  product.name
                }" was purchased for ${parseFloat(
                  weiToBdag(product.price.toString())
                ).toFixed(4)} BDAG. You received ${parseFloat(
                  weiToBdag(sellerAmount.toString())
                ).toFixed(4)} BDAG`,
                read: false,
              });

              // Add popup notification for seller
              addPopupNotification({
                type: "success",
                title: "New Sale!",
                message: `Your product "${
                  product.name
                }" was purchased for ${parseFloat(
                  weiToBdag(product.price.toString())
                ).toFixed(4)} BDAG`,
                duration: 5000,
              });
            }
          } catch (error) {
            console.error("Error processing purchase event:", error);
          }
        }
      );

      // Listen for ProductCreated events
      contract.on("ProductCreated", async (_productId, name, price, seller) => {
        if (seller.toLowerCase() === account.toLowerCase()) {
          addNotification({
            type: "info",
            title: "Product Listed Successfully",
            message: `Your product "${name}" has been listed for ${parseFloat(
              weiToBdag(price.toString())
            ).toFixed(4)} BDAG`,
            read: false,
          });
        }
      });

      // Listen for ProductUpdated events
      contract.on("ProductUpdated", async (_productId, name, price, seller) => {
        if (seller.toLowerCase() === account.toLowerCase()) {
          addNotification({
            type: "info",
            title: "Product Updated",
            message: `Your product "${name}" has been updated with a new price of ${parseFloat(
              weiToBdag(price.toString())
            ).toFixed(4)} BDAG`,
            read: false,
          });
        }
      });
    } catch (error) {
      console.error("Error setting up event listeners:", error);
    }
  }, [
    signer,
    account,
    contractAddress,
    addNotification,
    addPaymentEvent,
    weiToBdag,
  ]);

  // Load historical events
  const loadHistoricalEvents = useCallback(async () => {
    if (!signer || !account || !contractAddress) return;

    setIsLoading(true);
    try {
      const contract = new ethers.Contract(
        contractAddress,
        (await import("../contracts/contractConfig")).MARKETPLACE_ABI,
        signer.provider
      );

      const currentBlock = await signer.provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 10000); // Last 10k blocks

      // Get ProductPurchased events
      const purchaseFilter = contract.filters.ProductPurchased();
      const purchaseEvents = await contract.queryFilter(
        purchaseFilter,
        fromBlock,
        currentBlock
      );

      const events: PaymentEvent[] = [];

      for (const event of purchaseEvents) {
        const eventLog = event as ethers.EventLog;
        const [productId, seller, buyer] = eventLog.args || [];

        if (
          seller.toLowerCase() === account.toLowerCase() ||
          buyer.toLowerCase() === account.toLowerCase()
        ) {
          try {
            const product = await contract.getProduct(productId);
            events.push({
              id: `historical-${event.transactionHash}-${productId}`,
              type: "purchase",
              productId: productId.toString(),
              productName: product.name,
              amount: product.price.toString(),
              buyer: buyer,
              seller: seller,
              timestamp: new Date((await event.getBlock()).timestamp * 1000),
              transactionHash: event.transactionHash,
            });
          } catch (error) {
            console.error("Error loading historical event:", error);
          }
        }
      }

      setPaymentEvents(
        events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      );
    } catch (error) {
      console.error("Error loading historical events:", error);
    } finally {
      setIsLoading(false);
    }
  }, [signer, account, contractAddress]);

  // Initialize event listeners and load historical data
  useEffect(() => {
    if (signer && account && contractAddress) {
      listenForEvents();
      loadHistoricalEvents();
    }

    // Cleanup event listeners
    return () => {
      if (signer && contractAddress) {
        const cleanup = async () => {
          try {
            const contract = new ethers.Contract(
              contractAddress,
              (await import("../contracts/contractConfig")).MARKETPLACE_ABI,
              signer.provider
            );
            contract.removeAllListeners();
          } catch (error) {
            console.error("Error cleaning up event listeners:", error);
          }
        };
        cleanup();
      }
    };
  }, [signer, account, contractAddress, listenForEvents, loadHistoricalEvents]);

  // Get seller-specific events
  const getSellerEvents = useCallback(() => {
    return paymentEvents.filter(
      (event) => event.seller.toLowerCase() === account?.toLowerCase()
    );
  }, [paymentEvents, account]);

  // Get buyer-specific events
  const getBuyerEvents = useCallback(() => {
    return paymentEvents.filter(
      (event) => event.buyer.toLowerCase() === account?.toLowerCase()
    );
  }, [paymentEvents, account]);

  // Get seller statistics
  const getSellerStats = useCallback(() => {
    const sellerEvents = getSellerEvents();
    const totalSales = sellerEvents.length;
    const totalRevenue = sellerEvents.reduce(
      (sum, event) => sum + BigInt(event.amount),
      0n
    );
    const totalFees = sellerEvents.reduce(
      (sum, event) => sum + (BigInt(event.amount) * 250n) / 10000n,
      0n
    );
    const netRevenue = totalRevenue - totalFees;

    return {
      totalSales,
      totalRevenue: totalRevenue.toString(),
      netRevenue: netRevenue.toString(),
      totalFees: totalFees.toString(),
    };
  }, [getSellerEvents]);

  // Get buyer statistics
  const getBuyerStats = useCallback(() => {
    const buyerEvents = getBuyerEvents();
    const totalPurchases = buyerEvents.length;
    const totalSpent = buyerEvents.reduce(
      (sum, event) => sum + BigInt(event.amount),
      0n
    );

    return {
      totalPurchases,
      totalSpent: totalSpent.toString(),
    };
  }, [getBuyerEvents]);

  return {
    notifications,
    paymentEvents,
    isLoading,
    addNotification,
    markAsRead,
    dismissNotification,
    addPaymentEvent,
    getSellerEvents,
    getBuyerEvents,
    getSellerStats,
    getBuyerStats,
    loadHistoricalEvents,
  };
};
