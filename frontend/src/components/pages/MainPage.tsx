import { motion } from "framer-motion";
import Navbar from "../NavBarProps.tsx";
import { useWallet } from "../../hooks/useWallet.ts";
import Web3Marketplace from "../HeroSection.tsx";
import HowItWorksSection from "../HowItWorksSection.tsx";
import TrendingAssetsSection from "../TrendingAssetsSection.tsx";
import WhyChooseSection from "../WhyChooseSection.tsx";
import MetaFooter from "../MetaFooter.tsx";
import TestimonialsSection from "../TestimonialsSection.tsx";

function MainPage() {
  const { account, connectWallet, isConnecting, error } = useWallet();
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Ethereum Logo */}

      <Navbar
        account={account}
        onConnectWallet={connectWallet}
        isConnecting={isConnecting}
      />

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-40"
        >
          {error}
        </motion.div>
      )}

      {/* Main Content */}
      <main className="pt-16">
        <div id="#Home">
          <Web3Marketplace account={account} />
        </div>
        <div id="#HowItWorksSection">
          <HowItWorksSection />
        </div>
        <div id="#TrendingAssetsSection">
          <TrendingAssetsSection />
        </div>
        <div id="#WhyChooseSection">
          <WhyChooseSection />
        </div>
        <div id="#TestimonialsSection">
          <TestimonialsSection />
        </div>
        <div id="#Contact">
          <MetaFooter
            account={account}
            onConnectWallet={connectWallet}
            isConnecting={isConnecting}
          />
        </div>
      </main>
    </div>
  );
}

export default MainPage;
