import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  ChevronDown,
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  UserCog,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useWallet } from "../hooks/useWallet";
import { useMarketplace } from "../hooks/useMarketplace";

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
  const [isDashOpen, setIsDashOpen] = useState(false);
  const dashboardMenuRef = useRef<HTMLDivElement | null>(null);
  const { signer } = useWallet();
  const { getContractOwner } = useMarketplace(signer);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dashboards dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dashboardMenuRef.current &&
        !dashboardMenuRef.current.contains(event.target as Node)
      ) {
        setIsDashOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine if connected account is contract owner
  useEffect(() => {
    let cancelled = false;
    const checkOwner = async () => {
      try {
        if (!account || !signer) {
          if (!cancelled) setIsOwner(false);
          return;
        }
        const owner = await getContractOwner();
        if (!cancelled) {
          setIsOwner(owner.toLowerCase() === account.toLowerCase());
        }
      } catch (e) {
        if (!cancelled) setIsOwner(false);
      }
    };
    checkOwner();
    return () => {
      cancelled = true;
    };
  }, [account, signer, getContractOwner]);

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
          </div>

          {/* Dashboard Links (when connected) */}
          {account && (
            <div className="hidden md:flex items-center space-x-4 mr-4">
              {/* <Link to="/digital-marketplace">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 text-green-300 hover:text-black transition-colors duration-200"
                >
                  Marketplace
                </motion.button>
              </Link> */}
              <div className="relative" ref={dashboardMenuRef}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIsDashOpen((v) => !v)}
                  className="px-4 py-2 text-purple-300 hover:text-purple-200 transition-colors duration-200 inline-flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Dashboards
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isDashOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </motion.button>
                {isDashOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur border border-gray-800 rounded-xl shadow-xl overflow-hidden"
                  >
                    <div className="py-2">
                      <Link
                        to="/seller-dashboard"
                        onClick={() => setIsDashOpen(false)}
                      >
                        <div className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer rounded-lg">
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          My Products
                        </div>
                      </Link>
                      <Link
                        to="/buyer-dashboard"
                        onClick={() => setIsDashOpen(false)}
                      >
                        <div className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer rounded-lg">
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          My Orders
                        </div>
                      </Link>
                      {isOwner && (
                        <Link
                          to="/moul_shi"
                          onClick={() => setIsDashOpen(false)}
                        >
                          <div className="flex items-center gap-2 px-4 py-2 text-sm text-purple-300 hover:bg-gray-800 hover:text-purple-200 transition-colors cursor-pointer border-t border-gray-800">
                            <UserCog className="w-4 h-4" />{" "}
                            <span>Admin Dashboard</span>
                          </div>
                        </Link>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-green-400 font-semibold cursor-pointer"
          >
            ● BlockDag
          </motion.div>

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
