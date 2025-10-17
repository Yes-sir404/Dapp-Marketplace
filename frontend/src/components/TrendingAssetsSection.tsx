import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Music,
  BookOpen,
  Zap,
  TrendingUp,
  Eye,
  Clock,
  Users,
} from "lucide-react";
import { Link } from "react-router";

const TrendingAssetsSection: React.FC = () => {
  const [, setCurrentSlide] = useState(0);

  const assets = [
    {
      id: 1,
      title: "The NFT Art of 2099",
      author: "CryptoArtist",
      price: "2.5 BDAG",
      usdPrice: "$120",
      category: "Digital Art",
      categoryIcon: Download,
      trending: true,
      gradient: "from-purple-500 via-pink-500 to-blue-500",
      iconColor: "text-purple-400",
      views: "12.4K",
      timeAgo: "2 hours ago",
      sales: "47",
    },
    {
      id: 2,
      title: "Lo-fi Beats Vol. 3",
      author: "BeatCreator",
      price: "0.8 BDAG",
      usdPrice: "$40",
      category: "Music",
      categoryIcon: Music,
      trending: true,
      gradient: "from-blue-500 via-cyan-500 to-purple-500",
      iconColor: "text-blue-400",
      views: "8.9K",
      timeAgo: "4 hours ago",
      sales: "23",
    },
    {
      id: 3,
      title: "Crypto Trading 2025",
      author: "TradingPro",
      price: "1.2 BDAG",
      usdPrice: "$57",
      category: "eBook",
      categoryIcon: BookOpen,
      trending: false,
      gradient: "from-purple-500 via-blue-500 to-indigo-500",
      iconColor: "text-indigo-400",
      views: "15.2K",
      timeAgo: "1 day ago",
      sales: "89",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % assets.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + assets.length) % assets.length);
  };

  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 bg-dot-pattern"></div>

      {/* Subtle Grid Lines */}
      <div className="absolute inset-0 opacity-10 bg-grid-pattern"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">
              Trending Now
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Hot
            </span>{" "}
            Digital Assets
          </h2>

          <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Discover the most popular and trending digital goods on our
            marketplace. From exclusive NFT art to premium music beats, find
            your next digital treasure.
          </p>
        </motion.div>

        {/* Assets Showcase */}
        <div className="relative">
          {/* Navigation Buttons */}
          <motion.button
            onClick={prevSlide}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 lg:w-14 h-12 lg:h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full items-center justify-center text-white hover:bg-white/20 transition-all duration-300 shadow-2xl"
          >
            <ChevronLeft size={24} />
          </motion.button>

          <motion.button
            onClick={nextSlide}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 lg:w-14 h-12 lg:h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full items-center justify-center text-white hover:bg-white/20 transition-all duration-300 shadow-2xl"
          >
            <ChevronRight size={24} />
          </motion.button>

          {/* Assets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-0 sm:px-6 lg:px-20">
            {assets.map((asset, index) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 60, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -20, scale: 1.05 }}
                className="group relative"
              >
                {/* Main Card */}
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-500 shadow-2xl">
                  {/* Card Header with Gradient */}
                  <div
                    className={`relative h-56 sm:h-64 lg:h-80 bg-gradient-to-br ${asset.gradient} overflow-hidden`}
                  >
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent"></div>
                    </div>

                    {/* Trending Badge */}
                    {asset.trending && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="absolute top-6 left-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        Trending
                      </motion.div>
                    )}

                    {/* Category Icon */}
                    <div className="absolute top-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30">
                      <asset.categoryIcon size={24} className="text-white" />
                    </div>

                    {/* Large Center Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        transition={{ duration: 0.3 }}
                        className="w-32 h-32 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/20"
                      >
                        <asset.categoryIcon
                          size={64}
                          className="text-white/60"
                        />
                      </motion.div>
                    </div>

                    {/* Floating Stats */}
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 bg-black/30 backdrop-blur-xl rounded-full px-3 py-1 border border-white/20">
                          <Eye className="w-4 h-4 text-white/80" />
                          <span className="text-white/80 text-sm font-medium">
                            {asset.views}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 bg-black/30 backdrop-blur-xl rounded-full px-3 py-1 border border-white/20">
                          <Users className="w-4 h-4 text-white/80" />
                          <span className="text-white/80 text-sm font-medium">
                            {asset.sales}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-black/30 backdrop-blur-xl rounded-full px-3 py-1 border border-white/20">
                        <Clock className="w-4 h-4 text-white/80" />
                        <span className="text-white/80 text-sm font-medium">
                          {asset.timeAgo}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 sm:p-8">
                    {/* Category Badge */}
                    <div className="mb-6">
                      <span
                        className={`inline-flex items-center gap-2 ${asset.iconColor} bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full text-sm font-medium border border-white/20`}
                      >
                        <asset.categoryIcon size={16} />
                        {asset.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                      {asset.title}
                    </h3>

                    {/* Author */}
                    <p className="text-gray-300 text-base sm:text-lg mb-6">
                      by{" "}
                      <span className="text-white font-medium">
                        {asset.author}
                      </span>
                    </p>

                    {/* Price Section */}
                    <div className="mb-8">
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-2xl sm:text-3xl font-bold text-white">
                          {asset.price}
                        </span>
                        <span className="text-gray-400 text-base sm:text-lg">
                          {asset.usdPrice}
                        </span>
                      </div>
                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "75%" }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Buy Button */}
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 relative overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <Zap className="w-5 h-5" />
                        Buy Now
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    </motion.button>
                  </div>
                </div>

                {/* Glow Effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${asset.gradient} opacity-0 group-hover:opacity-20 blur-xl -z-10 transition-opacity duration-500`}
                ></div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/digital-marketplace"
              className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/30 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:bg-white/20 shadow-2xl"
            >
              <TrendingUp className="w-5 h-5" />
              Explore All Digital Assets
              <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrendingAssetsSection;
