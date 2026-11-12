import { ShieldCheck, X } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

interface PrivacyPolicyModalProps {
  open: boolean;
  onClose: () => void;
}

const sections = ["collected", "purpose", "retention", "protection", "rights"] as const;

export function PrivacyPolicyModal({ open, onClose }: PrivacyPolicyModalProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="privacy-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="privacy-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-modal-title"
      >
        <header>
          <span><ShieldCheck size={24} /></span>
          <div>
            <small>{t("common.brand")}</small>
            <h2 id="privacy-modal-title">{t("privacyModal.title")}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label={t("privacyModal.close")}>
            <X size={21} />
          </button>
        </header>
        <p className="privacy-modal-intro">{t("privacyModal.intro")}</p>
        <div className="privacy-policy-sections">
          {sections.map((section) => (
            <article key={section}>
              <h3>{t(`privacyModal.${section}Title`)}</h3>
              <p>{t(`privacyModal.${section}Body`)}</p>
            </article>
          ))}
        </div>
        <button type="button" className="primary-button privacy-modal-close" onClick={onClose}>
          {t("privacyModal.confirm")}
        </button>
      </section>
    </div>
  );
}
