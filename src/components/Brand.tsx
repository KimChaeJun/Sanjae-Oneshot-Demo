import { useTranslation } from "react-i18next";

import sanjaeSymbol from "../assets/sanjae-symbol.svg";

export function Brand() {
  const { t } = useTranslation();
  return (
    <div className="brand" aria-label={t("common.brand")}>
      <img className="brand-symbol" src={sanjaeSymbol} alt="" aria-hidden="true" />
      <span>{t("common.brand")}</span>
    </div>
  );
}
