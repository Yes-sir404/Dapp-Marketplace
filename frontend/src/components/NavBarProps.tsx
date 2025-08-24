import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface NavbarProps {
  account: string | null;
  onConnectWallet: () => void;
  isConnecting: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  account,
  onConnectWallet,
  isConnecting,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth", // smooth animation
        block: "start", // align to top of viewport
      });
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-gray-900/80 backdrop-blur-lg border-b border-gray-800/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-white text-xl font-bold">MetaSou9</span>
          </motion.div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <motion.a
              whileHover={{ scale: 1.05 }}
              className="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer"
              onClick={() => scrollToSection("#Home")}
            >
              Home
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              className="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer"
              onClick={() => scrollToSection("#HowItWorksSection")}
            >
              How It Works
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              className="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer"
              onClick={() => scrollToSection("#TrendingAssetsSection")}
            >
              Trending
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              className="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer"
              onClick={() => scrollToSection("#WhyChooseSection")}
            >
              Features
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              className="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer"
              onClick={() => scrollToSection("#TestimonialsSection")}
            >
              Community
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              className="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer"
              onClick={() => scrollToSection("#Contact")}
            >
              Contact
            </motion.a>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-green-400 font-semibold cursor-pointer"
            >
              ● BlockDag
            </motion.div>
          </div>

          {/* Wallet Connection Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onConnectWallet}
            disabled={isConnecting}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
              account
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            } ${isConnecting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isConnecting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Connecting...</span>
              </div>
            ) : account ? (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>{formatAddress(account)}</span>
              </div>
            ) : (
              "Connect Wallet"
            )}
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
