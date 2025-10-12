import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import PopupNotification from "./PopupNotification";
import type { PopupNotification as PopupNotificationType } from "./PopupNotification";

interface PopupNotificationManagerProps {
  notifications: PopupNotificationType[];
  onDismiss: (id: string) => void;
}

const PopupNotificationManager: React.FC<PopupNotificationManagerProps> = ({
  notifications,
  onDismiss,
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative"
            style={{
              zIndex: 50 + index,
            }}
          >
            <PopupNotification
              notification={notification}
              onDismiss={onDismiss}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default PopupNotificationManager;
