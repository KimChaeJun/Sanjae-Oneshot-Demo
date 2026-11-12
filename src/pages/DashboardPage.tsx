import { ArrowRight, CheckCircle2, Clock3, FilePlus2, Files, PlayCircle, ShieldCheck } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";

import { PageLoading } from "../components/PageLoading";
import { api } from "../lib/api";
import { profileNameForLanguage } from "../lib/profileDisplay";
import type { ClaimSummary, ProfileSummary } from "../types";

interface DashboardProps {
  fallbackUserName: string;
  onStart: () => void;
  onResume: (claimId: string) => void;
  onMyPage: () => void;
}

export function DashboardPage({ fallbackUserName, onStart, onResume, onMyPage }: DashboardProps) {
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [claims, setClaims] = useState<ClaimSummary[]>([]);
  const [resumableClaim, setResumableClaim] = useState<ClaimSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayReadiness, setDisplayReadiness] = useState(0);

  useEffect(() => {
    void Promise.allSettled([api.getProfile(), api.listClaims(), api.getResumableClaim()])
      .then(([profileResult, claimsResult, resumableResult]) => {
        if (profileResult.status === "fulfilled") setProfile(profileResult.value);
        if (claimsResult.status === "fulfilled") setClaims(claimsResult.value);
        if (resumableResult.status === "fulfilled") setResumableClaim(resumableResult.value);
      })
      .finally(() => setLoading(false));
  }, []);

  const userName = profileNameForLanguage(
    profile,
    i18n.resolvedLanguage,
    fallbackUserName,
  );
  const activeCount = claims.filter((claim) => claim.lifecycle_status === "active" && claim.claim_status !== "ready" && claim.claim_status !== "submitted").length;
  const readyCount = claims.filter((claim) => claim.claim_status === "ready" || claim.claim_status === "submitted").length;
  const latestStep = claims[0]?.current_step ?? 0;
  const readiness = readyCount > 0 ? 100 : Math.round((latestStep / 8) * 100);

  useEffect(() => {
    if (loading) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayReadiness(readiness);
      return;
    }

    let frame = 0;
    let startedAt: number | null = null;
    const duration = 420;
    setDisplayReadiness(0);

    function animate(timestamp: number) {
      if (startedAt === null) startedAt = timestamp;
      const progress = Math.min(1, (timestamp - startedAt) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setDisplayReadiness(Math.round(readiness * eased));
      if (progress < 1) frame = window.requestAnimationFrame(animate);
    }

    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [loading, readiness]);

  if (loading) {
    return <main className="dashboard-page page-shell"><PageLoading title={t("dashboard.loading")} description={t("dashboard.loadingDescription")} /></main>;
  }

  const scoreStyle = {
    "--score-progress": `${displayReadiness * 3.6}deg`,
  } as CSSProperties;

  return (
    <main className="dashboard-page page-shell">
      <section className="dashboard-hero">
        <div>
          <span className="eyebrow">{t("common.mySanjae")}</span>
          <h1>{t("dashboard.greeting", { name: userName })}<br />{t("dashboard.title")}</h1>
          <p>예시 정보가 준비되어 있어요. 버튼을 누르며 산재 신청 준비 과정을 체험해보세요.</p>
          <div className="dashboard-hero-actions">
            {resumableClaim && <button className="primary-button" onClick={() => onResume(resumableClaim.id)}><PlayCircle size={19} /> {t("dashboard.resume")}</button>}
            <button className={resumableClaim ? "outline-button" : "primary-button"} onClick={onStart}><FilePlus2 size={19} /> {t("dashboard.startNew")}</button>
          </div>
        </div>
        <div className="readiness-card">
          <span className="score-label">{t("dashboard.readiness")}</span>
          <div
            className="score-ring"
            style={scoreStyle}
            role="img"
            aria-label={`${t("dashboard.readiness")} ${displayReadiness}%`}
          >
            <span className={`score-value digits-${String(displayReadiness).length}`}>
              <strong>{displayReadiness}</strong>
            </span>
          </div>
          <p>{t("dashboard.readinessHelp")}</p>
        </div>
      </section>

      {resumableClaim && (
        <section className="resume-claim-card panel">
          <div>
            <span className="section-kicker">{t("dashboard.savedLabel")}</span>
            <h2>{t("dashboard.savedTitle")}</h2>
            <p>{t("dashboard.savedAtStep", { step: resumableClaim.current_step })} {t("dashboard.expiresAt", { date: resumableClaim.draft_expires_at ? new Date(resumableClaim.draft_expires_at).toLocaleDateString() : t("dashboard.ninetyDays") })}</p>
          </div>
          <button className="primary-button" onClick={() => onResume(resumableClaim.id)}>{t("dashboard.continueWriting")} <ArrowRight size={17} /></button>
        </section>
      )}

      <section className="stats-grid" aria-label={t("dashboard.summary")}>
        <article><span className="stat-icon blue"><Files /></span><div><small>{t("dashboard.active")}</small><strong>{activeCount}</strong></div></article>
        <article><span className="stat-icon green"><CheckCircle2 /></span><div><small>{t("dashboard.ready")}</small><strong>{readyCount}</strong></div></article>
        <article className="duration-stat"><span className="stat-icon orange"><Clock3 /></span><div><small>{t("dashboard.duration")}</small><strong>체험 약 2~3분</strong><small className="duration-wait">미리 준비된 예시 정보 사용</small></div></article>
      </section>

      <section className="dashboard-grid">
        <article className="panel getting-started">
          <div className="panel-heading"><div><span className="section-kicker">{t("common.quickStartLabel")}</span><h2>{t("dashboard.process")}</h2></div><button className="link-button" onClick={onStart}>{t("dashboard.quickStart")} <ArrowRight size={15} /></button></div>
          <ol className="quick-steps">
            <li><span>1</span><div><strong>{t("dashboard.quick1Title")}</strong><small>{t("dashboard.quick1Detail")}</small></div></li>
            <li><span>2</span><div><strong>{t("dashboard.quick2Title")}</strong><small>{t("dashboard.quick2Detail")}</small></div></li>
            <li><span>3</span><div><strong>{t("dashboard.quick3Title")}</strong><small>{t("dashboard.quick3Detail")}</small></div></li>
            <li><span>4</span><div><strong>{t("dashboard.quick4Title")}</strong><small>{t("dashboard.quick4Detail")}</small></div></li>
          </ol>
        </article>
        <article className="panel safety-panel">
          <ShieldCheck size={30} />
          <h2>준비물 없이 바로 체험</h2>
          <p>가상 인물과 예시 서류로 진행합니다. 모든 체험은 브라우저 안에서만 이루어집니다.</p>
          <button className="outline-button" onClick={onMyPage}>{t("dashboard.profile")}</button>
        </article>
      </section>
    </main>
  );
}
