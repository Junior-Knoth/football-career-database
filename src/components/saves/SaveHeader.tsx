import type { Save } from "../../features/saves/save.types";
import Breadcrumbs from "../navigation/Breadcrumbs";
import styles from "./SaveHeader.module.scss";
import type { BreadcrumbItem } from "../navigation/Breadcrumbs";
import SaveActionsMenu from "./SaveActionsMenu";

export default function SaveHeader({
  save,
  items,
  onSaveUpdated,
}: {
  save: Save | null;
  items: BreadcrumbItem[];
  onSaveUpdated: (save: Save) => void;
}) {
  return (
    <header className={styles.header}>
      <Breadcrumbs items={items}></Breadcrumbs>
      <SaveActionsMenu save={save} onSaveUpdated={onSaveUpdated} />
    </header>
  );
}
