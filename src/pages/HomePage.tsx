import { useEffect, useState } from "react";
import { gameApi } from "../features/games/game.api";
import { saveApi } from "../features/saves/save.api";
import type { Game } from "../features/games/game.types";
import type { Save } from "../features/saves/save.types";
import { Link } from "react-router-dom";

export default function HomePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [saves, setSaves] = useState<Save[]>([]);

  // Estado booleano para abrir e fechar o formulário de novo save
  const [isSaveFormOpen, setIsSaveFormOpen] = useState(false);

  const [name, setName] = useState("");
  const [gameId, setGameId] = useState<number | "">("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const [gamesData, savesData] = await Promise.all([
        gameApi.list(),
        saveApi.list(),
      ]);

      setGames(gamesData);
      setSaves(savesData);

      setLoading(false);
    }

    loadData();
  }, []);

  async function handleCreateSave(e: React.SubmitEvent) {
    e.preventDefault();

    if (name.trim() === "") {
      alert("O nome do save não pode ser vazio.");
      return;
    }
    if (gameId === "") {
      alert("Selecione um jogo.");
      return;
    }

    await saveApi.create({ name, gameId });

    const updatedSaves = await saveApi.list();

    setSaves(updatedSaves);

    setName("");
    setGameId(0);
    setIsSaveFormOpen(false);
  }

  return (
    <>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <>
          <h1>Football Career Tracker</h1>

          <button onClick={() => setIsSaveFormOpen((current) => !current)}>
            New Save
          </button>

          {isSaveFormOpen && (
            <form id="new-save-form" onSubmit={handleCreateSave}>
              <label htmlFor="save-name">Nome:</label>
              <input
                type="text"
                id="save-name"
                onChange={(e) => setName(e.target.value)}
                required
              />

              <label htmlFor="game-select">Jogo: </label>
              <select
                name="game"
                id="game-select"
                onChange={(e) => setGameId(Number(e.target.value))}
              >
                <option value="">Selecione um jogo</option>
                {games.map((game) => (
                  <option value={game.id} key={game.id}>
                    {game.name}
                  </option>
                ))}
              </select>

              <button type="submit">Criar save</button>
            </form>
          )}

          <h2>Games:</h2>
          {games.length === 0 ? (
            <p>Nenhum jogo cadastrado.</p>
          ) : (
            games.map((game) => <p key={game.id}>{game.name}</p>)
          )}
          <h2>Saves:</h2>
          {saves.length === 0 ? (
            <p>Nenhum save cadastrado.</p>
          ) : (
            saves.map((save) => (
              <div key={save.id}>
                <p key={save.id}>
                  {save.name} - {save.game.name}
                </p>

                <Link to={`/saves/${save.id}`}>Abrir</Link>
              </div>
            ))
          )}
        </>
      )}
    </>
  );
}
