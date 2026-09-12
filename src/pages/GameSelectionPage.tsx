import { Link } from "react-router-dom";
import { gameApi } from "../features/games/game.api";
import styles from "./GameSelectionPage.module.scss";
import { useEffect, useState } from "react";

import { LogIn } from "lucide-react";

import type { Game } from "../features/games/game.types";
import type { Save } from "../features/saves/save.types";
import { saveApi } from "../features/saves/save.api";

export default function GameSelectionPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [saves, setSaves] = useState<Save[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGames() {
      try {
        setLoading(true);
        const gamesData = await gameApi.list();
        const savesData = await saveApi.list();

        if (!gamesData) {
          setError("No games found");
        } else {
          setGames(gamesData);

          if (!savesData) {
            setError("No saves found");
          } else {
            setSaves(savesData);
          }
        }
      } catch (error) {
        console.error("Error fetching games:", error);
        setError("Error fetching games");
      } finally {
        setLoading(false);
      }
    }

    loadGames();
  }, []);
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Football Career Tracker</h1>
        <h3 className={styles.subtitle}>Choose a game</h3>
        {loading ? (
          <p>Carregando...</p>
        ) : error ? (
          <p>Erro: {error}</p>
        ) : games.length !== 0 ? (
          <ul className={styles.gameList}>
            {games.map((game) => (
              <li key={game.id}>
                <Link to={`/games/${game.id}`} className={styles.gameCard}>
                  <div className={styles.gameInfo}>
                    <h4>{game.name}</h4>
                    <p>
                      {saves.filter((save) => save.game.id === game.id).length}{" "}
                      Carreiras
                    </p>
                  </div>
                  <LogIn className={styles.icon} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>Sem jogos disponíveis</p>
        )}
      </div>
    </div>
  );
}
