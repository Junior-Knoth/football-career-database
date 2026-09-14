// src/context/notificationContext.ts
import { createContext } from "react";
import type { NotificationType } from "../../features/notifications/notification.types";

export interface NotificationContextData {
  showNotification: (
    message: string,
    type: NotificationType,
    duration?: number,
  ) => void;
  removeNotification: (id: string) => void;
}

export const NotificationContext = createContext<NotificationContextData>(
  {} as NotificationContextData,
);
