import type { Save } from "../../features/saves/save.types";
import styles from "./SaveSidebar.module.scss";

export default function SaveSidebar({ save }: { save: Save | null }) {
  return <div className={styles.sidebar}>{save?.game.name || "Carreira"}</div>;
}
