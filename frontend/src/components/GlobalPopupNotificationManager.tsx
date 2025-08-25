import React from "react";
import { useNotificationContext } from "../contexts/NotificationContext";
import PopupNotificationManager from "./PopupNotificationManager";

const GlobalPopupNotificationManager: React.FC = () => {
  const { popupNotifications, dismissPopupNotification } =
    useNotificationContext();

  return (
    <PopupNotificationManager
      notifications={popupNotifications}
      onDismiss={dismissPopupNotification}
    />
  );
};

export default GlobalPopupNotificationManager;
