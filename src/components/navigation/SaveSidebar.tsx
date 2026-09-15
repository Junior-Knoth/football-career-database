import {
  ArrowRightLeft,
  CalendarDays,
  ChartColumn,
  CircleUserRound,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import type { Save } from "../../features/saves/save.types";
import styles from "./SaveSidebar.module.scss";

type SaveSidebarProps = {
  save: Save | null;
};

const navigationItems = [
  { label: "Overview", path: "", icon: LayoutDashboard },
  { label: "Seasons", path: "seasons", icon: CalendarDays },
  { label: "Players", path: "players", icon: Users },
  { label: "Club", path: "club", icon: CircleUserRound },
  { label: "National Team", path: "national-team", icon: Users },
  { label: "Transfers", path: "transfers", icon: ArrowRightLeft },
  { label: "Statistics", path: "statistics", icon: ChartColumn },
  { label: "Manager", path: "manager", icon: CircleUserRound },
];

export default function SaveSidebar({ save }: SaveSidebarProps) {
  if (!save) {
    return (
      <aside className={styles.sidebar} aria-label="Navegação da carreira">
        <p className={styles.loading}>Carregando carreira...</p>
      </aside>
    );
  }

  const basePath = `/saves/${save.id}`;

  return (
    <aside className={styles.sidebar} aria-label="Navegação da carreira">
      <div className={styles.identity}>
        <span className={styles.eyebrow}>Carreira</span>
        <strong className={styles.saveName}>{save.name}</strong>
        <span className={styles.gameName}>{save.game.name}</span>
      </div>

      <nav className={styles.navigation}>
        <ul className={styles.navigationList}>
          {navigationItems.map(({ label, path, icon: Icon }) => (
            <li key={path || "overview"}>
              <NavLink
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.active : ""}`
                }
                end={path === ""}
                to={path ? `${basePath}/${path}` : basePath}
              >
                <Icon className={styles.icon} aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
