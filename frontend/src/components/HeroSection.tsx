import React from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  BarChart3,
  Coins,
  Zap,
  Star,
  Shield,
  Globe,
  Users,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";

interface HeroSectionProps {
  account: string | null;
}

const HeroSection: React.FC<HeroSectionProps> = ({ account }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main content container */}
      <div className="relative z-10 container mx-auto px-10 py-4 flex items-center min-h-screen">
        <div className="grid lg:grid-cols-2 gap-16 items-center w-full">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Main heading */}
            <motion.h1
              className="text-6xl lg:text-7xl font-bold text-white leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Web 3.0
              </span>
              <br />
              <span className="text-white">Marketplace</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-2xl lg:text-3xl text-white leading-relaxed max-w-2xl font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <span className="text-blue-300">Buy</span> &{" "}
              <span className="text-purple-300">sell</span> digital products
              securely on the{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-semibold">
                decentralized Web3
              </span>{" "}
              marketplace.
            </motion.p>

            {/* Features */}
            <motion.div
              className="flex flex-wrap gap-6 text-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {["BlockDAG", "MetaMask", "Low Gas Fees"].map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </motion.div>

            {/* Action buttons */}
            <motion.div
              className="flex gap-20 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <Link to={"/digital-marketplace"}>
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-14 py-5 rounded-2xl font-semibold flex items-center gap-3 transition-all duration-300 cursor-pointer"
                >
                  <ShoppingCart size={20} />
                  BUY
                </motion.button>
              </Link>
              <Link to={"/digital-marketplace-listing"}>
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-14 py-5 rounded-2xl font-semibold flex items-center gap-3 transition-all duration-300 cursor-pointer"
                >
                  <DollarSign size={20} />
                  SELL
                </motion.button>
              </Link>

              {/* <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(147, 51, 234, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold flex items-center gap-3 transition-all duration-300 cursor-pointer"
              >
                <DollarSign size={20} />
                SELL
              </motion.button> */}

              {/* Wallet Status */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mb-8"
              ></motion.div>
            </motion.div>
            {account ? (
              <div className="inline-flex items-center space-x-2 bg-green-600/20 border border-green-600/30 rounded-full px-6 py-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-medium">
                  Wallet Connected: {account.slice(0, 6)}...
                  {account.slice(-4)}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center space-x-2 bg-yellow-600/20 border border-yellow-600/30 rounded-full px-6 py-3">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span className="text-yellow-400 font-medium">
                  Please connect your wallet to continue
                </span>
              </div>
            )}
          </motion.div>

          {/* Right side - Modern Web3 Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative flex justify-center items-center h-96"
          >
            {/* Main Dashboard Container */}
            <motion.div
              animate={{
                y: [-10, 10, -10],
                rotateY: [0, 5, -5, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-80 h-80"
            >
              {/* Central Glass Panel */}
              <div className="absolute inset-0 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl">
                {/* Dashboard Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white font-semibold">
                        Digital Marketplace
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-xs">LIVE</span>
                    </div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6 space-y-4">
                  {/* Digital Product Categories */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Digital Art Card */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-400/30 rounded-xl p-3 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            🎨
                          </span>
                        </div>
                        <span className="text-purple-300 text-xs font-medium">
                          Digital Art
                        </span>
                      </div>
                      <div className="text-white text-sm font-bold">1,247</div>
                      <div className="text-green-400 text-xs">+12 new</div>
                    </motion.div>

                    {/* Music Card */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border border-blue-400/30 rounded-xl p-3 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            🎵
                          </span>
                        </div>
                        <span className="text-blue-300 text-xs font-medium">
                          Music
                        </span>
                      </div>
                      <div className="text-white text-sm font-bold">892</div>
                      <div className="text-green-400 text-xs">+8 new</div>
                    </motion.div>
                  </div>

                  {/* BlockDAG Network Card */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-xl p-4 backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                          <img
                            src="/_images_presskit_Symbol.svg"
                            alt="BlockDAG"
                            className="w-5 h-5 filter brightness-0 invert"
                          />
                        </div>
                        <div>
                          <div className="text-white font-semibold text-sm">
                            BlockDAG Network
                          </div>
                          <div className="text-purple-300 text-xs">
                            Powered by BlockDAG
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">Fast</div>
                        <div className="text-green-400 text-xs">Secure</div>
                      </div>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full w-4/5"></div>
                    </div>
                  </motion.div>

                  {/* Featured Digital Asset */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/20 rounded-xl p-4 backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">📱</span>
                        </div>
                        <div>
                          <div className="text-white font-semibold text-sm">
                            Mobile App
                          </div>
                          <div className="text-green-300 text-xs">Software</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">$29.99</div>
                        <div className="text-green-400 text-xs">Hot Item</div>
                      </div>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-1 rounded-full w-4/5"></div>
                    </div>
                  </motion.div>
                </div>

                {/* Floating Elements Around Dashboard */}
                <motion.div
                  animate={{
                    y: [-5, 5, -5],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg border border-white/20"
                >
                  <TrendingUp className="w-6 h-6 text-white" />
                </motion.div>

                <motion.div
                  animate={{
                    y: [5, -5, 5],
                    rotate: [0, -180, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                  className="absolute -bottom-4 -left-4 w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg border border-white/20"
                >
                  <Shield className="w-5 h-5 text-white" />
                </motion.div>

                <motion.div
                  animate={{
                    y: [-3, 3, -3],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                  }}
                  className="absolute top-1/2 -right-6 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg border border-white/20"
                >
                  <Star className="w-4 h-4 text-white" />
                </motion.div>
              </div>

              {/* Background Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-2xl -z-10"></div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
    </div>
  );
};

export default HeroSection;
