import { useEffect, useState } from "react";
import "./App.css";
import { gameApi } from "./features/games/game.api";
import { saveApi } from "./features/saves/save.api";

function App() {
  const [games, setGames] = useState([]);
  const [saves, setSaves] = useState([]);

  const [name, setName] = useState("");
  const [gameId, setGameId] = useState(0);

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
  return (
    <>
      <main>Football Career Tracker</main>
      <h2>{loading ? "Carregando..." : JSON.stringify(saves)}</h2>
    </>
  );
}

export default App;
