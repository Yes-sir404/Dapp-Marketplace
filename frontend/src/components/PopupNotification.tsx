import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";

export interface PopupNotification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  duration?: number;
}

interface PopupNotificationProps {
  notification: PopupNotification;
  onDismiss: (id: string) => void;
}

const PopupNotification: React.FC<PopupNotificationProps> = ({
  notification,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, notification.duration || 5000);

    return () => clearTimeout(timer);
  }, [notification.id, notification.duration, onDismiss]);

  const getIcon = (type: PopupNotification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "error":
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-400" />;
      default:
        return <Info className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTypeStyles = (type: PopupNotification["type"]) => {
    switch (type) {
      case "success":
        return "border-green-500/50 bg-green-900/20";
      case "error":
        return "border-red-500/50 bg-red-900/20";
      case "warning":
        return "border-yellow-500/50 bg-yellow-900/20";
      case "info":
        return "border-blue-500/50 bg-blue-900/20";
      default:
        return "border-gray-500/50 bg-gray-900/20";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`fixed top-4 right-4 w-80 p-4 rounded-xl border shadow-xl z-50 ${getTypeStyles(
        notification.type
      )}`}
    >
      <div className="flex items-start gap-3">
        {getIcon(notification.type)}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-white text-sm">
              {notification.title}
            </h4>
            <button
              onClick={() => onDismiss(notification.id)}
              className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-slate-300 text-sm mt-1">{notification.message}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default PopupNotification;
