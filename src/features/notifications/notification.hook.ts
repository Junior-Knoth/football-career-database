// src/context/useNotification.ts
import { useContext } from "react";
import { NotificationContext } from "./notificationContext"; // (Ajuste o caminho se necessário)

export function useNotification() {
  return useContext(NotificationContext);
}
