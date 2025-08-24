// src/components/MarketplaceStats.tsx
import React, { useState, useEffect } from "react";
import {
  useMarketplace,
  type MarketplaceStats,
} from "../../hooks/useMarketplace";

export const MarketplaceStatsComponent: React.FC = () => {
  const { getMarketplaceStats } = useMarketplace();
  const [stats, setStats] = useState<MarketplaceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const marketplaceStats = await getMarketplaceStats();
      setStats(marketplaceStats);
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading stats... ⏳</div>;
  }

  if (!stats) {
    return (
      <div className="text-center p-4 text-red-500">Failed to load stats</div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-center">
        Marketplace Statistics
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded">
          <div className="text-2xl font-bold text-blue-600">
            {stats.totalProducts}
          </div>
          <div className="text-sm text-gray-600">Total Products</div>
        </div>

        <div className="text-center p-4 bg-green-50 rounded">
          <div className="text-2xl font-bold text-green-600">
            {stats.totalSales}
          </div>
          <div className="text-sm text-gray-600">Products Sold</div>
        </div>

        <div className="text-center p-4 bg-purple-50 rounded">
          <div className="text-2xl font-bold text-purple-600">
            {stats.totalFeesCollected}
          </div>
          <div className="text-sm text-gray-600">ETH Fees Collected</div>
        </div>

        <div className="text-center p-4 bg-orange-50 rounded">
          <div className="text-2xl font-bold text-orange-600">
            {stats.currentFeePercent}%
          </div>
          <div className="text-sm text-gray-600">Marketplace Fee</div>
        </div>
      </div>

      <button
        onClick={loadStats}
        className="mt-4 w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
      >
        Refresh Stats
      </button>
    </div>
  );
};
