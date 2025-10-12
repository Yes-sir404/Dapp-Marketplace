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

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-8 py-0"
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

          {/* Right side - 3D Shopping bag and elements */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative flex justify-center items-center h-96"
          >
            {/* Market Stats Icon - Top Left */}
            <motion.div
              animate={{
                y: [-10, 10, -10],
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-10 left-10 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl opacity-90 flex items-center justify-center shadow-lg border border-white/20"
            >
              <BarChart3 className="w-8 h-8 text-white" />
            </motion.div>

            {/* Trending Up Icon - Top Right */}
            <motion.div
              animate={{
                y: [8, -8, 8],
                x: [-3, 3, -3],
                rotate: [0, -8, 8, 0],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8,
              }}
              className="absolute top-8 right-8 w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-full opacity-85 flex items-center justify-center shadow-lg border border-white/20"
            >
              <TrendingUp className="w-7 h-7 text-white" />
            </motion.div>

            {/* BlockDag Logo - Top right */}
            <motion.div
              animate={{
                y: [10, -10, 10],
                x: [-5, 5, -5],
                rotate: [0, 15, -15, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute top-20 right-16 w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl opacity-85 flex items-center justify-center border border-white/20 shadow-lg"
            >
              <img
                src="/_images_presskit_Symbol.svg"
                alt="BlockDag Network"
                className="w-9 h-9 filter brightness-0 invert"
              />
            </motion.div>

            {/* Coins Icon - Left side */}
            <motion.div
              animate={{
                y: [-8, 8, -8],
                rotate: [0, -10, 10, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="absolute bottom-16 left-16 w-20 h-12 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-2xl opacity-90 flex items-center justify-center shadow-lg border border-white/20"
            >
              <Coins className="w-8 h-8 text-white" />
            </motion.div>

            {/* Shield Icon - Security */}
            <motion.div
              animate={{
                y: [5, -5, 5],
                rotate: [0, 5, -5, 0],
                scale: [1, 1.08, 1],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.2,
              }}
              className="absolute top-32 left-4 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full opacity-85 flex items-center justify-center shadow-lg border border-white/20"
            >
              <Shield className="w-6 h-6 text-white" />
            </motion.div>

            {/* Globe Icon - Global Market */}
            <motion.div
              animate={{
                y: [-6, 6, -6],
                x: [2, -2, 2],
                rotate: [0, 360],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear",
                delay: 2.5,
              }}
              className="absolute bottom-8 left-4 w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full opacity-80 flex items-center justify-center shadow-lg border border-white/20"
            >
              <Globe className="w-7 h-7 text-white" />
            </motion.div>

            {/* Main Shopping Cart Logo */}
            <motion.div
              animate={{
                y: [-15, 15, -15],
                rotateY: [0, 10, -10, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative"
            >
              <div className="w-48 h-56 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-600 rounded-3xl relative shadow-2xl flex items-center justify-center">
                {/* Large Shopping Cart Icon */}
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                  className="relative z-10"
                >
                  <ShoppingCart className="w-24 h-24 text-white drop-shadow-lg" />
                </motion.div>

                {/* Cart highlight effect */}
                <div className="absolute top-8 left-8 w-16 h-20 bg-white opacity-20 rounded-2xl blur-sm"></div>
                <div className="absolute bottom-8 right-8 w-12 h-16 bg-white opacity-15 rounded-xl blur-sm"></div>

                {/* Floating particles around cart */}
                {[...Array(12)].map((_, i) => (
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
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2 + Math.random(),
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}

                {/* Floating market icons around cart */}
                {[
                  { icon: DollarSign, delay: 0, size: "w-3 h-3" },
                  { icon: TrendingUp, delay: 0.5, size: "w-3 h-3" },
                  { icon: Coins, delay: 1, size: "w-3 h-3" },
                  { icon: Star, delay: 1.5, size: "w-3 h-3" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-white opacity-70"
                    style={{
                      left: `${10 + Math.random() * 80}%`,
                      top: `${10 + Math.random() * 80}%`,
                    }}
                    animate={{
                      y: [-8, 8, -8],
                      x: [-4, 4, -4],
                      rotate: [0, 15, -15, 0],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: item.delay,
                    }}
                  >
                    <item.icon className={item.size} />
                  </motion.div>
                ))}

                {/* Cart glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-3xl blur-xl"></div>
              </div>
            </motion.div>

            {/* BlockDag Network Logo */}
            <motion.div
              animate={{
                y: [5, -15, 5],
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute bottom-10 right-10 w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl opacity-90 flex items-center justify-center border border-white/20 shadow-lg"
            >
              <img
                src="/_images_presskit_Symbol.svg"
                alt="BlockDag Network"
                className="w-10 h-10 filter brightness-0 invert"
              />
            </motion.div>

            {/* Users Icon - Community */}
            <motion.div
              animate={{
                y: [-8, 8, -8],
                x: [-3, 3, -3],
                rotate: [0, 180, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
              className="absolute top-32 right-32 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full opacity-85 flex items-center justify-center shadow-lg border border-white/20"
            >
              <Users className="w-6 h-6 text-white" />
            </motion.div>

            {/* Zap Icon - Fast Transactions */}
            <motion.div
              animate={{
                y: [3, -3, 3],
                rotate: [0, 10, -10, 0],
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 3.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.8,
              }}
              className="absolute top-16 right-4 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-90 flex items-center justify-center shadow-lg border border-white/20"
            >
              <Zap className="w-5 h-5 text-white" />
            </motion.div>

            {/* Activity Icon - Real-time */}
            <motion.div
              animate={{
                y: [-4, 4, -4],
                x: [1, -1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 3,
              }}
              className="absolute bottom-4 right-4 w-11 h-11 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full opacity-85 flex items-center justify-center shadow-lg border border-white/20"
            >
              <Activity className="w-5 h-5 text-white" />
            </motion.div>

            {/* Star Icon - Premium */}
            <motion.div
              animate={{
                y: [2, -2, 2],
                rotate: [0, 15, -15, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
              }}
              className="absolute top-4 left-32 w-9 h-9 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full opacity-90 flex items-center justify-center shadow-lg border border-white/20"
            >
              <Star className="w-4 h-4 text-white" />
            </motion.div>

            {/* Connection Lines - Animated */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
              <motion.path
                d="M 50 50 Q 100 100 150 50 T 250 100"
                stroke="url(#gradient1)"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.path
                d="M 200 200 Q 150 150 100 200 T 50 150"
                stroke="url(#gradient2)"
                strokeWidth="1.5"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
              />
              <defs>
                <linearGradient
                  id="gradient1"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient
                  id="gradient2"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.3" />
                </linearGradient>
              </defs>
            </svg>

            {/* Floating Data Points */}
            {[
              {
                value: "$2.4M",
                color: "from-green-400 to-emerald-500",
                delay: 0,
              },
              { value: "15K+", color: "from-blue-400 to-cyan-500", delay: 0.8 },
              {
                value: "8K+",
                color: "from-purple-400 to-pink-500",
                delay: 1.6,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className={`absolute bg-gradient-to-r ${item.color} text-white text-xs font-bold px-2 py-1 rounded-full opacity-80 shadow-lg`}
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                }}
                animate={{
                  y: [-5, 5, -5],
                  x: [-2, 2, -2],
                  opacity: [0.8, 1, 0.8],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: item.delay,
                }}
              >
                {item.value}
              </motion.div>
            ))}

            {/* Pulsing Rings - Network Effect */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-blue-400/30 rounded-full"
                style={{
                  width: `${120 + i * 40}px`,
                  height: `${120 + i * 40}px`,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.1, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5,
                }}
              />
            ))}

            {/* Floating Market Indicators */}
            {[
              { text: "LIVE", color: "text-red-400", delay: 0 },
              { text: "HOT", color: "text-orange-400", delay: 1 },
              { text: "NEW", color: "text-green-400", delay: 2 },
            ].map((item, i) => (
              <motion.div
                key={i}
                className={`absolute text-xs font-bold ${item.color} bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm`}
                style={{
                  left: `${15 + Math.random() * 70}%`,
                  top: `${15 + Math.random() * 70}%`,
                }}
                animate={{
                  y: [-3, 3, -3],
                  opacity: [0.7, 1, 0.7],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: item.delay,
                }}
              >
                {item.text}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
    </div>
  );
};

export default HeroSection;
