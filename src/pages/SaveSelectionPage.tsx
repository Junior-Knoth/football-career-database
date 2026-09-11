import { useEffect, useState } from "react";
import type { Save } from "../features/saves/save.types";
import { useParams, Link } from "react-router-dom";
import { saveApi } from "../features/saves/save.api";
import styles from "./SaveSelectionPage.module.scss";

export default function SaveSelectionPage() {
  const [saves, setSaves] = useState<Save[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { gameId } = useParams();
  const id = gameId ? parseInt(gameId, 10) : null;

  useEffect(() => {
    try {
      async function loadSaves() {
        setLoading(true);
        const savesData = await saveApi.getByGameId(id as number);

        if (!savesData) {
          setError("No saves found");
        } else {
          setSaves(savesData);
        }
      }
      loadSaves();
    } catch (error) {
      setError("Error fetching saves");
    } finally {
      setLoading(false);
    }
  }, []);
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Football Career Tracker</h1>
        <h3 className={styles.subtitle}>Choose a save</h3>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : saves.length !== 0 ? (
          <ul></ul>
        ) : (
          <p>No saves found</p>
        )}
      </div>
    </div>
  );
}
