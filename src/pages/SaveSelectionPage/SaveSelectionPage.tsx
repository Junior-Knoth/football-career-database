import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LogIn } from "lucide-react";

import type { Save } from "../../features/saves/save.types";
import { saveApi } from "../../features/saves/save.api";
import styles from "./SaveSelectionPage.module.scss";
import { gameApi } from "../../features/games/game.api";
import type { Game } from "../../features/games/game.types";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import { useNotification } from "../../features/notifications/notification.hook";

export default function SaveSelectionPage() {
  const [saves, setSaves] = useState<Save[]>([]);
  const [game, setGame] = useState<Game>();
  const [loading, setLoading] = useState(true);
  const { gameId } = useParams();
  const id = gameId ? parseInt(gameId, 10) : null;
  const { showNotification } = useNotification();

  useEffect(() => {
    let isCurrent = true;

    async function loadData() {
      if (!id) {
        showNotification("ID do jogo inválido", "error", 3000);
        return;
      }

      try {
        const [savesData, gameData] = await Promise.all([
          saveApi.getByGameId(id),
          gameApi.getById(id),
        ]);

        if (!isCurrent) {
          return;
        }

        if (!gameData) {
          showNotification("Jogo não encontrado", "error", 3000);
        } else {
          setGame(gameData);
        }

        if (savesData.length === 0) {
          showNotification(
            "Nenhuma carreira encontrada para este jogo",
            "info",
            3000,
          );
        } else {
          setSaves(savesData);
        }
      } catch (error) {
        if (isCurrent) {
          showNotification("Erro ao carregar carreiras", "error", 3000);
          console.error(error);
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      isCurrent = false;
    };
  }, [id, showNotification]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Breadcrumbs
          items={[
            { label: "Início", to: "/" },
            { label: game?.name ?? "Jogo desconhecido" },
          ]}
        />
        <h1 className={styles.title}>Football Career Tracker</h1>
        <h3 className={styles.subtitle}>Escolha uma carreira</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul className={styles.saveList}>
            {saves.map((save) => (
              <li key={save.id}>
                <Link to={`/saves/${save.id}`} className={styles.saveCard}>
                  <div className={styles.saveInfo}>
                    <h4>{save.name}</h4>
                    <p>0 Temporadas</p>
                  </div>
                  <LogIn className={styles.icon} />
                </Link>
              </li>
            ))}
            <li>
              <Link to={`/games/${id}/create-save`}>
                <div role="button" tabIndex={0} className={styles.newSaveCard}>
                  Nova carreira
                </div>
              </Link>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
