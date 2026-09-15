import { useState } from "react";
import { EllipsisVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { Save } from "../../features/saves/save.types";
import { saveApi } from "../../features/saves/save.api";
import { useNotification } from "../../features/notifications/notification.hook";
import EditSaveModal from "./EditSaveModal";
import styles from "./SaveActionsMenu.module.scss";

type SaveActionsMenuProps = {
  save: Save | null;
  onSaveUpdated: (save: Save) => void;
};

export default function SaveActionsMenu({
  save,
  onSaveUpdated,
}: SaveActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  async function handleDeleteSave() {
    if (!save) {
      return;
    }

    const isConfirmed = window.confirm(
      "Tem certeza que deseja excluir este save?",
    );

    if (!isConfirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const deletedSave = await saveApi.delete(save.id);

      showNotification(
        `Save "${deletedSave.name}" excluído com sucesso`,
        "success",
        3000,
      );
      navigate(`/`);
    } catch (error) {
      showNotification("Erro ao excluir o save", "error", 3000);
      console.error("Erro ao excluir o save:", error);
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className={styles.menu}>
        <button
          className={styles.iconBtn}
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          aria-label="Abrir ações da carreira"
          aria-expanded={isOpen}
        >
          <EllipsisVertical className={styles.icon} />
        </button>

        {isOpen && (
          <div className={styles.dropdown}>
            <ul className={styles.list}>
              <li className={styles.item}>
                <button
                  className={styles.button}
                  type="button"
                  onClick={handleDeleteSave}
                  disabled={isDeleting || !save}
                >
                  Excluir Save
                </button>
              </li>
              <li className={styles.item}>
                <button
                  className={styles.button}
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsEditModalOpen(true);
                  }}
                  disabled={!save}
                >
                  Editar Save
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      <EditSaveModal
        save={save}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaveUpdated={onSaveUpdated}
      />
    </>
  );
}
