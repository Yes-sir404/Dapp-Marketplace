import React, { createContext, useContext, useState, useCallback } from "react";
import type { PopupNotification } from "../components/PopupNotification";

interface NotificationContextType {
  popupNotifications: PopupNotification[];
  addPopupNotification: (notification: Omit<PopupNotification, "id">) => void;
  dismissPopupNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [popupNotifications, setPopupNotifications] = useState<
    PopupNotification[]
  >([]);

  const addPopupNotification = useCallback(
    (notification: Omit<PopupNotification, "id">) => {
      const newPopupNotification: PopupNotification = {
        ...notification,
        id: `popup-${Date.now()}-${Math.random()}`,
      };
      setPopupNotifications((prev) => [newPopupNotification, ...prev]);
    },
    []
  );

  const dismissPopupNotification = useCallback((id: string) => {
    setPopupNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        popupNotifications,
        addPopupNotification,
        dismissPopupNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
