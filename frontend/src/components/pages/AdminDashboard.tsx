import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart3,
  DollarSign,
  Pause,
  Play,
  Wallet,
  TrendingUp,
  Package,
  AlertTriangle,
  CheckCircle,
  Loader,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import { useWallet } from "../../hooks/useWallet";
import { useMarketplace } from "../../hooks/useMarketplace";

interface AdminStats {
  totalProducts: string;
  totalSales: string;
  totalFeesCollected: string;
  currentFeePercent: string;
  isPaused: boolean;
  owner: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newFeePercent, setNewFeePercent] = useState("");
  const [actionStatus, setActionStatus] = useState<{
    type: string;
    status: "idle" | "pending" | "success" | "error";
    message: string;
  }>({
    type: "",
    status: "idle",
    message: "",
  });

  const { account, signer } = useWallet();
  const {
    getMarketplaceStats,
    isContractConnected,
    contractAddress,
    weiToBdag,
  } = useMarketplace(signer);

  // Check if current user is admin
  const [isAdmin, setIsAdmin] = useState(false);

  const loadStats = useCallback(async () => {
    if (!signer || !isContractConnected) return;

    setIsLoading(true);
    setError(null);
    try {
      const contractStats = await getMarketplaceStats();
      if (contractStats) {
        // Get additional contract info
        const contract = new (await import("ethers")).Contract(
          contractAddress,
          (await import("../../contracts/contractConfig")).MARKETPLACE_ABI,
          signer
        );

        const [owner, isPaused] = await Promise.all([
          contract.owner(),
          contract.paused(),
        ]);

        setStats({
          totalProducts: contractStats.totalProducts,
          totalSales: contractStats.totalSales,
          totalFeesCollected: contractStats.totalFeesCollected,
          currentFeePercent: contractStats.currentFeePercent,
          isPaused,
          owner: owner,
        });

        // Check if current user is admin
        setIsAdmin(owner.toLowerCase() === account?.toLowerCase());
      }
    } catch (error: any) {
      console.error("Failed to load admin stats:", error);
      setError(error.message || "Failed to load admin statistics");
    } finally {
      setIsLoading(false);
    }
  }, [
    signer,
    isContractConnected,
    getMarketplaceStats,
    contractAddress,
    account,
  ]);

  useEffect(() => {
    if (signer && isContractConnected) {
      loadStats();
    }
  }, [signer, isContractConnected, loadStats]);

  const handlePauseMarketplace = async () => {
    if (!signer || !isContractConnected || !isAdmin) return;

    setActionStatus({
      type: "pause",
      status: "pending",
      message: "Pausing marketplace...",
    });

    try {
      const contract = new (await import("ethers")).Contract(
        contractAddress,
        (await import("../../contracts/contractConfig")).MARKETPLACE_ABI,
        signer
      );

      const tx = await contract.pauseMarketplace();
      await tx.wait();

      setActionStatus({
        type: "pause",
        status: "success",
        message: "Marketplace paused successfully!",
      });

      setTimeout(() => loadStats(), 2000);
      setTimeout(
        () => setActionStatus({ type: "", status: "idle", message: "" }),
        5000
      );
    } catch (error: any) {
      console.error("Failed to pause marketplace:", error);
      setActionStatus({
        type: "pause",
        status: "error",
        message: error.message || "Failed to pause marketplace",
      });
    }
  };

  const handleUnpauseMarketplace = async () => {
    if (!signer || !isContractConnected || !isAdmin) return;

    setActionStatus({
      type: "unpause",
      status: "pending",
      message: "Unpausing marketplace...",
    });

    try {
      const contract = new (await import("ethers")).Contract(
        contractAddress,
        (await import("../../contracts/contractConfig")).MARKETPLACE_ABI,
        signer
      );

      const tx = await contract.unpauseMarketplace();
      await tx.wait();

      setActionStatus({
        type: "unpause",
        status: "success",
        message: "Marketplace unpaused successfully!",
      });

      setTimeout(() => loadStats(), 2000);
      setTimeout(
        () => setActionStatus({ type: "", status: "idle", message: "" }),
        5000
      );
    } catch (error: any) {
      console.error("Failed to unpause marketplace:", error);
      setActionStatus({
        type: "unpause",
        status: "error",
        message: error.message || "Failed to unpause marketplace",
      });
    }
  };

  const handleWithdrawFees = async () => {
    if (!signer || !isContractConnected || !isAdmin) return;

    setActionStatus({
      type: "withdraw",
      status: "pending",
      message: "Withdrawing fees...",
    });

    try {
      const contract = new (await import("ethers")).Contract(
        contractAddress,
        (await import("../../contracts/contractConfig")).MARKETPLACE_ABI,
        signer
      );

      const tx = await contract.withdrawFees();
      await tx.wait();

      setActionStatus({
        type: "withdraw",
        status: "success",
        message: "Fees withdrawn successfully!",
      });

      setTimeout(() => loadStats(), 2000);
      setTimeout(
        () => setActionStatus({ type: "", status: "idle", message: "" }),
        5000
      );
    } catch (error: any) {
      console.error("Failed to withdraw fees:", error);
      setActionStatus({
        type: "withdraw",
        status: "error",
        message: error.message || "Failed to withdraw fees",
      });
    }
  };

  const handleUpdateFee = async () => {
    if (!signer || !isContractConnected || !isAdmin || !newFeePercent) return;

    setActionStatus({
      type: "fee",
      status: "pending",
      message: "Updating fee percentage...",
    });

    try {
      const contract = new (await import("ethers")).Contract(
        contractAddress,
        (await import("../../contracts/contractConfig")).MARKETPLACE_ABI,
        signer
      );

      const feeInParts = parseInt(newFeePercent) * 100; // Convert percentage to parts per 10,000
      const tx = await contract.setMarketplaceFee(feeInParts);
      await tx.wait();

      setActionStatus({
        type: "fee",
        status: "success",
        message: "Fee percentage updated successfully!",
      });

      setNewFeePercent("");
      setTimeout(() => loadStats(), 2000);
      setTimeout(
        () => setActionStatus({ type: "", status: "idle", message: "" }),
        5000
      );
    } catch (error: any) {
      console.error("Failed to update fee:", error);
      setActionStatus({
        type: "fee",
        status: "error",
        message: error.message || "Failed to update fee percentage",
      });
    }
  };

  const formatAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const formatFeePercent = (feeParts: string) => {
    const fee = parseInt(feeParts) / 100; // Convert from parts per 10,000 to percentage
    return `${fee}%`;
  };

  // Not admin or not connected
  if (!account || !isContractConnected) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center max-w-md"
        >
          <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Access Required
          </h2>
          <p className="text-slate-400">
            Please connect your wallet to access the admin dashboard.
          </p>
        </motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center max-w-md"
        >
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Admin Access Required
          </h2>
          <p className="text-slate-400 mb-4">
            Only the marketplace owner can access this dashboard.
          </p>
          <p className="text-xs text-slate-500">
            Connected: {formatAddress(account)}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="px-6 py-8 border-b border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Admin <span className="text-purple-400">Dashboard</span>
              </h1>
              <p className="text-slate-400">
                Manage your marketplace settings and view statistics
              </p>
              <div className="text-sm text-gray-400 mt-2">
                Owner: {formatAddress(account)}
              </div>
            </div>
            <button
              onClick={loadStats}
              disabled={isLoading}
              className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-300 p-4 rounded-xl mb-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Error</span>
              </div>
              <p className="mt-1">{error}</p>
            </div>
          )}

          {/* Action Status */}
          {actionStatus.status !== "idle" && (
            <div
              className={`p-4 rounded-xl mb-6 ${
                actionStatus.status === "success"
                  ? "bg-green-900/20 border border-green-500/50 text-green-300"
                  : actionStatus.status === "error"
                  ? "bg-red-900/20 border border-red-500/50 text-red-300"
                  : "bg-blue-900/20 border border-blue-500/50 text-blue-300"
              }`}
            >
              <div className="flex items-center gap-2">
                {actionStatus.status === "pending" ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : actionStatus.status === "success" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
                <span className="font-medium">
                  {actionStatus.type.charAt(0).toUpperCase() +
                    actionStatus.type.slice(1)}
                </span>
              </div>
              <p className="mt-1">{actionStatus.message}</p>
            </div>
          )}

          {/* Statistics Grid */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Products</p>
                    <p className="text-2xl font-bold text-white">
                      {stats?.totalProducts || "0"}
                    </p>
                  </div>
                  <Package className="w-8 h-8 text-blue-400" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Sales</p>
                    <p className="text-2xl font-bold text-white">
                      {stats?.totalSales || "0"}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Fees Collected</p>
                    <p className="text-2xl font-bold text-white">
                      {stats?.totalFeesCollected
                        ? parseFloat(
                            weiToBdag(stats.totalFeesCollected)
                          ).toFixed(4)
                        : "0.0000"}{" "}
                      BDAG
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-yellow-400" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Current Fee</p>
                    <p className="text-2xl font-bold text-white">
                      {stats?.currentFeePercent
                        ? formatFeePercent(stats.currentFeePercent)
                        : "0%"}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-400" />
                </div>
              </motion.div>
            </div>
          )}

          {/* Admin Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Marketplace Control */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-800 rounded-xl p-6 border border-slate-700"
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                Marketplace Control
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="font-medium">Status</p>
                    <p className="text-sm text-slate-400">
                      {stats?.isPaused ? "Paused" : "Active"}
                    </p>
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      stats?.isPaused ? "bg-red-400" : "bg-green-400"
                    }`}
                  />
                </div>

                <div className="flex gap-3">
                  {stats?.isPaused ? (
                    <button
                      onClick={handleUnpauseMarketplace}
                      disabled={actionStatus.status === "pending"}
                      className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Play className="w-4 h-4" />
                      Unpause
                    </button>
                  ) : (
                    <button
                      onClick={handlePauseMarketplace}
                      disabled={actionStatus.status === "pending"}
                      className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Pause className="w-4 h-4" />
                      Pause
                    </button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Fee Management */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-800 rounded-xl p-6 border border-slate-700"
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-yellow-400" />
                Fee Management
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    New Fee Percentage
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={newFeePercent}
                      onChange={(e) => setNewFeePercent(e.target.value)}
                      placeholder="2.5"
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleUpdateFee}
                      disabled={
                        !newFeePercent || actionStatus.status === "pending"
                      }
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      Update
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter percentage (0-10%)
                  </p>
                </div>

                <button
                  onClick={handleWithdrawFees}
                  disabled={
                    !stats ||
                    parseFloat(stats.totalFeesCollected) === 0 ||
                    actionStatus.status === "pending"
                  }
                  className="w-full bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Wallet className="w-4 h-4" />
                  Withdraw All Fees (
                  {stats?.totalFeesCollected
                    ? `${parseFloat(
                        weiToBdag(stats.totalFeesCollected)
                      ).toFixed(4)} BDAG`
                    : "0 BDAG"}
                  )
                </button>
              </div>
            </motion.div>
          </div>

          {/* Contract Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-slate-800 rounded-xl p-6 border border-slate-700"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-400" />
              Contract Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Contract Address</p>
                <p className="font-mono text-white break-all">
                  {contractAddress}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Owner</p>
                <p className="font-mono text-white">
                  {stats?.owner ? formatAddress(stats.owner) : "Loading..."}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
