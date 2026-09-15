import { type FormEvent, useEffect, useState } from "react";

import { countryApi } from "../../countries/countries.api";
import type { Country } from "../../countries/countries.types";
import CountrySelect from "../../countries/components/CountrySelect";
import { useNotification } from "../../notifications/notification.hook";
import type { TeamType } from "../team.types";
import styles from "./TeamForm.module.scss";

export type TeamFormData = {
  name: string;
  shortName?: string;
  shortCode?: string;
  countryId: number;
};

type TeamFormProps = {
  type: TeamType;
  isSubmitting: boolean;
  onSubmit: (data: TeamFormData) => Promise<void> | void;
};

export default function TeamForm({
  type,
  isSubmitting,
  onSubmit,
}: TeamFormProps) {
  const { showNotification } = useNotification();
  const [countries, setCountries] = useState<Country[]>([]);
  const [countryId, setCountryId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [error, setError] = useState("");
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    async function loadCountries() {
      setIsLoadingCountries(true);

      try {
        const countriesData = await countryApi.list();

        if (isCurrent) {
          setCountries(countriesData);
        }
      } catch (loadError) {
        if (isCurrent) {
          showNotification("Erro ao carregar os países", "error", 3000);
        }

        console.error("Erro ao carregar os países:", loadError);
      } finally {
        if (isCurrent) {
          setIsLoadingCountries(false);
        }
      }
    }

    void loadCountries();

    return () => {
      isCurrent = false;
    };
  }, [showNotification]);

  function handleCountryChange(nextCountryId: number | null) {
    setCountryId(nextCountryId);

    if (type !== "national" || nextCountryId === null) {
      return;
    }

    const country = countries.find((item) => item.id === nextCountryId);

    if (!country) {
      return;
    }

    if (!name.trim()) {
      setName(country.name);
    }

    if (!shortCode.trim()) {
      setShortCode(country.shortCode);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedShortName = shortName.trim();
    const trimmedShortCode = shortCode.trim();

    if (!trimmedName || countryId === null) {
      setError("Informe o nome e o país do time.");
      return;
    }

    setError("");
    await onSubmit({
      name: trimmedName,
      countryId,
      ...(trimmedShortName ? { shortName: trimmedShortName } : {}),
      ...(trimmedShortCode ? { shortCode: trimmedShortCode } : {}),
    });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="team-name">Nome</label>
        <input
          id="team-name"
          type="text"
          value={name}
          placeholder={type === "club" ? "Ex.: Lincoln City" : "Ex.: Brasil"}
          onChange={(event) => setName(event.target.value)}
          disabled={isSubmitting}
          aria-invalid={Boolean(error) && !name.trim()}
        />
      </div>

      <div className={styles.optionalFields}>
        <div className={styles.field}>
          <label htmlFor="team-short-name">Nome curto</label>
          <input
            id="team-short-name"
            type="text"
            value={shortName}
            placeholder="Opcional"
            onChange={(event) => setShortName(event.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="team-short-code">Código</label>
          <input
            id="team-short-code"
            type="text"
            value={shortCode}
            placeholder="Ex.: LCN"
            onChange={(event) => setShortCode(event.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <CountrySelect
        id="team-country"
        countries={countries}
        value={countryId}
        onChange={handleCountryChange}
        label="País"
        disabled={isSubmitting || isLoadingCountries}
      />

      {error && <p className={styles.error}>{error}</p>}

      <button
        className={styles.submitButton}
        type="submit"
        disabled={isSubmitting || isLoadingCountries}
      >
        {isSubmitting ? "Criando e definindo..." : "Criar e definir como atual"}
      </button>
    </form>
  );
}
