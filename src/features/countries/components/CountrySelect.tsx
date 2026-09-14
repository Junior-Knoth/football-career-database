import { useMemo, useState } from "react";

import type { Country } from "../countries.types";
import styles from "./CountrySelect.module.scss";

type CountrySelectProps = {
  countries: Country[];
  value: number | null;
  onChange: (countryId: number | null) => void;
  label?: string;
  id?: string;
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function CountrySelect({
  countries,
  value,
  onChange,
  label = "Nacionalidade",
  id = "country-select",
}: CountrySelectProps) {
  const [searchText, setSearchText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedCountry = countries.find((country) => country.id === value);

  const filteredCountries = useMemo(() => {
    const normalizedSearch = normalizeText(searchText.trim());

    if (!normalizedSearch) {
      return countries;
    }

    return countries.filter((country) =>
      normalizeText(country.name).includes(normalizedSearch),
    );
  }, [countries, searchText]);

  const listId = `${id}-listbox`;

  function selectCountry(country: Country) {
    onChange(country.id);

    setSearchText("");
    setIsEditing(false);
    setIsOpen(false);
    setActiveIndex(0);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (!isOpen) {
        setIsOpen(true);
        return;
      }

      setActiveIndex((current) =>
        Math.min(current + 1, filteredCountries.length - 1),
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setActiveIndex((current) => Math.max(current - 1, 0));
    }

    if (event.key === "Enter") {
      if (!isOpen || filteredCountries.length === 0) {
        return;
      }

      event.preventDefault();

      selectCountry(filteredCountries[activeIndex]);
    }

    if (event.key === "Escape") {
      setIsOpen(false);
      setIsEditing(false);
      setSearchText("");
    }
  }

  const inputValue = isEditing ? searchText : (selectedCountry?.name ?? "");

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>

      <div className={styles.combobox}>
        <input
          id={id}
          className={styles.input}
          type="text"
          value={inputValue}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            isOpen && filteredCountries[activeIndex]
              ? `${id}-option-${filteredCountries[activeIndex].id}`
              : undefined
          }
          onFocus={() => {
            setSearchText(selectedCountry?.name ?? "");
            setIsEditing(true);
            setIsOpen(true);
            setActiveIndex(0);
          }}
          onChange={(event) => {
            setSearchText(event.target.value);
            setIsEditing(true);
            setIsOpen(true);
            setActiveIndex(0);

            // Ao editar o texto, a seleção anterior
            // deixa de ser considerada válida.
            onChange(null);
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            setIsOpen(false);
            setIsEditing(false);
            setSearchText("");
          }}
        />

        {isOpen && (
          <ul id={listId} className={styles.dropdown} role="listbox">
            {filteredCountries.length === 0 ? (
              <li className={styles.emptyState}>Nenhum país encontrado</li>
            ) : (
              filteredCountries.map((country, index) => {
                const isActive = index === activeIndex;
                const isSelected = country.id === value;

                return (
                  <li
                    id={`${id}-option-${country.id}`}
                    key={country.id}
                    role="option"
                    aria-selected={isSelected}
                    className={[
                      styles.option,
                      isActive ? styles.optionActive : "",
                      isSelected ? styles.optionSelected : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onMouseDown={(event) => {
                      // Impede o input de perder foco antes
                      // da seleção acontecer.
                      event.preventDefault();
                    }}
                    onClick={() => {
                      selectCountry(country);
                    }}
                    onMouseEnter={() => {
                      setActiveIndex(index);
                    }}
                  >
                    <span className={styles.optionName}>{country.name}</span>

                    <span className={styles.optionCode}>
                      {country.shortCode}
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
