import { useTranslation } from "react-i18next";

import loadingDocuments from "../assets/loading-documents.png";

interface PageLoadingProps {
  title: string;
  description?: string;
  compact?: boolean;
}

export function PageLoading({ title, description, compact = false }: PageLoadingProps) {
  const { t } = useTranslation();

  return (
    <div className={`loading-card${compact ? " compact" : ""}`} role="status" aria-live="polite">
      <div className="loading-visual" aria-hidden="true">
        <span className="loading-orbit" />
        <img src={loadingDocuments} alt="" />
      </div>
      <h2>{title}</h2>
      <p>{description ?? t("common.loadingDescription")}</p>
    </div>
  );
}
