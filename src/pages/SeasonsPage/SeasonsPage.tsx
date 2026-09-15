import { useEffect, useState } from "react";
import { CalendarDays, Pencil, Plus, Trash2 } from "lucide-react";
import { useOutletContext } from "react-router-dom";

import SeasonModal from "../../components/seasons/SeasonModal";
import type { SeasonFormData } from "../../components/seasons/SeasonForm";
import type { BreadcrumbItem } from "../../components/navigation/Breadcrumbs";
import { useNotification } from "../../features/notifications/notification.hook";
import { saveApi } from "../../features/saves/save.api";
import type { Save } from "../../features/saves/save.types";
import { seasonApi } from "../../features/seasons/season.api";
import type {
  Season,
  UpdateSeasonInput,
} from "../../features/seasons/season.types";
import styles from "./SeasonsPage.module.scss";

type SaveLayoutContext = {
  save: Save | null;
  setPageBreadcrumbs: (items: BreadcrumbItem[]) => void;
  onSaveUpdated: (save: Save) => void;
};

type SeasonAction = {
  id: number;
  type: "current" | "delete";
};

function formatDate(dateValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);

  if (!year || !month || !day) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("pt-BR").format(
    new Date(year, month - 1, day),
  );
}

export default function SeasonsPage() {
  const { save, setPageBreadcrumbs, onSaveUpdated } =
    useOutletContext<SaveLayoutContext>();
  const { showNotification } = useNotification();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [seasonBeingEdited, setSeasonBeingEdited] = useState<Season | null>(
    null,
  );
  const [action, setAction] = useState<SeasonAction | null>(null);
  const saveId = save?.id;

  useEffect(() => {
    setPageBreadcrumbs([{ label: "Temporadas" }]);

    return () => setPageBreadcrumbs([]);
  }, [setPageBreadcrumbs]);

  useEffect(() => {
    if (saveId === undefined) {
      return;
    }

    const currentSaveId = saveId;
    let isCurrent = true;

    async function loadSeasons() {
      setIsLoading(true);
      setHasLoadError(false);

      try {
        const seasonsData = await seasonApi.listBySaveId(currentSaveId);

        if (isCurrent) {
          setSeasons(seasonsData);
        }
      } catch (error) {
        if (isCurrent) {
          setHasLoadError(true);
          showNotification("Erro ao carregar as temporadas", "error", 3000);
        }

        console.error("Erro ao carregar as temporadas:", error);
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    void loadSeasons();

    return () => {
      isCurrent = false;
    };
  }, [saveId, showNotification]);

  async function syncSave() {
    if (!save) {
      return;
    }

    try {
      const updatedSave = await saveApi.getById(save.id);
      onSaveUpdated(updatedSave);
    } catch (error) {
      showNotification(
        "A temporada foi atualizada, mas não foi possível sincronizar a carreira.",
        "error",
        4000,
      );
      console.error("Erro ao sincronizar a carreira:", error);
    }
  }

  async function handleCreate(data: SeasonFormData) {
    if (!save) {
      return;
    }

    try {
      const createdSeason = await seasonApi.create({
        saveId: save.id,
        ...data,
      });

      setSeasons((currentSeasons) => [...currentSeasons, createdSeason]);
      await syncSave();
      showNotification("Temporada criada com sucesso!", "success", 3000);
      setIsCreateModalOpen(false);
    } catch (error) {
      showNotification("Erro ao criar a temporada", "error", 3000);
      console.error("Erro ao criar a temporada:", error);
    }
  }

  async function handleEdit(data: SeasonFormData) {
    if (!seasonBeingEdited) {
      return;
    }

    const updateData: UpdateSeasonInput = {};

    if (data.label !== seasonBeingEdited.label) {
      updateData.label = data.label;
    }

    if (data.startDate !== seasonBeingEdited.startDate) {
      updateData.startDate = data.startDate;
    }

    if (data.endDate !== seasonBeingEdited.endDate) {
      updateData.endDate = data.endDate;
    }

    if (Object.keys(updateData).length === 0) {
      setSeasonBeingEdited(null);
      return;
    }

    try {
      const updatedSeason = await seasonApi.update(
        seasonBeingEdited.id,
        updateData,
      );

      setSeasons((currentSeasons) =>
        currentSeasons.map((season) =>
          season.id === updatedSeason.id ? updatedSeason : season,
        ),
      );
      showNotification("Temporada atualizada com sucesso!", "success", 3000);
      setSeasonBeingEdited(null);
    } catch (error) {
      showNotification("Erro ao atualizar a temporada", "error", 3000);
      console.error("Erro ao atualizar a temporada:", error);
    }
  }

  async function handleSetCurrent(season: Season) {
    if (!save || action) {
      return;
    }

    setAction({ id: season.id, type: "current" });

    try {
      const response = await seasonApi.setCurrent(save.id, season.id);

      onSaveUpdated({ ...save, currentSeasonId: response.currentSeasonId });
      showNotification("Temporada atualizada com sucesso!", "success", 3000);
    } catch (error) {
      showNotification("Erro ao definir a temporada atual", "error", 3000);
      console.error("Erro ao definir a temporada atual:", error);
    } finally {
      setAction(null);
    }
  }

  async function handleDelete(season: Season) {
    if (!save || action) {
      return;
    }

    const isConfirmed = window.confirm(
      `Tem certeza que deseja excluir a temporada "${season.label}"?`,
    );

    if (!isConfirmed) {
      return;
    }

    setAction({ id: season.id, type: "delete" });

    try {
      await seasonApi.remove(season.id);
      setSeasons((currentSeasons) =>
        currentSeasons.filter(
          (currentSeason) => currentSeason.id !== season.id,
        ),
      );
      await syncSave();
      showNotification("Temporada excluída com sucesso!", "success", 3000);
    } catch (error) {
      showNotification("Erro ao excluir a temporada", "error", 3000);
      console.error("Erro ao excluir a temporada:", error);
    } finally {
      setAction(null);
    }
  }

  if (!save) {
    return <p className={styles.loading}>Carregando carreira...</p>;
  }

  return (
    <section className={styles.page} aria-labelledby="seasons-title">
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Carreira</p>
          <h1 id="seasons-title">Temporadas</h1>
          <p className={styles.description}>
            Organize os períodos que fazem parte desta carreira.
          </p>
        </div>
        <button
          className={styles.primaryButton}
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus aria-hidden="true" />
          Nova temporada
        </button>
      </header>

      {isLoading ? (
        <p className={styles.loading}>Carregando temporadas...</p>
      ) : hasLoadError ? (
        <div className={styles.errorState}>
          <p>Não foi possível carregar as temporadas desta carreira.</p>
        </div>
      ) : seasons.length === 0 ? (
        <div className={styles.emptyState}>
          <CalendarDays aria-hidden="true" />
          <h2>Nenhuma temporada cadastrada</h2>
          <p>Crie a primeira temporada da carreira para começar.</p>
          <button
            className={styles.primaryButton}
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus aria-hidden="true" />
            Criar primeira temporada
          </button>
        </div>
      ) : (
        <ol className={styles.list}>
          {seasons.map((season) => {
            const isCurrent = season.id === save.currentSeasonId;
            const isActing = action?.id === season.id;

            return (
              <li key={season.id} className={styles.seasonCard}>
                <div className={styles.seasonInfo}>
                  <div className={styles.titleRow}>
                    <h2>{season.label}</h2>
                    {isCurrent && (
                      <span className={styles.currentBadge}>Atual</span>
                    )}
                  </div>
                  <p>
                    {formatDate(season.startDate)}{" "}
                    <span aria-hidden="true">—</span>{" "}
                    {formatDate(season.endDate)}
                  </p>
                </div>

                <div className={styles.actions}>
                  {!isCurrent && (
                    <button
                      className={styles.setCurrentButton}
                      type="button"
                      onClick={() => void handleSetCurrent(season)}
                      disabled={Boolean(action)}
                    >
                      {isActing && action?.type === "current"
                        ? "Definindo..."
                        : "Definir como atual"}
                    </button>
                  )}
                  <button
                    className={styles.iconButton}
                    type="button"
                    onClick={() => setSeasonBeingEdited(season)}
                    disabled={Boolean(action)}
                    aria-label={`Editar temporada ${season.label}`}
                  >
                    <Pencil aria-hidden="true" />
                  </button>
                  <button
                    className={`${styles.iconButton} ${styles.deleteButton}`}
                    type="button"
                    onClick={() => void handleDelete(season)}
                    disabled={Boolean(action)}
                    aria-label={`Excluir temporada ${season.label}`}
                  >
                    <Trash2 aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <SeasonModal
        mode="create"
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
      />
      <SeasonModal
        mode="edit"
        season={seasonBeingEdited}
        isOpen={Boolean(seasonBeingEdited)}
        onClose={() => setSeasonBeingEdited(null)}
        onSubmit={handleEdit}
      />
    </section>
  );
}
