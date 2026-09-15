import {
  Building2,
  CalendarDays,
  Flag,
  MapPin,
  Plus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";

import type { BreadcrumbItem } from "../../../components/navigation/Breadcrumbs";
import type { Save } from "../../saves/save.types";
import { useNotification } from "../../notifications/notification.hook";
import {
  managerAssignmentApi,
  saveTeamApi,
  teamApi,
} from "../team.api";
import type {
  ManagerAssignment,
  SaveTeam,
  Team,
  TeamType,
} from "../team.types";
import TeamForm, { type TeamFormData } from "./TeamForm";
import TeamSelect from "./TeamSelect";
import styles from "./TeamAssignmentPage.module.scss";

type SaveLayoutContext = {
  save: Save | null;
  setPageBreadcrumbs: (items: BreadcrumbItem[]) => void;
};

type TeamAssignmentPageProps = {
  type: TeamType;
};

type SetupStep = "team" | "saveTeam" | "assignment";

const pageContent = {
  club: {
    title: "Clube",
    currentLabel: "Clube atual",
    entityLabel: "clube",
    emptyTitle: "Defina o clube desta carreira",
    emptyDescription:
      "Escolha um clube existente ou cadastre um novo para iniciar o vínculo do treinador.",
    seasonMessage: "Configure uma temporada antes de definir seu clube.",
    icon: Building2,
  },
  national: {
    title: "Seleção",
    currentLabel: "Seleção atual",
    entityLabel: "seleção",
    emptyTitle: "Defina a seleção desta carreira",
    emptyDescription:
      "Escolha uma seleção existente ou cadastre uma nova para iniciar o vínculo do treinador.",
    seasonMessage: "Configure uma temporada antes de definir sua seleção.",
    icon: Flag,
  },
} as const;

function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR").format(
    new Date(year, month - 1, day),
  );
}

