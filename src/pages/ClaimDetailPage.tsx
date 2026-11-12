import { ArrowLeft, CalendarDays, Clock3, Download, FileCheck2, FileSearch, FileText, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { PageLoading } from "../components/PageLoading";
import { DocumentPreview, PreparedDownload, usePreparedFile } from "../components/PreparedFile";
import { documentTypeLabel } from "../lib/uiTranslation";
import { api } from "../lib/api";
import type { ClaimDetail, ClaimDocument, GeneratedDocument } from "../types";

interface ClaimDetailPageProps {
  claimId: string;
  onBack: () => void;
}



function valueOrDash(value: unknown): string {
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "—";
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

export function ClaimDetailPage({ claimId, onBack }: ClaimDetailPageProps) {
  const { t, i18n } = useTranslation();
  const [claim, setClaim] = useState<ClaimDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openingDocumentId, setOpeningDocumentId] = useState<string | null>(null);
  const [openingGeneratedDocumentId, setOpeningGeneratedDocumentId] = useState<string | null>(null);
  const [downloadingPackage, setDownloadingPackage] = useState(false);
  const [preview, setPreview] = usePreparedFile();
  const [preparedDownload, setPreparedDownload] = usePreparedFile();

  useEffect(() => {
    setLoading(true);
    setError("");
    void api.getClaimDetail(claimId)
      .then(setClaim)
      .catch((caught) => setError(caught instanceof Error ? caught.message : t("claimDetail.loadFailed")))
      .finally(() => setLoading(false));
  }, [claimId, t]);

  async function openDocument(document: ClaimDocument) {
    setOpeningDocumentId(document.id);
    setError("");
    try {
      setPreview(await api.openClaimDocument(claimId, document));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("claimDetail.documentOpenFailed"));
    } finally {
      setOpeningDocumentId(null);
    }
  }

  async function openGeneratedDocument(document: GeneratedDocument) {
    setOpeningGeneratedDocumentId(document.id);
    setError("");
    try {
      setPreview(await api.openGeneratedDocument(claimId, document));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("claimDetail.generatedDocumentOpenFailed"));
    } finally {
      setOpeningGeneratedDocumentId(null);
    }
  }

  async function downloadPackage() {
    setDownloadingPackage(true);
    setError("");
    try {
      setPreparedDownload(await api.downloadPackage(claimId));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("claimDetail.packageDownloadFailed"));
    } finally {
      setDownloadingPackage(false);
    }
  }

  if (loading) {
    return <main className="page-shell claim-detail-page"><PageLoading title={t("claimDetail.loading")} description={t("claimDetail.loadingDescription")} /></main>;
  }

  if (!claim || error) {
    return (
      <main className="page-shell claim-detail-page">
        <button type="button" className="back-link" onClick={onBack}><ArrowLeft size={18} /> {t("claimDetail.back")}</button>
        <section className="claim-detail-error panel"><FileSearch size={36} /><h1>{t("claimDetail.unavailable")}</h1><p>{error || t("claimDetail.loadFailed")}</p></section>
      </main>
    );
  }

  const step1 = claim.data.step1;
  const accident = claim.data.step2;
  const step8Text = claim.data.step8?.generated_text;
  const step6Text = claim.data.step6?.result?.generated_statement_ko ?? claim.data.step6?.generated_statement_ko;
  const generatedText = step8Text && !/[Ãìë]/.test(step8Text) ? step8Text : step6Text ?? step8Text;
  const dateLocale = i18n.resolvedLanguage === "ko" ? "ko-KR" : i18n.resolvedLanguage;
  const completedAt = claim.completed_at ?? claim.updated_at;

  return (
    <main className="page-shell claim-detail-page">
      <button type="button" className="back-link" onClick={onBack}><ArrowLeft size={18} /> {t("claimDetail.back")}</button>
      <header className="claim-detail-hero">
        <div>
          <span className="section-kicker">{t("claimDetail.kicker")}</span>
          <h1>{t("claimDetail.title")}</h1>
          <p>{t("claimDetail.description")}</p>
        </div>
        <strong className="detail-completion-badge">{t("mypage.completed")}</strong>
      </header>

      <section className="retention-notice" aria-label={t("claimDetail.retentionTitle")}>
        <ShieldCheck size={24} />
        <div><strong>{t("claimDetail.retentionTitle")}</strong><p>{t("extra.retention.notice")}</p></div>
      </section>

      <section className="claim-meta-grid">
        <article><CalendarDays /><span><small>{t("claimDetail.completedAt")}</small><strong>{new Date(completedAt).toLocaleDateString(dateLocale)}</strong></span></article>
        <article><Clock3 /><span><small>{t("claimDetail.viewableUntil")}</small><strong>{claim.access_expires_at ? new Date(claim.access_expires_at).toLocaleDateString(dateLocale) : "—"}</strong></span></article>
      </section>

      <section className="detail-section panel">
        <div className="detail-section-heading"><span>1</span><div><h2>{t("claimDetail.applicantTitle")}</h2><p>{t("claimDetail.applicantHelp")}</p></div></div>
        <dl className="detail-grid">
          <div><dt>{t("wizard.form.name")}</dt><dd>{valueOrDash(step1?.applicant?.name)}</dd></div>
          <div><dt>{t("wizard.form.nameEn")}</dt><dd>{valueOrDash(step1?.applicant?.name_en)}</dd></div>
          <div><dt>{t("wizard.form.phone")}</dt><dd>{valueOrDash(step1?.applicant?.phone)}</dd></div>
          <div><dt>{t("wizard.form.email")}</dt><dd>{valueOrDash(step1?.applicant?.email)}</dd></div>
          <div className="detail-wide"><dt>{t("wizard.form.address")}</dt><dd>{valueOrDash(step1?.applicant?.address)}</dd></div>
        </dl>
      </section>

      <section className="detail-section panel">
        <div className="detail-section-heading"><span>2</span><div><h2>{t("claimDetail.workplaceTitle")}</h2><p>{t("claimDetail.workplaceHelp")}</p></div></div>
        <dl className="detail-grid">
          <div><dt>{t("wizard.form.company")}</dt><dd>{valueOrDash(step1?.workplace?.company_name)}</dd></div>
          <div><dt>{t("wizard.form.businessNo")}</dt><dd>{valueOrDash(step1?.workplace?.business_registration_no)}</dd></div>
          <div><dt>{t("wizard.form.occupation")}</dt><dd>{valueOrDash(step1?.workplace?.occupation)}</dd></div>
          <div><dt>{t("wizard.form.position")}</dt><dd>{valueOrDash(step1?.workplace?.job_position)}</dd></div>
          <div className="detail-wide"><dt>{t("wizard.form.workplaceAddress")}</dt><dd>{valueOrDash(step1?.workplace?.address)}</dd></div>
        </dl>
      </section>

      <section className="detail-section panel">
        <div className="detail-section-heading"><span>3</span><div><h2>{t("claimDetail.accidentTitle")}</h2><p>{t("claimDetail.accidentHelp")}</p></div></div>
        <dl className="detail-grid">
          <div><dt>{t("wizard.accident.date")}</dt><dd>{valueOrDash(accident?.accident_date)}</dd></div>
          <div><dt>{t("wizard.accident.time")}</dt><dd>{valueOrDash(accident?.accident_time)}</dd></div>
          <div><dt>{t("wizard.accident.place")}</dt><dd>{valueOrDash(accident?.accident_place)}</dd></div>
          <div><dt>{t("wizard.accident.task")}</dt><dd>{valueOrDash(accident?.task_description)}</dd></div>
          <div className="detail-wide"><dt>{t("wizard.accident.account")}</dt><dd className="detail-long-text">{valueOrDash(accident?.raw_description)}</dd></div>
          <div className="detail-wide"><dt>{t("claimDetail.generatedStatement")}</dt><dd className="detail-long-text">{valueOrDash(generatedText)}</dd></div>
        </dl>
      </section>

      <section className="detail-section panel">
        <div className="detail-section-heading"><span>4</span><div><h2>{t("claimDetail.documentsTitle")}</h2><p>{t("claimDetail.documentsHelp")}</p></div></div>
        {claim.documents.length === 0 ? (
          <div className="detail-empty"><FileText /><p>{t("claimDetail.noDocuments")}</p></div>
        ) : (
          <ul className="detail-document-list">
            {claim.documents.map((document) => (
              <li key={document.id}>
                <FileText size={23} />
                <span><strong>{document.file_name}</strong><small>{documentTypeLabel(document.document_type)} · {t(`claimDetail.documentStatus.${document.status}`, { defaultValue: document.status })}</small></span>
                <button type="button" className="outline-button" disabled={openingDocumentId === document.id} onClick={() => void openDocument(document)}>
                  {openingDocumentId === document.id ? t("claimDetail.opening") : t("claimDetail.openDocument")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <DocumentPreview file={preview} onClose={() => setPreview(null)} />
      <section className="detail-section panel">
        <div className="detail-section-heading generated-document-heading">
          <span>5</span>
          <div><h2>{t("claimDetail.generatedDocumentsTitle")}</h2><p>{t("extra.retention.generated")}</p></div>
          {claim.generated_documents.length > 0 && (
            <button type="button" className="outline-button" disabled={downloadingPackage} onClick={() => void downloadPackage()}>
              <Download size={17} /> {downloadingPackage ? t("claimDetail.downloadingPackage") : t("claimDetail.downloadPackage")}
            </button>
          )}
        </div>
        <PreparedDownload file={preparedDownload} />
        {claim.generated_documents.length === 0 ? (
          <div className="detail-empty"><FileText /><p>{t("claimDetail.noGeneratedDocuments")}</p></div>
        ) : (
          <ul className="detail-document-list generated-document-list">
            {claim.generated_documents.map((document) => (
              <li key={document.id}>
                <FileCheck2 size={23} />
                <span><strong>{document.file_name}</strong><small>PDF · {t("claimDetail.generatedDocumentStored")}</small></span>
                <button type="button" className="outline-button" disabled={openingGeneratedDocumentId === document.id} onClick={() => void openGeneratedDocument(document)}>
                  {openingGeneratedDocumentId === document.id ? t("claimDetail.opening") : t("claimDetail.openDocument")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
