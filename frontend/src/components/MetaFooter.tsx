import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star, Github, Twitter, Instagram, Wallet } from "lucide-react";
interface FooterProps {
  account: string | null;
  onConnectWallet: () => void;
  isConnecting: boolean;
}

const platformLinks = [
  { name: "Marketplace", href: "#" },
  { name: "How It Works", href: "#" },
  { name: "About", href: "#" },
  { name: "Creator Tools", href: "#" },
];

const legalLinks = [
  { name: "Terms of Service", href: "#" },
  { name: "Privacy Policy", href: "#" },
  { name: "Contact", href: "#" },
  { name: "Support", href: "#" },
];

const socialLinks = [
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
];
const MetaFooter: React.FC<FooterProps> = ({
  account,
  onConnectWallet,
  isConnecting,
}) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  return (
    <>
      <footer className="bg-gray-900/80 backdrop-blur-xl border-t border-gray-700/50 text-white px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="md:col-span-1"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-tr from-blue-500 to-purple-600 rounded-xl w-10 h-10 flex items-center justify-center font-bold text-lg text-white shadow-lg">
                  M9
                </div>
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-extrabold text-xl">
                  MetaSou9
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                The decentralized Web3 marketplace for digital goods. Own,
                trade, and thrive in the new economy.
              </p>
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
            </motion.div>

            {/* Platform Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-3">
                {platformLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-purple-400 transition-colors duration-300 text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Legal Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-3">
                {legalLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-purple-400 transition-colors duration-300 text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Community & Quick Connect */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="text-white font-semibold mb-4">Community</h3>
              <div className="flex gap-3 mb-6">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 bg-gray-700/50 hover:bg-purple-500/20 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <social.icon
                      size={18}
                      className="text-gray-400 hover:text-purple-400"
                    />
                  </a>
                ))}
              </div>

              {/* Quick Connect */}
              <div>
                <h4 className="text-white font-medium mb-3 text-sm">
                  Quick Connect
                </h4>
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
            </motion.div>
          </div>

          {/* Bottom Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="border-t border-gray-700/50 pt-8 mt-12 flex flex-col md:flex-row justify-between items-center gap-4"
          >
            <div className="text-gray-400 text-sm">
              © 2024 MetaSou9. All rights reserved. Built on Ethereum.
            </div>

            {/* Blockchain Badges */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-blue-400 text-xs font-medium">
                  Ethereum
                </span>
              </div>
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-400/20 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400 text-xs font-medium">ENS</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-400/20 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-purple-400 text-xs font-medium">
                  WalletConnect
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </footer>
    </>
  );
};
export default MetaFooter;
