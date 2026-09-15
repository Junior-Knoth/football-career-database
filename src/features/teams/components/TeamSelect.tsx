import { Check, Search } from "lucide-react";
import { useMemo, useState } from "react";

import type { Team } from "../team.types";
import styles from "./TeamSelect.module.scss";

type TeamSelectProps = {
  teams: Team[];
  value: number | null;
  onChange: (teamId: number) => void;
  disabled?: boolean;
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function TeamSelect({
  teams,
  value,
  onChange,
  disabled = false,
}: TeamSelectProps) {
  const [search, setSearch] = useState("");

  const filteredTeams = useMemo(() => {
    const normalizedSearch = normalizeText(search.trim());

    if (!normalizedSearch) {
      return teams;
    }

    return teams.filter((team) =>
      [team.name, team.shortName, team.shortCode]
        .filter((item): item is string => Boolean(item))
        .some((item) => normalizeText(item).includes(normalizedSearch)),
    );
  }, [search, teams]);

  return (
    <div className={styles.container}>
      <label className={styles.label} htmlFor="team-search">
        Buscar time
      </label>
      <div className={styles.searchField}>
        <Search aria-hidden="true" />
        <input
          id="team-search"
          type="search"
          value={search}
          placeholder="Nome, nome curto ou código"
          onChange={(event) => setSearch(event.target.value)}
          disabled={disabled}
        />
      </div>

      {filteredTeams.length === 0 ? (
        <p className={styles.empty}>Nenhum time encontrado.</p>
      ) : (
        <ul className={styles.list}>
          {filteredTeams.map((team) => {
            const isSelected = team.id === value;
            const secondary = [team.country.name, team.shortCode]
              .filter(Boolean)
              .join(" · ");

            return (
              <li key={team.id}>
                <button
                  className={`${styles.option} ${isSelected ? styles.selected : ""}`}
                  type="button"
                  onClick={() => onChange(team.id)}
                  disabled={disabled}
                  aria-pressed={isSelected}
                >
                  <span>
                    <strong>{team.name}</strong>
                    <small>{secondary}</small>
                  </span>
                  {isSelected && <Check aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
