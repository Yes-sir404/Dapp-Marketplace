import React from "react";
import { AnimatePresence } from "framer-motion";
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
    <div className="fixed top-4 right-4 z-50 space-y-4">
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            style={{
              transform: `translateY(${index * 20}px)`,
            }}
          >
            <PopupNotification
              notification={notification}
              onDismiss={onDismiss}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default PopupNotificationManager;
