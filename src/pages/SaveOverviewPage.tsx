import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Save } from "../features/saves/save.types";
import { saveApi } from "../features/saves/save.api";
// import { gameApi } from "../features/games/game.api";

export default function SaveOverviewPage() {
  const [save, setSave] = useState<Save | null>(null);
  // const [game, setGame] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { saveId } = useParams();
  const id = saveId ? parseInt(saveId, 10) : null;

  useEffect(() => {
    async function loadSave() {
      try {
        setLoading(true);

        const save = await saveApi.getById(id as number);

        if (!save) {
          setError("Save not found");
        } else {
          setSave(save);
          // const [game] = await gameApi.getById(save.gameId);
          // if (game) {
          //   setGame(game);
          // }
        }
      } catch (e) {
        setError("Error fetching save");
        console.error(`Error fetching save with ID ${id}:`, e);
      } finally {
        setLoading(false);
      }
    }
    loadSave();
  }, [id]);

  return (
    <main>
      <Link to="/">Voltar para o início</Link>
      {loading ? (
        <p>Carregando...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        save && (
          <>
            <p>Save ID: {save.id}</p>
            <p>Save name: {save.name}</p>
            <p>Save game: {save.game ? save.game.name : "Game not found"}</p>
          </>
        )
      )}
    </main>
  );
}
