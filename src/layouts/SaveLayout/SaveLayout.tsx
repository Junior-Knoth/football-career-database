import { Outlet } from "react-router-dom";
import SaveSidebar from "../../components/navigation/SaveSidebar";
import SaveHeader from "../../components/saves/SaveHeader";
import styles from "./SaveLayout.module.scss";

export default function SaveLayout() {
  return (
    <div className={styles.container}>
      <SaveSidebar />
      <SaveHeader />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
