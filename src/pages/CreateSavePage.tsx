import styles from "./CreateSavePage.module.scss";
import { Link, useParams } from "react-router-dom";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Country } from "../features/countries/countries.types";
import { countryApi } from "../features/countries/countries.api";
import CountrySelect from "../features/countries/components/CountrySelect";
import { useNotification } from "../features/notifications/notification.hook";

export default function CreateSavePage() {
  const [saveName, setSaveName] = useState("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [managerName, setManagerName] = useState("");
  const [managerNationalityId, setManagerNationalityId] = useState<
    number | null
  >(null);
  const [managerBirthdate, setManagerBirthdate] = useState("");

  const { showNotification } = useNotification();

  const { gameId } = useParams();
  const id = gameId ? parseInt(gameId, 10) : null;

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      try {
        const countriesData = await countryApi.list();

        if (countriesData) {
          setCountries(countriesData);
        } else {
          showNotification("Erro carregando os países", "error", 3000);
        }
      } catch (err) {
        showNotification("Erro carregando os países", "error", 3000);
        console.error("Error loading data:", err);
      }
    }

    loadData();
  }, [id, showNotification]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <header>
          <h2>Nova carreira</h2>
          <p>Configure os dados iniciais da sua nova carreira</p>
          <Link to={`/games/${id}`}>
            <X className={styles.icon} />
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
              placeholder="Ex.: Carreira do José"
              className={styles.input}
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
              className={styles.input}
              required
            />
            <div className={`${styles.nationality} ${styles.input}`}>
              <CountrySelect
                countries={countries}
                value={managerNationalityId ?? null}
                onChange={setManagerNationalityId}
                label="País"
              />
            </div>
            <label htmlFor="birthdate">Data de nascimento</label>
            <input
              type="date"
              id="birthdate"
              onChange={(e) => setManagerBirthdate(e.target.value)}
              placeholder="Ex.: 01/01/2000"
              className={styles.input}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
