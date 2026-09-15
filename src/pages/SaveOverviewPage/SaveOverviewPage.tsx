import { ArrowRight, Building2, Flag, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";

import type { Save } from "../../features/saves/save.types";
import { managerAssignmentApi } from "../../features/teams/team.api";
import type { ManagerAssignment } from "../../features/teams/team.types";
import styles from "./SaveOverviewPage.module.scss";

type SaveLayoutContext = {
  save: Save | null;
};

type AssignmentState = {
  status: "loading" | "ready" | "error";
  assignment: ManagerAssignment | null;
};

type AssignmentSummaryProps = {
  title: string;
  emptyLabel: string;
  state: AssignmentState;
  to: string;
  icon: LucideIcon;
};

const loadingAssignment: AssignmentState = {
  status: "loading",
  assignment: null,
};

function AssignmentSummary({
  title,
  emptyLabel,
  state,
  to,
  icon: Icon,
}: AssignmentSummaryProps) {
  const value =
    state.status === "loading"
      ? "Carregando..."
      : state.status === "error"
        ? "Indisponível"
        : (state.assignment?.saveTeam.team.name ?? emptyLabel);

  return (
    <Link className={styles.teamSummary} to={to}>
      <span className={styles.summaryIcon}>
        <Icon aria-hidden="true" />
      </span>
      <span className={styles.summaryContent}>
        <span>{title}</span>
        <strong>{value}</strong>
      </span>
      <ArrowRight aria-hidden="true" />
    </Link>
  );
}

export default function SaveOverviewPage() {
  const { save } = useOutletContext<SaveLayoutContext>();
  const [club, setClub] = useState<AssignmentState>(loadingAssignment);
  const [nationalTeam, setNationalTeam] =
    useState<AssignmentState>(loadingAssignment);
  const saveId = save?.id;

  useEffect(() => {
    if (saveId === undefined) {
      return;
    }

    const currentSaveId = saveId;
    let isCurrent = true;

    async function loadCurrentTeams() {
      setClub(loadingAssignment);
      setNationalTeam(loadingAssignment);

      const [clubResult, nationalTeamResult] = await Promise.allSettled([
        managerAssignmentApi.getCurrent(currentSaveId, "club"),
        managerAssignmentApi.getCurrent(currentSaveId, "national"),
      ]);

      if (!isCurrent) {
        return;
      }

      setClub(
        clubResult.status === "fulfilled"
          ? { status: "ready", assignment: clubResult.value }
          : { status: "error", assignment: null },
      );
      setNationalTeam(
        nationalTeamResult.status === "fulfilled"
          ? { status: "ready", assignment: nationalTeamResult.value }
          : { status: "error", assignment: null },
      );

      if (clubResult.status === "rejected") {
        console.error("Erro ao carregar o clube atual:", clubResult.reason);
      }

      if (nationalTeamResult.status === "rejected") {
        console.error(
          "Erro ao carregar a seleção atual:",
          nationalTeamResult.reason,
        );
      }
    }

    void loadCurrentTeams();

    return () => {
      isCurrent = false;
    };
  }, [saveId]);

  if (!save) {
    return <p className={styles.loading}>Carregando carreira...</p>;
  }

  return (
    <section className={styles.overview} aria-labelledby="save-overview-title">
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Visão geral</p>
        <h1 id="save-overview-title">{save.name}</h1>
        <p>Acompanhe a configuração atual desta carreira.</p>
      </div>

      <dl className={styles.details}>
        <div>
          <dt>Jogo</dt>
          <dd>{save.game.name}</dd>
        </div>
        <div>
          <dt>Treinador</dt>
          <dd>{save.manager.name}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{save.status}</dd>
        </div>
      </dl>

      <div className={styles.teamSummaries}>
        <AssignmentSummary
          title="Clube atual"
          emptyLabel="Não definido"
          state={club}
          to={`/saves/${save.id}/club`}
          icon={Building2}
        />
        <AssignmentSummary
          title="Seleção atual"
          emptyLabel="Não definida"
          state={nationalTeam}
          to={`/saves/${save.id}/national-team`}
          icon={Flag}
        />
      </div>

      {save.currentSeasonId === null && (
        <p className={styles.notice}>Temporada ainda não configurada.</p>
      )}
    </section>
  );
}
