import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

export function StepSidebar({ current }: { current: number }) {
  const { t } = useTranslation();
  const steps = Array.from({ length: 9 }, (_, index) => [
    t(`wizard.steps.${index}.short`),
    t(`wizard.steps.${index}.detail`),
  ]);
  return (
    <aside className="step-sidebar" aria-label={t("common.applicationSteps")}>
      <p className="sidebar-eyebrow">{t("wizard.progress")}</p>
      <ol>
        {steps.map(([title, description], index) => {
          const step = index + 1;
          const state = step < current ? "done" : step === current ? "active" : "";
          return (
            <li className={state} key={title}>
              <span className="step-number">{step < current ? <Check size={14} /> : step}</span>
              <span><strong>{title}</strong><small>{description}</small></span>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

export function MobileProgress({ current }: { current: number }) {
  const { t } = useTranslation();
  return (
    <div className="mobile-progress">
      <span>{t("common.stepLabel")} {current} / 9</span>
      <div><i style={{ width: `${(current / 9) * 100}%` }} /></div>
    </div>
  );
}
