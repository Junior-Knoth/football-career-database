export type NotificationType = "success" | "error" | "info" | "warning";

export type Notification = {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
};
