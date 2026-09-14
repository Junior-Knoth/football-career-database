import { createRoot } from "react-dom/client";
import "./styles/globals.scss";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { NotificationProvider } from "./components/notification/NotificationContext.tsx";

createRoot(document.getElementById("root")!).render(
  <NotificationProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </NotificationProvider>,
);
