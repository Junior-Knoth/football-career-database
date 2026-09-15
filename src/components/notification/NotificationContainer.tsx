import { type Notification } from "../../features/notifications/notification.types";
import styles from "./NotificationContainer.module.scss";
import { Check, X, TriangleAlert, SquareText } from "lucide-react";

interface NotificationContainerProps {
  notifications: Notification[];
  onClose: (id: string) => void;
}

function getIconForType(type: Notification["type"]) {
  switch (type) {
    case "success":
      return {
        icon: <Check className={styles.icon} />,
        color: "var(--success)",
      };
    case "error":
      return {
        icon: <X className={styles.icon} />,
        color: "var(--danger)",
      };
    case "warning":
      return {
        icon: <TriangleAlert className={styles.icon} />,
        color: "var(--warning)",
      };
    case "info":
      return {
        icon: <SquareText className={styles.icon} />,
        color: "var(--info)",
      };
  }
}

export default function NotificationContainer({
  notifications,
  onClose,
}: NotificationContainerProps) {
  return (
    <div className={styles.notificationContainer}>
      {notifications.map((notification) => (
        <div key={notification.id} className={styles.notification}>
          <div
            className={styles.typeBox}
            style={{ backgroundColor: getIconForType(notification.type).color }}
          >
            {getIconForType(notification.type).icon}
          </div>
          <span>{notification.message}</span>
          <button onClick={() => onClose(notification.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
