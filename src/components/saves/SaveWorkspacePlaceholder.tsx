import styles from "./SaveWorkspacePlaceholder.module.scss";

type SaveWorkspacePlaceholderProps = {
  title: string;
};

export default function SaveWorkspacePlaceholder({
  title,
}: SaveWorkspacePlaceholderProps) {
  return (
    <section className={styles.placeholder} aria-labelledby="placeholder-title">
      <h1 id="placeholder-title">{title}</h1>
      <p>Em breve</p>
    </section>
  );
}
