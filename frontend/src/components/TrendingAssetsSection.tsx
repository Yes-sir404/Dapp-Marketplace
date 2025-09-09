import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  Download,
  Gamepad2,
  BookOpen,
} from "lucide-react";
import { Link } from "react-router";

const TrendingAssetsSection: React.FC = () => {
  const [, setCurrentSlide] = useState(0);

  const assets = [
    {
      id: 1,
      title: "The NFT Art of 2099",
      author: "CryptoArtist",
      price: "2.5 ETH",
      usdPrice: "$4,750",
      category: "Digital Art",
      categoryIcon: Download,
      likes: 234,
      trending: true,
      gradient: "from-purple-500 via-pink-500 to-blue-500",
      iconColor: "text-purple-400",
    },
    {
      id: 2,
      title: "Lo-fi Beats Vol. 3",
      author: "BeatCreator",
      price: "0.8 ETH",
      usdPrice: "$1,520",
      category: "Music",
      categoryIcon: Gamepad2,
      likes: 189,
      trending: true,
      gradient: "from-blue-500 via-cyan-500 to-purple-500",
      iconColor: "text-blue-400",
    },
    {
      id: 3,
      title: "Crypto Trading Guide 2024",
      author: "TradingPro",
      price: "1.2 ETH",
      usdPrice: "$570",
      category: "eBook",
      categoryIcon: BookOpen,
      likes: 156,
      trending: false,
      gradient: "from-purple-500 via-blue-500 to-indigo-500",
      iconColor: "text-indigo-400",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % assets.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + assets.length) % assets.length);
  };

  return (
    <section className="py-20 px-8 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Trending
            </span>{" "}
            Digital Assets
          </h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
            Discover the most popular digital goods on our marketplace. From NFT
            art to music beats, find your next digital treasure.
          </p>
        </motion.div>

        {/* Assets Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-gray-800/80 hover:bg-gray-700/80 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-all duration-300 hover:scale-110"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-gray-800/80 hover:bg-gray-700/80 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-all duration-300 hover:scale-110"
          >
            <ChevronRight size={20} />
          </button>

          {/* Assets Grid */}
          <div className="grid md:grid-cols-3 gap-8 px-16">
            {assets.map((asset, index) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-gray-800/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-500 group"
              >
                {/* Card Image/Preview */}
                <div
                  className={`relative h-64 bg-gradient-to-br ${asset.gradient} flex items-center justify-center`}
                >
                  {/* Trending Badge */}
                  {asset.trending && (
                    <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Trending
                    </div>
                  )}

                  {/* Heart Icon */}
                  <button className="absolute top-4 right-4 p-2 bg-black/20 rounded-full backdrop-blur-sm hover:bg-black/40 transition-all duration-300">
                    <Heart size={18} className="text-white" />
                  </button>

                  {/* Large Icon in center */}
                  <asset.categoryIcon size={80} className="text-white/30" />
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {/* Category Badge */}
                  <div className="mb-4">
                    <span
                      className={`inline-flex items-center gap-2 ${asset.iconColor} bg-gray-700/50 px-3 py-1 rounded-full text-xs font-medium`}
                    >
                      <asset.categoryIcon size={14} />
                      {asset.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">
                    {asset.title}
                  </h3>

                  {/* Author */}
                  <p className="text-gray-400 text-sm mb-4">
                    by {asset.author}
                  </p>

                  {/* Price and Stats */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold text-lg">
                        {asset.price}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {asset.usdPrice}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <Heart size={14} />
                      <span>{asset.likes}</span>
                    </div>
                  </div>

                  {/* Buy Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full mt-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                  >
                    ⚡ Buy Now
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            to="/digital-marketplace"
            className="text-purple-400 hover:text-purple-300 font-semibold underline decoration-purple-400/50 hover:decoration-purple-300 transition-all duration-300"
          >
            View All Digital Assets
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default TrendingAssetsSection;
