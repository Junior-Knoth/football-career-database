import styles from "./CreateSavePage.module.scss";
import { Link, useParams } from "react-router-dom";
import { X } from "lucide-react";
import { useState } from "react";

export default function CreateSavePage() {
  const [saveName, setSaveName] = useState("");
  const [managerName, setManagerName] = useState("");
  const [managerNationality, setManagerNationality] = useState("");
  const [managerBirthdate, setManagerBirthdate] = useState("");

  const { gameId } = useParams();
  const id = gameId ? parseInt(gameId, 10) : null;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <header>
          <h2>Nova carreira</h2>
          <p>Configure os dados iniciais da sua nova carreira</p>
          <Link to={`/games/${id}`}>
            <X />
          </Link>
        </header>

        <form className={styles.form}>
          <div>
            <h3>Dados da carreira</h3>
            <label htmlFor="save-name">Nome</label>
            <input
              type="text"
              id="save-name"
              onChange={(e) => setSaveName(e.target.value)}
              required
            />
          </div>
          <div>
            <h3>Dados do treinador</h3>
            <label htmlFor="manager-name">Nome</label>
            <input
              type="text"
              id="manager-name"
              onChange={(e) => setManagerName(e.target.value)}
              placeholder="Ex.: José Mourinho"
              required
            />
            <label htmlFor="manager-nationality">Nacionalidade</label>
            <input type="text" />
          </div>
        </form>
      </div>
    </div>
  );
}
