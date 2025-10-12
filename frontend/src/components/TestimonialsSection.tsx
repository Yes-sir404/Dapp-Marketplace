import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      name: "Alex Chen",
      role: "Digital Artist",
      avatar: "AC",
      rating: 5,
      comment:
        "I made my first crypto sale in minutes. Love MetaMarket! The platform is so intuitive and the community is amazing.",
      bgGradient: "from-purple-500/20 to-blue-500/20",
      avatarGradient: "from-purple-500 to-purple-600",
    },
    {
      id: 2,
      name: "Sarah Thompson",
      role: "Music Producer",
      avatar: "ST",
      rating: 5,
      comment:
        "Finally, a marketplace that understands creators. The gas fees are minimal and payments are instant.",
      bgGradient: "from-blue-500/20 to-cyan-500/20",
      avatarGradient: "from-blue-500 to-blue-600",
    },
    {
      id: 3,
      name: "Marcus Rodriguez",
      role: "eBook Author",
      avatar: "MR",
      rating: 5,
      comment:
        "MetaMarket revolutionized how I sell my digital content. Direct crypto payments and no platform fees!",
      bgGradient: "from-green-500/20 to-blue-500/20",
      avatarGradient: "from-green-500 to-green-600",
    },
  ];

  const stats = [
    { value: "8,234", label: "Active Traders", color: "text-green-400" },
    { value: "15,667", label: "Digital Assets", color: "text-purple-400" },
    { value: "$2.4M+", label: "Volume", color: "text-blue-400" },
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
            What Our{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Community
            </span>{" "}
            Says
          </h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
            Join thousands of creators and collectors who are already thriving
            on MetaMarket.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`bg-gradient-to-br ${testimonial.bgGradient} backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-500`}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="text-yellow-400 fill-current"
                  />
                ))}
              </div>

              {/* Comment */}
              <blockquote className="text-gray-200 italic mb-6 leading-relaxed">
                "{testimonial.comment}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${testimonial.avatarGradient} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}
                >
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="text-white font-semibold">
                    {testimonial.name}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Community Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-8 bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 px-8 py-6 rounded-2xl">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 ${stat.color.replace(
                    "text-",
                    "bg-"
                  )} rounded-full`}
                ></div>
                <span className={`font-bold text-lg ${stat.color}`}>
                  {stat.value}
                </span>
                <span className="text-gray-400 text-sm">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
