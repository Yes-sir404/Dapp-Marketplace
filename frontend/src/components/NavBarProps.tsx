import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  ChevronDown,
  ShoppingBag,
  ShoppingCart,
  UserCog,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useWallet } from "../hooks/useWallet";
import { useMarketplace } from "../hooks/useMarketplace";

interface NavbarProps {
  account: string | null;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  isConnecting: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  account,
  onConnectWallet,
  onDisconnectWallet,
  isConnecting,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDashOpen, setIsDashOpen] = useState(false);
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dashboardMenuRef = useRef<HTMLDivElement | null>(null);
  const walletMenuRef = useRef<HTMLDivElement | null>(null);
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

  // Close wallet menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        walletMenuRef.current &&
        !walletMenuRef.current.contains(event.target as Node)
      ) {
        setIsWalletMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

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
      } catch {
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
      <div className="w-full">
        <div className="flex items-center justify-between h-16 px-2 sm:px-4 lg:px-6">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-2xl font-bold">MetaMarket</span>
          </motion.div>

          {/* Desktop Navigation - Center */}
          <div className="hidden lg:flex items-center">
            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              <motion.a
                whileHover={{ scale: 1.05 }}
                className="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer px-3 py-2 whitespace-nowrap"
                onClick={() => scrollToSection("#Home")}
              >
                Home
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                className="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer px-3 py-2 whitespace-nowrap"
                onClick={() => scrollToSection("#HowItWorksSection")}
              >
                How It Works
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                className="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer px-3 py-2 whitespace-nowrap"
                onClick={() => scrollToSection("#TrendingAssetsSection")}
              >
                Trending
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                className="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer px-3 py-2 whitespace-nowrap"
                onClick={() => scrollToSection("#WhyChooseSection")}
              >
                Features
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                className="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer px-3 py-2 whitespace-nowrap"
                onClick={() => scrollToSection("#TestimonialsSection")}
              >
                Community
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                className="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer px-3 py-2 whitespace-nowrap"
                onClick={() => scrollToSection("#Contact")}
              >
                Contact
              </motion.a>
            </div>
          </div>

          {/* Right side - Dashboard, BlockDAG, Wallet */}
          <div className="flex items-center space-x-4">
            {/* Dashboard Links (when connected) */}
            {account && (
              <div className="relative" ref={dashboardMenuRef}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIsDashOpen((v) => !v)}
                  className="px-4 py-2 text-purple-300 hover:text-purple-200 transition-colors duration-200 inline-flex items-center gap-2 rounded-lg hover:bg-purple-500/10 whitespace-nowrap"
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
            )}

            {/* BlockDAG Network Badge */}
            <motion.a
              href="https://blockdag.network/"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              className="hidden sm:flex items-center space-x-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 hover:bg-green-500/20 transition-colors duration-200 cursor-pointer"
            >
              <img
                src="/_images_presskit_Symbol.svg"
                alt="BlockDAG"
                className="w-4 h-4"
              />
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">BlockDAG</span>
            </motion.a>

            {/* Wallet Connection Button */}
            {account ? (
              <div className="relative" ref={walletMenuRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
                  className="px-4 sm:px-6 py-2 rounded-full font-medium transition-all duration-200 bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2 text-sm sm:text-base whitespace-nowrap"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="hidden sm:inline">
                    {formatAddress(account)}
                  </span>
                  <span className="sm:hidden">Wallet</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isWalletMenuOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </motion.button>
                {isWalletMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur border border-gray-800 rounded-xl shadow-xl overflow-hidden"
                  >
                    <div className="py-2">
                      <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-800">
                        <div className="font-medium text-white">
                          Connected Wallet
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {account}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          onDisconnectWallet();
                          setIsWalletMenuOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-300 hover:bg-gray-800 hover:text-red-200 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Disconnect Wallet
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onConnectWallet}
                disabled={isConnecting}
                className={`px-4 sm:px-6 py-2 rounded-full font-medium transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base whitespace-nowrap ${
                  isConnecting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isConnecting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">Connecting...</span>
                    <span className="sm:hidden">...</span>
                  </div>
                ) : (
                  <>
                    <span className="hidden sm:inline">Connect Wallet</span>
                    <span className="sm:hidden">Connect</span>
                  </>
                )}
              </motion.button>
            )}

            {/* Mobile menu button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-700/50"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-gray-900/95 backdrop-blur border-t border-gray-800"
          >
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Navigation Links */}
              <motion.a
                whileHover={{ scale: 1.02 }}
                className="block text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer py-2"
                onClick={() => {
                  scrollToSection("#Home");
                  setIsMobileMenuOpen(false);
                }}
              >
                Home
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.02 }}
                className="block text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer py-2"
                onClick={() => {
                  scrollToSection("#HowItWorksSection");
                  setIsMobileMenuOpen(false);
                }}
              >
                How It Works
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.02 }}
                className="block text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer py-2"
                onClick={() => {
                  scrollToSection("#TrendingAssetsSection");
                  setIsMobileMenuOpen(false);
                }}
              >
                Trending
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.02 }}
                className="block text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer py-2"
                onClick={() => {
                  scrollToSection("#WhyChooseSection");
                  setIsMobileMenuOpen(false);
                }}
              >
                Features
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.02 }}
                className="block text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer py-2"
                onClick={() => {
                  scrollToSection("#TestimonialsSection");
                  setIsMobileMenuOpen(false);
                }}
              >
                Community
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.02 }}
                className="block text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer py-2"
                onClick={() => {
                  scrollToSection("#Contact");
                  setIsMobileMenuOpen(false);
                }}
              >
                Contact
              </motion.a>

              {/* Mobile Dashboard Links */}
              {account && (
                <div className="border-t border-gray-800 pt-4 mt-4">
                  <div className="text-purple-300 font-medium mb-2">
                    Dashboards
                  </div>
                  <Link
                    to="/seller-dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer rounded-lg mb-2"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    My Products
                  </Link>
                  <Link
                    to="/buyer-dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer rounded-lg mb-2"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    My Orders
                  </Link>
                  {isOwner && (
                    <Link
                      to="/moul_shi"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-purple-300 hover:bg-gray-800 hover:text-purple-200 transition-colors cursor-pointer rounded-lg"
                    >
                      <UserCog className="w-4 h-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                </div>
              )}

              {/* Mobile BlockDag indicator */}
              <div className="border-t border-gray-800 pt-4 mt-4">
                <div className="text-green-400 font-semibold">
                  ● BlockDag Network
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
