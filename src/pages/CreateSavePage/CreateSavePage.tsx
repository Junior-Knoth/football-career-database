import { Link, useNavigate, useParams } from "react-router-dom";
import { X } from "lucide-react";
import { useState } from "react";

import SaveForm, { type SaveFormData } from "../../components/saves/SaveForm";
import { useNotification } from "../../features/notifications/notification.hook";
import { saveApi } from "../../features/saves/save.api";
import styles from "./CreateSavePage.module.scss";

export default function CreateSavePage() {
  const { gameId } = useParams();
  const id = gameId ? parseInt(gameId, 10) : null;
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate(data: SaveFormData) {
    if (!id) {
      showNotification("ID do jogo não encontrado", "error", 3000);
      return;
    }

    setIsSubmitting(true);

    try {
      const newSave = await saveApi.create({
        ...data,
        gameId: id,
      });

      showNotification("Carreira criada com sucesso!", "success", 3000);
      navigate(`/saves/${newSave.id}`);
    } catch (error) {
      showNotification("Erro ao criar a carreira", "error", 3000);
      console.error("Error creating save:", error);
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <header className={styles.header}>
          <h2 className={styles.title}>Nova carreira</h2>
          <p className={styles.description}>
            Configure os dados iniciais da sua nova carreira
          </p>
          <Link
            className={styles.closeLink}
            to={`/games/${id}`}
            aria-label="Cancelar criação da carreira"
          >
            <X className={styles.icon} />
          </Link>
        </header>

        <SaveForm
          mode="create"
          isSubmitting={isSubmitting}
          onSubmit={handleCreate}
          idPrefix="create-save"
        />
      </div>
    </div>
  );
}
