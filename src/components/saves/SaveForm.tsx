import { type FormEvent, useEffect, useState } from "react";

import { countryApi } from "../../features/countries/countries.api";
import type { Country } from "../../features/countries/countries.types";
import CountrySelect from "../../features/countries/components/CountrySelect";
import { useNotification } from "../../features/notifications/notification.hook";
import { isValidDate } from "../../utils/utils";
import styles from "./SaveForm.module.scss";

export type SaveFormData = {
  name: string;
  managerName: string;
  managerBirthDate: string;
  managerNationalityId: number;
};

export type SaveFormInitialValues = {
  name: string;
  managerName: string;
  managerBirthDate: string;
  managerNationalityId: number | null;
};

type SaveFormProps = {
  mode: "create" | "edit";
  initialValues?: Partial<SaveFormInitialValues>;
  isSubmitting: boolean;
  onSubmit: (data: SaveFormData) => Promise<void> | void;
  idPrefix?: string;
};

export default function SaveForm({
  mode,
  initialValues,
  isSubmitting,
  onSubmit,
  idPrefix = "save-form",
}: SaveFormProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [name, setName] = useState(initialValues?.name ?? "");
  const [managerName, setManagerName] = useState(
    initialValues?.managerName ?? "",
  );
  const [managerNationalityId, setManagerNationalityId] = useState<
    number | null
  >(initialValues?.managerNationalityId ?? null);
  const [managerBirthDate, setManagerBirthDate] = useState(
    initialValues?.managerBirthDate ?? "",
  );
  const { showNotification } = useNotification();

  useEffect(() => {
    let isCurrent = true;

    async function loadCountries() {
      try {
        const countriesData = await countryApi.list();

        if (isCurrent) {
          setCountries(countriesData);
        }
      } catch (error) {
        if (isCurrent) {
          showNotification("Erro ao carregar os países", "error", 3000);
        }

        console.error("Error loading countries:", error);
      }
    }

    void loadCountries();

    return () => {
      isCurrent = false;
    };
  }, [showNotification]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedManagerName = managerName.trim();

    if (
      !trimmedName ||
      !trimmedManagerName ||
      !managerNationalityId ||
      !managerBirthDate
    ) {
      showNotification(
        `Campos obrigatórios restantes: ${[
          !trimmedName ? "Nome da carreira" : null,
          !trimmedManagerName ? "Nome do treinador" : null,
          !managerNationalityId ? "Nacionalidade" : null,
          !managerBirthDate ? "Nascimento" : null,
        ]
          .filter(Boolean)
          .join(", ")}`,
        "error",
        3000,
      );
      return;
    }

    if (!isValidDate(managerBirthDate)) {
      showNotification("Data de nascimento inválida", "error", 3000);
      return;
    }

    await onSubmit({
      name: trimmedName,
      managerName: trimmedManagerName,
      managerBirthDate,
      managerNationalityId,
    });
  }

  const isCreateMode = mode === "create";

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.career}>
        <h3 className={styles.sectionHeading}>
          <span className={styles.sectionTitle}>Dados da carreira</span>
          <span className={styles.line} aria-hidden="true" />
        </h3>
        <label className={styles.label} htmlFor={`${idPrefix}-name`}>
          Nome
        </label>
        <input
          id={`${idPrefix}-name`}
          className={styles.input}
          type="text"
          value={name}
          placeholder="Ex.: Carreira do José"
          onChange={(event) => setName(event.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className={styles.manager}>
        <h3 className={styles.sectionHeading}>
          <span className={styles.sectionTitle}>Dados do treinador</span>
          <span className={styles.line} aria-hidden="true" />
        </h3>

        <div className={styles.name}>
          <label className={styles.label} htmlFor={`${idPrefix}-manager-name`}>
            Nome
          </label>
          <input
            id={`${idPrefix}-manager-name`}
            className={styles.input}
            type="text"
            value={managerName}
            placeholder="Ex.: José Mourinho"
            onChange={(event) => setManagerName(event.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.nationality}>
          <CountrySelect
            id={`${idPrefix}-manager-nationality`}
            countries={countries}
            value={managerNationalityId}
            onChange={setManagerNationalityId}
            label="Nacionalidade"
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.birthDate}>
          <label className={styles.label} htmlFor={`${idPrefix}-birth-date`}>
            Data de nascimento
          </label>
          <input
            id={`${idPrefix}-birth-date`}
            className={styles.input}
            type="date"
            value={managerBirthDate}
            onChange={(event) => setManagerBirthDate(event.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <button
        className={styles.saveButton}
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? isCreateMode
            ? "Criando..."
            : "Salvando..."
          : isCreateMode
            ? "Criar carreira"
            : "Salvar alterações"}
      </button>
    </form>
  );
}
