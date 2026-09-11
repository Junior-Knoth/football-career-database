import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Save } from "../features/saves/save.types";
import { saveApi } from "../features/saves/save.api";

export default function SavePage() {
  const [save, setSave] = useState<Save | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { saveId } = useParams();
  const id = saveId ? parseInt(saveId, 10) : null;

  useEffect(() => {
    async function fetchSave() {
      try {
        setLoading(true);

        const save = await saveApi.getById(id as number);

        if (!save) {
          setError("Save not found");
        } else {
          setSave(save);
        }
      } catch (e) {
        console.error(`Error fetching save with ID ${id}:`, e);
      } finally {
        setLoading(false);
      }
    }

    fetchSave();
  }, [id]);

  return (
    <main>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        save && (
          <>
            <p>Save ID: {save.id}</p>
            <p>Save name: {save.name}</p>
            {/* <p>Save Game: {save.game.name}</p> */}
          </>
        )
      )}
    </main>
  );
}
