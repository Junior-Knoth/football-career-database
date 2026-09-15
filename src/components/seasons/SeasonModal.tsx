import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import type { Season } from "../../features/seasons/season.types";
import SeasonForm, { type SeasonFormData } from "./SeasonForm";
import styles from "./SeasonModal.module.scss";

type SeasonModalProps = {
  mode: "create" | "edit";
  season?: Season | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SeasonFormData) => Promise<void>;
};

export default function SeasonModal({
  mode,
  season,
  isOpen,
  onClose,
  onSubmit,
}: SeasonModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isCreateMode = mode === "create";

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

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(data: SeasonFormData) {
    setIsSubmitting(true);

    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  }

  const title = isCreateMode ? "Nova temporada" : "Editar temporada";

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
        aria-labelledby="season-modal-title"
      >
        <header className={styles.header}>
          <div>
            <h2 id="season-modal-title">{title}</h2>
            <p>
              {isCreateMode
                ? "Defina o período da nova temporada."
                : "Atualize as informações desta temporada."}
            </p>
          </div>
          <button
            className={styles.closeButton}
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label={`Fechar ${title.toLowerCase()}`}
          >
            <X />
          </button>
        </header>

        <SeasonForm
          mode={mode}
          initialValues={season ?? undefined}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          idPrefix={
            isCreateMode ? "create-season" : `edit-season-${season?.id}`
          }
        />
      </section>
    </div>,
    document.body,
  );
}
