import React from "react";
import { motion } from "framer-motion";
import { GitBranch, Users, DollarSign, Shield } from "lucide-react";

const WhyChooseSection: React.FC = () => {
  const features = [
    {
      icon: GitBranch,
      title: "Decentralized",
      description:
        "Built on blockchain technology for true ownership and transparency. No central authority controls your assets.",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/10 border-purple-400/20",
    },
    {
      icon: Users,
      title: "No Middlemen",
      description:
        "Direct peer-to-peer transactions without intermediaries. Keep more of your earnings with lower fees.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10 border-blue-400/20",
    },
    {
      icon: DollarSign,
      title: "Earn Crypto Directly",
      description:
        "Get paid instantly in cryptocurrency. Your earnings are stored securely in your wallet.",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-500/10 border-green-400/20",
    },
    {
      icon: Shield,
      title: "Secure & Transparent",
      description:
        "Smart contracts ensure every transaction is secure, verifiable, and immutable on the blockchain.",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10 border-blue-400/20",
    },
  ];

  const stats = [
    { value: "99.9%", label: "Uptime", color: "text-green-400" },
    { value: "<2s", label: "Transaction Speed", color: "text-blue-400" },
    { value: "50+", label: "Supported Wallets", color: "text-purple-400" },
    { value: "24/7", label: "Community Support", color: "text-cyan-400" },
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
            Why Choose{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              MetaSou9
            </span>
            ?
          </h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
            Experience the future of digital commerce with our cutting-edge Web3
            marketplace that puts control back in your hands.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`${feature.bgColor} border backdrop-blur-xl rounded-2xl p-6 text-center hover:border-opacity-50 transition-all duration-500`}
            >
              {/* Icon */}
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg`}
              >
                <feature.icon size={28} className="text-white" />
              </motion.div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-4">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-400 leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className={`text-4xl font-bold ${stat.color} mb-2`}>
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
