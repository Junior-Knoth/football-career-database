import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import type { Save, UpdateSaveInput } from "../../features/saves/save.types";
import { saveApi } from "../../features/saves/save.api";
import { useNotification } from "../../features/notifications/notification.hook";
import SaveForm, { type SaveFormData } from "./SaveForm";
import styles from "./EditSaveModal.module.scss";

type EditSaveModalProps = {
  save: Save | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveUpdated: (save: Save) => void;
};

export default function EditSaveModal({
  save,
  isOpen,
  onClose,
  onSaveUpdated,
}: EditSaveModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !save) {
    return null;
  }

  const saveToEdit = save;

  async function handleSubmit(data: SaveFormData) {
    const updateData: UpdateSaveInput = {};

    if (data.name !== saveToEdit.name) {
      updateData.name = data.name;
    }

    if (data.managerName !== saveToEdit.manager.name) {
      updateData.managerName = data.managerName;
    }

    if (data.managerBirthDate !== saveToEdit.manager.birthDate) {
      updateData.managerBirthDate = data.managerBirthDate;
    }

    if (data.managerNationalityId !== saveToEdit.manager.nationalityId) {
      updateData.managerNationalityId = data.managerNationalityId;
    }

    if (Object.keys(updateData).length === 0) {
      onClose();
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedSave = await saveApi.update(saveToEdit.id, updateData);

      onSaveUpdated(updatedSave);
      showNotification("Carreira atualizada com sucesso!", "success", 3000);
      onClose();
    } catch (error) {
      showNotification("Erro ao atualizar a carreira", "error", 3000);
      console.error("Error updating save:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-save-title"
      >
        <header className={styles.header}>
          <div>
            <h2 id="edit-save-title">Editar carreira</h2>
            <p>Atualize os dados da sua carreira e do treinador</p>
          </div>
          <button
            className={styles.closeButton}
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Fechar edição da carreira"
          >
            <X />
          </button>
        </header>

        <SaveForm
          mode="edit"
          initialValues={{
            name: saveToEdit.name,
            managerName: saveToEdit.manager.name,
            managerBirthDate: saveToEdit.manager.birthDate,
            managerNationalityId: saveToEdit.manager.nationalityId,
          }}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          idPrefix="edit-save"
        />
      </section>
    </div>,
    document.body,
  );
}
