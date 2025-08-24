import React from "react";
import { motion } from "framer-motion";
import { Wallet, Search, Shield } from "lucide-react";

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      icon: Wallet,
      title: "Connect Your Wallet",
      description:
        "Link your crypto wallet to start trading. We support MetaMask, WalletConnect, and more.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Search,
      title: "List or Explore Digital Goods",
      description:
        "Browse our marketplace for unique digital assets or list your own creations to earn crypto.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Shield,
      title: "Complete Secure Transactions",
      description:
        "Execute trustless, decentralized transactions with smart contract security and transparency.",
      color: "from-green-500 to-green-600",
    },
  ];

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
            How{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              MetaSou9
            </span>{" "}
            Works
          </h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
            Get started with Web3 trading in three simple steps. Our platform
            makes it easy to buy, sell, and trade digital assets securely.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 text-center hover:border-purple-500/30 transition-all duration-500"
            >
              {/* Icon */}
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center shadow-lg`}
              >
                <step.icon size={28} className="text-white" />
              </motion.div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-4">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-gray-400 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 bg-purple-500/20 border border-purple-400/30 px-6 py-3 rounded-full backdrop-blur-sm">
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
            <span className="text-purple-300 font-medium">
              Ready to start? Connect your wallet and begin trading!
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
