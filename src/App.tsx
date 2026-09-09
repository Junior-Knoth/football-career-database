import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [data, setData] = useState(null);
  async function handleAppBuild() {
    try {
      const response = await fetch("/api/player");

      const data = await response.json();

      setData(data);
    } catch (error) {
      console.error("Erro ao buscar os dados:", error);
    }
  }

  useEffect(() => {
    handleAppBuild();
  }, []);
  return (
    <>
      <main>Football Career Tracker</main>
      <h2>{data ? JSON.stringify(data) : "Carregando..."}</h2>
    </>
  );
}

export default App;
