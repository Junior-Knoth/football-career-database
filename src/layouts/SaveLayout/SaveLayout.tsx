import { Outlet, useParams } from "react-router-dom";
import SaveSidebar from "../../components/navigation/SaveSidebar";
import SaveHeader from "../../components/saves/SaveHeader";
import styles from "./SaveLayout.module.scss";
import type { Save } from "../../features/saves/save.types";
import { useEffect, useState } from "react";
import { useNotification } from "../../features/notifications/notification.hook";
import { saveApi } from "../../features/saves/save.api";
import type { BreadcrumbItem } from "../../components/navigation/Breadcrumbs";

export default function SaveLayout() {
  const saveId = useParams();
  const id = saveId.saveId ? parseInt(saveId.saveId, 10) : null;

  const [save, setSave] = useState<Save | null>(null);

  const [pageBreadcrumbs, setPageBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  const baseBreadcrumbs: BreadcrumbItem[] = [
    {
      label: "Início",
      to: "/",
    },
    {
      label: `${save?.game.name || "Carreira"}`,
      to: `/games/${save?.game.id}`,
    },
    {
      label: `${save?.name || "Carreira"}`,
      to: `/saves/${save?.id}`,
    },
  ];

  const { showNotification } = useNotification();

  function handleSaveUpdated(updatedSave: Save) {
    setSave(updatedSave);
  }

  useEffect(() => {
    async function loadData() {
      if (!id) {
        showNotification("ID da carreira inválido", "error", 3000);
        return;
      }

      try {
        const saveData = await saveApi.getById(id);

        setSave(saveData);
      } catch (err) {
        showNotification("Erro ao carregar a carreira", "error", 3000);
        console.error("Erro ao carregar a carreira:", err);
      }
    }

    loadData();
  }, [id, showNotification]);

  return (
    <div className={styles.container}>
      <SaveSidebar save={save} />
      <SaveHeader
        save={save}
        items={[...baseBreadcrumbs, ...pageBreadcrumbs]}
        onSaveUpdated={handleSaveUpdated}
      />
      <main className={styles.main}>
        <Outlet
          context={{
            save,
            setPageBreadcrumbs,
            onSaveUpdated: handleSaveUpdated,
          }}
        />
      </main>
    </div>
  );
}
