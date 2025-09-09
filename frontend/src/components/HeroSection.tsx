import React from "react";
import { motion } from "framer-motion";
import { ShoppingCart, DollarSign } from "lucide-react";
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
      <div className="relative z-10 container mx-auto px-6 py-20 flex items-center min-h-screen">
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
              className="text-xl text-gray-300 leading-relaxed max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Buy & sell digital products securely on the decentralized Web3
              marketplace.
            </motion.p>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-8 py-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div>
                <div className="text-3xl font-bold text-blue-400">$2.4M+</div>
                <div className="text-sm text-gray-400 mt-1">Volume Traded</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400">15K+</div>
                <div className="text-sm text-gray-400 mt-1">Digital Assets</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-pink-400">8K+</div>
                <div className="text-sm text-gray-400 mt-1">Active Users</div>
              </div>
            </motion.div>

            {/* Features */}
            <motion.div
              className="flex flex-wrap gap-6 text-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {["ENS Support", "Multi-Wallet", "Low Gas Fees"].map(
                (feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300">{feature}</span>
                  </div>
                )
              )}
            </motion.div>

            {/* Action buttons */}
            <motion.div
              className="flex gap-4 pt-4"
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
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold flex items-center gap-3 transition-all duration-300 cursor-pointer"
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
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold flex items-center gap-3 transition-all duration-300 cursor-pointer"
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

          {/* Right side - 3D Shopping bag and elements */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative flex justify-center items-center h-96"
          >
            {/* Floating elements around the bag */}
            <motion.div
              animate={{
                y: [-10, 10, -10],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-10 left-10 w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl opacity-80 flex items-center justify-center"
            >
              <div className="w-8 h-8 bg-white rounded-lg opacity-50"></div>
            </motion.div>

            <motion.div
              animate={{
                y: [10, -10, 10],
                x: [-5, 5, -5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute top-20 right-16 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full opacity-70"
            />

            <motion.div
              animate={{
                y: [-8, 8, -8],
                rotate: [0, -10, 10, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="absolute bottom-16 left-16 w-20 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl opacity-60"
            />

            {/* Main shopping bag */}
            <motion.div
              animate={{
                y: [-15, 15, -15],
                rotateY: [0, 10, -10, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative"
            >
              <div className="w-48 h-56 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-600 rounded-3xl relative shadow-2xl">
                {/* Bag handles */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-20 h-8">
                  <div className="w-6 h-8 bg-gradient-to-b from-purple-400 to-purple-600 rounded-t-full absolute left-0"></div>
                  <div className="w-6 h-8 bg-gradient-to-b from-purple-400 to-purple-600 rounded-t-full absolute right-0"></div>
                </div>

                {/* Bag highlight */}
                <div className="absolute top-8 left-8 w-16 h-20 bg-white opacity-20 rounded-2xl blur-sm"></div>

                {/* Floating particles around bag */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full opacity-60"
                    style={{
                      left: `${-20 + Math.random() * 140}%`,
                      top: `${-20 + Math.random() * 140}%`,
                    }}
                    animate={{
                      y: [-10, 10, -10],
                      x: [-5, 5, -5],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 2 + Math.random(),
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Additional floating crypto elements */}
            <motion.div
              animate={{
                y: [5, -15, 5],
                rotate: [0, 360],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute bottom-10 right-10 w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-75 flex items-center justify-center"
            >
              <div className="w-8 h-8 bg-white rounded-full opacity-80"></div>
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
