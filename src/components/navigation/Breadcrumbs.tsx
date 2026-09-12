import { Link } from "react-router-dom";
import styles from "./Breadcrumbs.module.scss";
import { ChevronRight } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  to?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className={styles.breadcrumbItem}
            >
              {item.to && !isLast ? (
                <Link to={item.to} className={styles.breadcrumbLink}>
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={`${styles.breadcrumbLink} ${isLast ? styles.current : ""}`}
                >
                  {item.label}
                </span>
              )}

              {!isLast && <ChevronRight className={styles.icon} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
