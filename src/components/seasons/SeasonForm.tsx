import { type FormEvent, useState } from "react";

import styles from "./SeasonForm.module.scss";

export type SeasonFormData = {
  label: string;
  startDate: string;
  endDate: string;
};

type SeasonFormProps = {
  mode: "create" | "edit";
  initialValues?: Partial<SeasonFormData>;
  isSubmitting: boolean;
  onSubmit: (data: SeasonFormData) => Promise<void> | void;
  idPrefix: string;
};

export default function SeasonForm({
  mode,
  initialValues,
  isSubmitting,
  onSubmit,
  idPrefix,
}: SeasonFormProps) {
  const [label, setLabel] = useState(initialValues?.label ?? "");
  const [startDate, setStartDate] = useState(initialValues?.startDate ?? "");
  const [endDate, setEndDate] = useState(initialValues?.endDate ?? "");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedLabel = label.trim();

    if (!trimmedLabel || !startDate || !endDate) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (endDate < startDate) {
      setError("A data de término deve ser posterior à data de início.");
      return;
    }

    setError("");
    await onSubmit({ label: trimmedLabel, startDate, endDate });
  }

  const isCreateMode = mode === "create";

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${idPrefix}-label`}>
          Temporada
        </label>
        <input
          id={`${idPrefix}-label`}
          className={styles.input}
          type="text"
          value={label}
          placeholder="Ex.: 2026/27"
          onChange={(event) => setLabel(event.target.value)}
          disabled={isSubmitting}
          aria-invalid={Boolean(error) && !label.trim()}
        />
      </div>

      <div className={styles.dates}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${idPrefix}-start-date`}>
            Data de início
          </label>
          <input
            id={`${idPrefix}-start-date`}
            className={styles.input}
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            disabled={isSubmitting}
            aria-invalid={Boolean(error) && !startDate}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${idPrefix}-end-date`}>
            Data de término
          </label>
          <input
            id={`${idPrefix}-end-date`}
            className={styles.input}
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            disabled={isSubmitting}
            aria-invalid={Boolean(error) && (!endDate || endDate < startDate)}
          />
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button
        className={styles.submitButton}
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? isCreateMode
            ? "Criando..."
            : "Salvando..."
          : isCreateMode
            ? "Criar temporada"
            : "Salvar alterações"}
      </button>
    </form>
  );
}
