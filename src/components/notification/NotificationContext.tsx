import { useState, type ReactNode, useCallback } from "react";

import type {
  Notification,
  NotificationType,
} from "../../features/notifications/notification.types";
import NotificationContainer from "./NotificationContainer";
import { NotificationContext } from "../../features/notifications/notificationContext";

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  }, []);

  const showNotification = useCallback(
    (message: string, type: NotificationType, duration = 3000) => {
      const id = Math.random().toString(36).substring(2, 9);

      const newNotification: Notification = { id, message, type, duration };

      setNotifications((prev) => [...prev, newNotification]);

      setTimeout(() => {
        removeNotification(id);
      }, duration);
    },
    [removeNotification],
  );

  return (
    <NotificationContext.Provider
      value={{ showNotification, removeNotification }}
    >
      {children}

      <NotificationContainer
        notifications={notifications}
        onClose={removeNotification}
      />
    </NotificationContext.Provider>
  );
}
