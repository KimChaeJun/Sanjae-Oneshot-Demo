import { ui } from "../lib/uiTranslation";
import { Bell, ChevronRight, CircleStop, FileCheck2, FilePlus2, FileText, PlayCircle, Trash2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { PageLoading } from "../components/PageLoading";
import { api } from "../lib/api";
import { readNotificationPreference, writeNotificationPreference } from "../lib/notificationPreference";
import { profileNameForLanguage } from "../lib/profileDisplay";
import type { ClaimSummary, ProfileSummary } from "../types";

interface MyPageProps {
  onStart: () => void;
  onOpenClaim: (claimId: string) => void;
  onResume: (claimId: string) => void;
  onEditProfile: () => void;
}

function isCompleted(status: string): boolean {
  return status === "ready" || status === "submitted";
}

function isWithinAccessWindow(claim: ClaimSummary): boolean {
  const appliedAt = new Date(claim.created_at ?? claim.updated_at).getTime();
  return Date.now() <= appliedAt + 30 * 24 * 60 * 60 * 1_000;
}

export function MyPage({ onStart, onResume, onOpenClaim, onEditProfile }: MyPageProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage?.split("-")[0] ?? "ko";
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [claims, setClaims] = useState<ClaimSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [actionError, setActionError] = useState("");
  const [busyClaimId, setBusyClaimId] = useState<string | null>(null);

  useEffect(() => {
    void Promise.allSettled([api.getProfile(), api.listClaims()])
      .then(([profileResult, claimsResult]) => {
        if (profileResult.status === "fulfilled") {
          setProfile(profileResult.value);
          setNotificationsEnabled(
            readNotificationPreference(localStorage, profileResult.value.user_id),
          );
        }
        if (claimsResult.status === "fulfilled") setClaims(claimsResult.value);
      })
      .finally(() => setLoading(false));
  }, []);

  function toggleNotifications() {
    if (!profile) return;
    setNotificationsEnabled((current) => {
      const next = !current;
      writeNotificationPreference(localStorage, profile.user_id, next);
      return next;
    });
  }

  async function stopClaim(claimId: string) {
    if (!window.confirm(ui("이 신청을 중단할까요? 정보는 90일 보관 후 자동 삭제됩니다."))) return;
    setBusyClaimId(claimId);
    setActionError("");
    try {
      const updated = await api.abandonClaim(claimId);
      setClaims((current) => current.map((claim) => claim.id === claimId ? updated : claim));
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : ui("신청을 중단하지 못했습니다."));
    } finally {
      setBusyClaimId(null);
    }
  }

  async function resumeClaim(claimId: string) {
    setBusyClaimId(claimId);
    setActionError("");
    try {
      await api.resumeClaim(claimId);
      onResume(claimId);
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : ui("신청을 이어갈 수 없습니다."));
      setBusyClaimId(null);
    }
  }

  async function deleteClaim(claimId: string) {
    if (!window.confirm(ui("이 신청과 업로드 문서를 즉시 삭제할까요? 삭제 후 복구할 수 없습니다."))) return;
    setBusyClaimId(claimId);
    setActionError("");
    try {
      await api.deleteClaim(claimId);
      setClaims((current) => current.filter((claim) => claim.id !== claimId));
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : ui("신청을 삭제하지 못했습니다."));
    } finally {
      setBusyClaimId(null);
    }
  }

  if (loading) {
    return <main className="page-shell my-page"><PageLoading title={t("mypage.loading")} description={t("mypage.loadingDescription")} /></main>;
  }

  return (
    <main className="page-shell my-page">
      <div className="page-title-row">
        <div><span className="section-kicker">{t("common.myPageLabel")}</span><h1>{t("mypage.title")}</h1><p>{t("mypage.description")}</p></div>
        <button
          type="button"
          className={`notification-toggle${notificationsEnabled ? " is-enabled" : ""}`}
          aria-pressed={notificationsEnabled}
          onClick={toggleNotifications}
        >
          <Bell size={19} />
          <span>{t("mypage.notification")}</span>
          <small>{t(notificationsEnabled ? "mypage.notificationOn" : "mypage.notificationOff")}</small>
          <i aria-hidden="true"><b /></i>
        </button>
      </div>
      <section className="profile-summary panel">
        <span className="profile-avatar"><UserRound size={34} /></span>
        <div><strong>{profileNameForLanguage(profile, language, t("common.demoName"))}</strong><p>{t("common.profileMeta", { email: profile?.email || "demo@sanjae.local", language: t(`languages.${profile?.preferred_language || language}`) })}</p></div>
        <button className="outline-button" onClick={onEditProfile}>{t("mypage.edit")}</button>
      </section>
      <section className="mypage-grid">
        <article className="panel">
          <div className="panel-heading">
            <div><span className="section-kicker">{t("common.applicationsLabel")}</span><h2>{t("mypage.applications")}</h2></div>
            {claims.length > 0 && (
              <button type="button" className="outline-button" onClick={onStart}>
                <FilePlus2 size={17} /> {t("mypage.start")}
              </button>
            )}
          </div>
          {actionError && <div className="error-banner" role="alert">{actionError}</div>}
          {claims.length === 0 ? (
            <div className="empty-state"><FileText size={36} /><strong>{t("mypage.empty")}</strong><p>{t("mypage.emptyDetail")}</p><button className="primary-button" onClick={onStart}>{t("mypage.start")}</button></div>
          ) : (
            <ul className="claim-list">
              {claims.map((claim) => (
                <li className={isCompleted(claim.claim_status) ? "completed" : ""} key={claim.id}>
                  <div className="claim-summary-main">
                    {isCompleted(claim.claim_status) ? <FileCheck2 size={25} /> : <FileText size={22} />}
                    <span><strong>{claim.accident_type ? t(`analysis.types.${claim.accident_type}`) : t("analysis.types.unknown")}</strong><small>{new Date(claim.updated_at).toLocaleDateString(i18n.resolvedLanguage)} · {t("mypage.stepProgress", { step: claim.current_step })}</small></span>
                  </div>
                  <div className="claim-card-footer">
                    <strong className={isCompleted(claim.claim_status) ? "claim-completion-label" : "claim-progress-label"}>
                      {isCompleted(claim.claim_status) ? t("mypage.completed") : claim.lifecycle_status === "abandoned" ? ui("중단됨") : t("mypage.inProgress")}
                    </strong>
                    {!isCompleted(claim.claim_status) ? (
                      <div className="claim-lifecycle-actions">
                        <button type="button" className="claim-detail-button" disabled={busyClaimId === claim.id} onClick={() => void resumeClaim(claim.id)}><PlayCircle size={17} /> {claim.lifecycle_status === "abandoned" ? ui("다시 시작") : ui("이어서 작성")}</button>
                        {claim.lifecycle_status === "active" && <button type="button" className="claim-stop-button" disabled={busyClaimId === claim.id} onClick={() => void stopClaim(claim.id)}><CircleStop size={16} />  {ui("중단")}</button>}
                        <button type="button" className="claim-delete-button" disabled={busyClaimId === claim.id} onClick={() => void deleteClaim(claim.id)}><Trash2 size={16} />  {ui("삭제")}</button>
                      </div>
                    ) : (
                      <div className="claim-lifecycle-actions">
                        {isWithinAccessWindow(claim) ? (
                          <button type="button" className="claim-detail-button" onClick={() => onOpenClaim(claim.id)}>
                            {t("mypage.viewDetail")} <ChevronRight size={18} />
                          </button>
                        ) : (
                          <span className="claim-access-expired">{t("mypage.accessExpired")}</span>
                        )}
                        <button type="button" className="claim-delete-button" disabled={busyClaimId === claim.id} onClick={() => void deleteClaim(claim.id)}><Trash2 size={16} />  {ui("삭제")}</button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </main>
  );
}
