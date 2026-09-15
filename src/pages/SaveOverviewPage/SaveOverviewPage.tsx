import { useOutletContext } from "react-router-dom";
import type { Save } from "../../features/saves/save.types";
import styles from "./SaveOverviewPage.module.scss";
import type { BreadcrumbItem } from "../../components/navigation/Breadcrumbs";
// import { gameApi } from "../features/games/game.api";

interface SaveLayoutContext {
  save: Save | null;
  setPageBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
}

export default function SaveOverviewPage() {
  const { save, setPageBreadcrumbs } = useOutletContext<SaveLayoutContext>();

  return <div className={styles.main}> {save?.name || "Carreira"} Outlet</div>;
}