export default function TeamAssignmentPage({
  type,
}: TeamAssignmentPageProps) {
  const { save, setPageBreadcrumbs } =
    useOutletContext<SaveLayoutContext>();
  const { showNotification } = useNotification();
  const content = pageContent[type];
  const PageIcon = content.icon;
  const [currentAssignment, setCurrentAssignment] =
    useState<ManagerAssignment | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [saveTeams, setSaveTeams] = useState<SaveTeam[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [setupMode, setSetupMode] = useState<"existing" | "new">("existing");
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const saveId = save?.id;

  useEffect(() => {
    setPageBreadcrumbs([{ label: content.title }]);

    return () => setPageBreadcrumbs([]);
  }, [content.title, setPageBreadcrumbs]);

  useEffect(() => {
    if (saveId === undefined) {
      return;
    }

    const currentSaveId = saveId;
    let isCurrent = true;

    async function loadPageData() {
      setIsLoading(true);
      setHasLoadError(false);

      try {
        const assignment = await managerAssignmentApi.getCurrent(
          currentSaveId,
          type,
        );

        if (!isCurrent) {
          return;
        }

        setCurrentAssignment(assignment);

        if (assignment || save?.currentSeasonId === null) {
          setTeams([]);
          setSaveTeams([]);
          return;
        }

        const [availableTeams, linkedTeams] = await Promise.all([
          teamApi.list({ type }),
          saveTeamApi.listBySaveId(currentSaveId, { type }),
        ]);

        if (isCurrent) {
          setTeams(availableTeams);
          setSaveTeams(linkedTeams);
        }
      } catch (error) {
        if (isCurrent) {
          setHasLoadError(true);
          showNotification(
            `Erro ao carregar os dados de ${content.entityLabel}`,
            "error",
            3000,
          );
        }

        console.error(`Erro ao carregar ${content.entityLabel}:`, error);
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    void loadPageData();

    return () => {
      isCurrent = false;
    };
  }, [
    content.entityLabel,
    reloadKey,
    save?.currentSeasonId,
    saveId,
    showNotification,
    type,
  ]);

  async function resolveSaveTeam(team: Team) {
    const linkedTeam = saveTeams.find((item) => item.teamId === team.id);

    if (linkedTeam) {
      return linkedTeam;
    }

    try {
      const createdSaveTeam = await saveTeamApi.create({
        saveId: teamAssignmentSave.id,
        teamId: team.id,
      });

      setSaveTeams((current) => [...current, createdSaveTeam]);
      return createdSaveTeam;
    } catch (creationError) {
      try {
        const refreshedSaveTeams = await saveTeamApi.listBySaveId(
          teamAssignmentSave.id,
          { type },
        );
        const existingAfterConflict = refreshedSaveTeams.find(
          (item) => item.teamId === team.id,
        );

        setSaveTeams(refreshedSaveTeams);

        if (existingAfterConflict) {
          return existingAfterConflict;
        }
      } catch (refreshError) {
        console.error("Erro ao atualizar os times associados:", refreshError);
      }

      throw creationError;
    }
  }

  function showSetupError(step: SetupStep, teamWasCreated: boolean) {
    if (step === "team") {
      showNotification("Não foi possível criar o time", "error", 4000);
      return;
    }

    if (step === "saveTeam") {
      showNotification(
        teamWasCreated
          ? "O time foi criado, mas não foi possível associá-lo à carreira."
          : "Não foi possível associar o time à carreira.",
        "error",
        4000,
      );
      return;
    }

    showNotification(
      `O time foi associado, mas não foi possível defini-lo como ${content.entityLabel} atual.`,
      "error",
      4000,
    );
  }

  async function finishSetup(team: Team, teamWasCreated: boolean) {
    const startSeasonId = teamAssignmentSave.currentSeasonId;

    if (startSeasonId === null) {
      showNotification(content.seasonMessage, "error", 3000);
      return;
    }

    let step: SetupStep = "saveTeam";

    try {
      const linkedTeam = await resolveSaveTeam(team);
      step = "assignment";

      const assignment = await managerAssignmentApi.create({
        saveId: teamAssignmentSave.id,
        saveTeamId: linkedTeam.id,
        startSeasonId,
      });

      setCurrentAssignment(assignment);
      setSelectedTeamId(null);
      showNotification(
        `${team.name} definido como ${content.entityLabel} atual.`,
        "success",
        3000,
      );
    } catch (error) {
      showSetupError(step, teamWasCreated);
      console.error(`Erro durante a configuração de ${content.entityLabel}:`, error);
    }
  }

  async function handleExistingTeam() {
    if (isSubmitting) {
      return;
    }

    const team = teams.find((item) => item.id === selectedTeamId);

    if (!team) {
      showNotification("Selecione um time para continuar", "error", 3000);
      return;
    }

    setIsSubmitting(true);

    try {
      await finishSetup(team, false);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleNewTeam(data: TeamFormData) {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    let step: SetupStep = "team";

    try {
      const team = await teamApi.create({ ...data, type });

      setTeams((current) =>
        [...current, team].sort((first, second) =>
          first.name.localeCompare(second.name, "pt-BR"),
        ),
      );
      step = "saveTeam";
      await finishSetup(team, true);
    } catch (error) {
      showSetupError(step, false);
      console.error("Erro ao criar o time:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!save) {
    return <p className={styles.loading}>Carregando carreira...</p>;
  }

  const teamAssignmentSave = save;

  if (isLoading) {
    return <p className={styles.loading}>Carregando {content.entityLabel}...</p>;
  }

  return (
    <section className={styles.page} aria-labelledby="team-page-title">
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Carreira</p>
          <h1 id="team-page-title">{content.title}</h1>
          <p className={styles.description}>
            Consulte e configure o vínculo atual do treinador.
          </p>
        </div>
        <PageIcon aria-hidden="true" />
      </header>

      {hasLoadError ? (
        <div className={styles.stateCard}>
          <h2>Não foi possível carregar esta página</h2>
          <p>Tente novamente para consultar os dados atuais.</p>
          <button type="button" onClick={() => setReloadKey((key) => key + 1)}>
            Tentar novamente
          </button>
        </div>
      ) : currentAssignment ? (
        <article className={styles.currentCard}>
          <div className={styles.currentHeading}>
            <span className={styles.teamIcon}>
              <PageIcon aria-hidden="true" />
            </span>
            <div>
              <span className={styles.status}>{content.currentLabel}</span>
              <h2>{currentAssignment.saveTeam.team.name}</h2>
              {currentAssignment.saveTeam.team.shortName &&
                currentAssignment.saveTeam.team.shortName !==
                  currentAssignment.saveTeam.team.name && (
                  <p>{currentAssignment.saveTeam.team.shortName}</p>
                )}
            </div>
          </div>

          <dl className={styles.teamDetails}>
            <div>
              <dt>
                <MapPin aria-hidden="true" /> País
              </dt>
              <dd>{currentAssignment.saveTeam.team.country.name}</dd>
            </div>
            {currentAssignment.saveTeam.team.shortCode && (
              <div>
                <dt>
                  <Users aria-hidden="true" /> Código
                </dt>
                <dd>{currentAssignment.saveTeam.team.shortCode}</dd>
              </div>
            )}
            <div>
              <dt>
                <CalendarDays aria-hidden="true" /> Temporada inicial
              </dt>
              <dd>{currentAssignment.startSeason.label}</dd>
            </div>
            {currentAssignment.startDate && (
              <div>
                <dt>
                  <CalendarDays aria-hidden="true" /> Data de início
                </dt>
                <dd>{formatDate(currentAssignment.startDate)}</dd>
              </div>
            )}
          </dl>
        </article>
      ) : teamAssignmentSave.currentSeasonId === null ? (
        <div className={styles.stateCard}>
          <CalendarDays aria-hidden="true" />
          <h2>Temporada necessária</h2>
          <p>{content.seasonMessage}</p>
          <Link to={`/saves/${teamAssignmentSave.id}/seasons`}>
            Configurar temporadas
          </Link>
        </div>
      ) : (
        <div className={styles.setup}>
          <div className={styles.setupIntro}>
            <h2>{content.emptyTitle}</h2>
            <p>{content.emptyDescription}</p>
          </div>

          <div className={styles.modeTabs} aria-label="Forma de configuração">
            <button
              className={setupMode === "existing" ? styles.activeTab : ""}
              type="button"
              onClick={() => setSetupMode("existing")}
              disabled={isSubmitting}
            >
              Escolher existente
            </button>
            <button
              className={setupMode === "new" ? styles.activeTab : ""}
              type="button"
              onClick={() => setSetupMode("new")}
              disabled={isSubmitting}
            >
              <Plus aria-hidden="true" /> Cadastrar novo
            </button>
          </div>

          {setupMode === "existing" ? (
            <div className={styles.setupContent}>
              <TeamSelect
                teams={teams}
                value={selectedTeamId}
                onChange={setSelectedTeamId}
                disabled={isSubmitting}
              />
              <button
                className={styles.primaryButton}
                type="button"
                onClick={() => void handleExistingTeam()}
                disabled={selectedTeamId === null || isSubmitting}
              >
                {isSubmitting
                  ? "Definindo..."
                  : `Definir como ${content.entityLabel} atual`}
              </button>
            </div>
          ) : (
            <div className={styles.setupContent}>
              <TeamForm
                type={type}
                isSubmitting={isSubmitting}
                onSubmit={handleNewTeam}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
