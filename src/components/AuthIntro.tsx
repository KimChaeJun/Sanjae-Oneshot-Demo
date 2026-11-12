import { CheckCircle2, FileCheck2, ScanText, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

export function AuthIntro() {
  const { t } = useTranslation();

  return (
    <section className="login-intro">
      <span className="eyebrow"><Sparkles size={16} /> {t("login.eyebrow")}</span>
      <h1>{t("login.title1")}<br /><em>{t("login.title2")}</em></h1>
      <p>{t("login.description")}</p>
      <ul className="benefit-list">
        <li><ScanText /><span><strong>{t("login.ocrTitle")}</strong><small>{t("login.ocrDetail")}</small></span></li>
        <li><FileCheck2 /><span><strong>{t("login.checkTitle")}</strong><small>{t("login.checkDetail")}</small></span></li>
        <li><CheckCircle2 /><span><strong>{t("login.packageTitle")}</strong><small>{t("login.packageDetail")}</small></span></li>
      </ul>
    </section>
  );
}
