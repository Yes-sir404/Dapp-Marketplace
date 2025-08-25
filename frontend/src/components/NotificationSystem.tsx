import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  Download,
} from "lucide-react";

export interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationSystemProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
  maxNotifications?: number;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onMarkAsRead,
  onDismiss,
  maxNotifications = 5,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: Notification["type"]) => {
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

  const getTypeStyles = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "border-green-500/50 bg-green-900/10";
      case "error":
        return "border-red-500/50 bg-red-900/10";
      case "warning":
        return "border-yellow-500/50 bg-yellow-900/10";
      case "info":
        return "border-blue-500/50 bg-blue-900/10";
      default:
        return "border-gray-500/50 bg-gray-900/10";
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-300 hover:text-white transition-colors duration-200"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.div>
        )}
      </motion.button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">
                Notifications
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="p-2">
                  {notifications
                    .slice(0, maxNotifications)
                    .map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`mb-2 p-3 rounded-lg border transition-colors ${
                          notification.read ? "opacity-60" : ""
                        } ${getTypeStyles(notification.type)}`}
                      >
                        <div className="flex items-start gap-3">
                          {getIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-white text-sm">
                                {notification.title}
                              </h4>
                              <button
                                onClick={() => onDismiss(notification.id)}
                                className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="text-slate-300 text-xs mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-slate-400 text-xs">
                                {formatTime(notification.timestamp)}
                              </span>
                              <div className="flex items-center gap-2">
                                {!notification.read && (
                                  <button
                                    onClick={() =>
                                      onMarkAsRead(notification.id)
                                    }
                                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                  >
                                    Mark as read
                                  </button>
                                )}
                                {notification.action && (
                                  <button
                                    onClick={notification.action.onClick}
                                    className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded transition-colors flex items-center gap-1"
                                  >
                                    <Download className="w-3 h-3" />
                                    {notification.action.label}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No notifications yet</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > maxNotifications && (
              <div className="p-3 border-t border-slate-700">
                <button className="w-full text-center text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  View all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40"
        />
      )}
    </div>
  );
};

export default NotificationSystem;
