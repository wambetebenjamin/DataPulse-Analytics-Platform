import type { ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import styles from "./dashboard.module.css";

/**
 * "How is this calculated?" expander.
 *
 * The brief requires one next to every derived metric. Implemented with native
 * <details> so it works without JavaScript and is announced correctly by
 * screen readers.
 */
export default function Explainer({
  title = "How is this calculated?",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <details className={styles.explainer}>
      <summary className={styles.explainerSummary}>
        <HelpCircle size={14} aria-hidden="true" />
        {title}
      </summary>
      <div className={styles.explainerBody}>{children}</div>
    </details>
  );
}
