/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import type { Save } from "../features/saves/save.types";
import { Link, useParams } from "react-router-dom";
import { saveApi } from "../features/saves/save.api";
import styles from "./SaveSelectionPage.module.scss";
import { LogIn } from "lucide-react";
import { gameApi } from "../features/games/game.api";
import type { Game } from "../features/games/game.types";
import Breadcrumbs from "../components/navigation/Breadcrumbs";

export default function SaveSelectionPage() {
  const [saves, setSaves] = useState<Save[]>([]);
  const [game, setGame] = useState<Game>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreatingSave, setIsCreatingSave] = useState(false);
  const [newSaveName, setNewSaveName] = useState("");

  const { gameId } = useParams();
  const id = gameId ? parseInt(gameId, 10) : null;

  async function handleNewSaveSubmit(
    event: React.SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!newSaveName.trim() || !id) {
      alert("Please enter a valid save name.");
      return;
    }

    const newSave = {
      name: newSaveName,
      gameId: id as number,
    };

    try {
      const createdSave = await saveApi.create(newSave);

      if (createdSave) {
        setSaves((prevSaves) => [...prevSaves, createdSave]);
        setNewSaveName("");

        setIsCreatingSave(false);

        console.log(saves);
      }
    } catch (err) {
      console.error("Error creating new save:", err);
    }
  }

  async function loadSaves() {
    try {
      setLoading(true);
      const savesData = await saveApi.getByGameId(id as number);
      const gameData = await gameApi.getById(id as number);

      if (!gameData) {
        setError("Game not found");
      } else {
        console.log("Game data:", gameData);
        setGame(gameData);
      }

      if (!savesData || savesData.length === 0) {
        setError("No saves found");
      } else {
        setSaves(savesData);
      }
    } catch (err) {
      setError("Error fetching saves");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) {
      setError("Invalid game ID");
      setLoading(false);
      return;
    }

    loadSaves();
  }, [id]);
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Breadcrumbs
          items={[
            { label: "Inicio", to: "/" },
            { label: game?.name ?? "Jogo desconhecido" },
          ]}
        />
        <h1 className={styles.title}>Football Career Tracker</h1>
        <h3 className={styles.subtitle}>Escolha uma carreira</h3>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : saves.length !== 0 ? (
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
              {isCreatingSave ? (
                <div className={`${styles.saveCard} ${styles.createSaveCard}`}>
                  <form
                    id="createNewSaveForm"
                    className={styles.createSaveForm}
                    onSubmit={handleNewSaveSubmit}
                  >
                    <label htmlFor="saveName">Nome:</label>
                    <input
                      type="text"
                      id="saveName"
                      name="saveName"
                      className={styles.saveNameInput}
                      onChange={(e) => setNewSaveName(e.target.value)}
                    />
                  </form>
                  <div className={styles.saveActions}>
                    <button
                      type="submit"
                      form="createNewSaveForm"
                      className={styles.saveButton}
                    >
                      Salvar
                    </button>
                    <button
                      form="createNewSaveForm"
                      onClick={() => setIsCreatingSave(false)}
                      className={styles.cancelButton}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  className={styles.newSaveCard}
                  onClick={() => setIsCreatingSave(true)}
                >
                  {/* Quando não há novo save: */}
                  Nova carreira
                </div>
              )}
            </li>
          </ul>
        ) : (
          <p>Nenhuma carreira encontrada.</p>
        )}
      </div>
    </div>
  );
}
