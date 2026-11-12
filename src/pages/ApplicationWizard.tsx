import { sampleData, sampleUploads } from "../demo/sample";
import { ui, documentTypeLabel, factAuditMessage, requirementText } from "../lib/uiTranslation";
import { PreparedDownload, usePreparedFile } from "../components/PreparedFile";
import type { BrowserFile } from "../lib/browserFile";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CircleStop,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileCheck2,
  FileText,
  FolderOpen,
  HeartPulse,
  Info,
  ListChecks,
  LoaderCircle,
  MapPin,
  Mic,
  PencilLine,
  RefreshCw,
  ScanText,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { PageLoading } from "../components/PageLoading";
import { MobileProgress, StepSidebar } from "../components/StepSidebar";
import type { SupportedLanguage } from "../i18n";
import { api, type PackageDestination } from "../lib/api";
import { createActionGate } from "../lib/actionGate";
import { demoFields, demoUploads, fillDemoReviewAnswers, type DemoBundle } from '../lib/demo';
import { getMissingStepOneFields, isAccidentReady, hasRequiredInterviewAnswers, type StepOneRequiredField } from "../lib/formReadiness";
import {
  applicationEntryStep,
  type LegalConsentPayload,
} from "../lib/termsConsent";
import { TermsConsentStep } from "./TermsConsentPage";
import type {
  AIResult,
  ApplicationData,
  DocumentTypeOption,
  OcrResult,
  PendingDocumentUpload,
  RequirementAnalysis,
} from "../types";

const initialData: ApplicationData = {
  applicant: {
    name: "",
    name_en: "",
    signature_name: "",
    birth_date: "",
    worker_type: "",
    phone: "",
    email: "",
    address: "",
    nationality: "",
    preferred_language: "ko",
    benefit_type: "medical_care",
    applicant_role: "self",
    injured_worker_name: "",
    relationship_to_worker: "",
    authority_document_type: "",
    authority_confirmed: false,
    deceased_worker_name: "",
    relationship_to_deceased: "self",
  },
  workplace: {
    company_name: "",
    business_registration_no: "",
    management_number: "",
    representative_name: "",
    phone: "",
    address: "",
    occupation: "",
    job_position: "",
  },
  accident: {
    accident_type: "work_accident",
    accident_date: "",
    accident_date_precision: "exact",
    approximate_date_text: "",
    accident_time: "",
    accident_time_precision: "unknown",
    accident_place: "",
    task_description: "",
    raw_description: "",
    language: "ko",
    injury_parts: [],
    witness_status: "no",
    witness_name: "",
    witness_phone: "",
    witness_relationship: "",
    witness_statement: "",
  },
};

const workerTypeOptions = [
  "근로자",
  "노무제공자",
  "중소기업사업주",
  "중소기업사업주 가족종사자",
  "학생연구자",
  "건강손상자녀",
  "특수형태근로종사자(’23.6.30. 이전 재해)",
  "현장실습생",
] as const;





interface WizardProps {
  demo?: DemoBundle;
  initialClaimId: string | null;
  legalConsentAccepted: boolean;
  onAcceptLegalTerms: (payload: LegalConsentPayload) => Promise<boolean> | boolean;
  onExit: () => void;
}


function getMissingInterviewAnswers(
  result: AIResult,
  answers: Record<string, string>,
): string[] {
  return result.missing_fields
    .map((item) => item.field)
    .filter((field) => !(answers[field] ?? "").trim());
}

function readHistoryStep(legalConsentAccepted: boolean): { step: number; completed: boolean } {
  if (!legalConsentAccepted) {
    return { step: applicationEntryStep(false), completed: false };
  }
  const state = window.history.state as { view?: string; applicationStep?: number } | null;
  if (state?.view !== "application" || !Number.isInteger(state.applicationStep)) {
    return { step: 1, completed: false };
  }
  const applicationStep = state.applicationStep ?? 1;
  if (applicationStep === 9) return { step: 8, completed: true };
  return { step: Math.min(8, Math.max(1, applicationStep)), completed: false };
}

export function ApplicationWizard({
  initialClaimId,
  legalConsentAccepted,
  onAcceptLegalTerms,
  onExit,
  demo,
}: WizardProps) {
  const { t, i18n } = useTranslation();
  const language = (i18n.resolvedLanguage?.split("-")[0] ?? "ko") as SupportedLanguage;
  const initialHistoryStep = readHistoryStep(legalConsentAccepted);
  const [step, setStep] = useState(initialHistoryStep.step);
  const [claimId, setClaimId] = useState<string | null>(initialClaimId);
  const [data, setData] = useState(() => structuredClone(sampleData));
  const [files, setFiles] = useState<PendingDocumentUpload[]>(sampleUploads);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeOption[]>([]);
  const [documentIds, setDocumentIds] = useState<string[]>([]);
  const [savedDocumentNames, setSavedDocumentNames] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<RequirementAnalysis | null>(null);
  const [ocr, setOcr] = useState<OcrResult | null>(null);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [reviewAnswers, setReviewAnswers] = useState<Record<string, string>>({});
  const [editedText, setEditedText] = useState("");
  const [busy, setBusy] = useState(false);
  const actionGate = useRef(createActionGate()).current;
  const [error, setError] = useState("");
  const [missingStepOneFields, setMissingStepOneFields] = useState<Set<StepOneRequiredField>>(new Set());
  const [completed, setCompleted] = useState(initialHistoryStep.completed);
  const [factsConfirmed, setFactsConfirmed] = useState(false);
  const [responsibilityConfirmed, setResponsibilityConfirmed] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(Boolean(initialClaimId));
  const [demoPaused, setDemoPaused] = useState(false);
  const [demoPreparedStep, setDemoPreparedStep] = useState(0);
  const [draftStatus, setDraftStatus] = useState('');
  const [preparedDownload, setPreparedDownload] = usePreparedFile();
  const stepReady = step === 1 ? getMissingStepOneFields(data).size === 0
    : step === 2 ? isAccidentReady(data.accident)
    : step === 3 ? (files.length > 0 || documentIds.length > 0) && files.every(upload => upload.file.size > 0 && Boolean(upload.document_type))
    : step === 4 ? Boolean(requirements)
    : step === 5 ? Boolean(ocr)
    : step === 6 ? Boolean(aiResult?.generated_statement_ko?.trim())
    : step === 7 ? Boolean(aiResult) && (aiResult?.interview_status === "ready" || hasRequiredInterviewAnswers(aiResult, reviewAnswers))
    : step === 8 ? Boolean(aiResult?.form_id && editedText.trim() && factsConfirmed && responsibilityConfirmed)
    : false;

  useEffect(() => {
    if (!initialClaimId) return;
    let active = true;
    void api.getClaimDetail(initialClaimId)
      .then(async claim => {
        if (claim.claim_status !== 'ready' && claim.claim_status !== 'submitted') await api.resumeClaim(initialClaimId);
        return claim;
      })
      .then((claim) => {
        if (!active) return;
        const snapshot = claim.data as Record<string, any>;
        const step1 = snapshot.step1 ?? {};
        const step2 = snapshot.step2 ?? {};
        setData((current) => ({
          ...current,
          applicant: { ...current.applicant, ...(step1.applicant ?? {}) },
          workplace: { ...current.workplace, ...(step1.workplace ?? {}) },
          accident: { ...current.accident, ...step2 },
        }));
        setDocumentIds(claim.documents.map((document) => document.id));
        setSavedDocumentNames(claim.documents.map(document => document.file_name));
        if (snapshot.step4) setRequirements(snapshot.step4 as RequirementAnalysis);
        if (snapshot.step5) setOcr(snapshot.step5 as OcrResult);
        if (snapshot.step6?.result) {
          const generated = {
            ...snapshot.step6.result,
            form_id: snapshot.step6.form_id,
            form_type: snapshot.step6.form_type,
            form_version: snapshot.step6.form_version,
            interview_round: snapshot.step6.interview?.round ?? 0,
            interview_status: snapshot.step6.result.missing_fields?.length
              ? "questions_pending"
              : "ready",
            answered_question_count: (snapshot.step6.interview?.history ?? [])
              .reduce((sum: number, item: { answers?: Record<string, string> }) =>
                sum + Object.keys(item.answers ?? {}).length, 0),
          } as AIResult;
          setAiResult(generated);
          const draft = snapshot.review_draft?.form_id === generated.form_id ? snapshot.review_draft : null;
          setEditedText(snapshot.step8?.generated_text ?? draft?.generated_text ?? generated.generated_statement_ko);
          if (draft?.answers) setReviewAnswers(draft.answers);
        }
        // API completion markers run ahead of the result screen the user sees.
        // Resume from durable snapshots, not an empty OCR/analysis screen.
        const restoredStep = snapshot.step8 ? 8 : snapshot.step7 ? 7
          : snapshot.step6 ? 6 : snapshot.step5 ? 5 : snapshot.step4 ? 4
          : snapshot.step2 ? 3 : snapshot.step1 ? 2 : 1;
        setStep(restoredStep);
        setCompleted(claim.claim_status === "ready" || claim.claim_status === "submitted");
        const historyState = window.history.state as Record<string, unknown> | null;
        window.history.replaceState(
          { ...historyState, view: "application", claimId: initialClaimId, applicationStep: restoredStep },
          "",
        );
      })
      .catch((caught) => {
        if (active) setError(caught instanceof Error ? caught.message : t("wizard.errors.request"));
      })
      .finally(() => {
        if (active) setResumeLoading(false);
      });
    return () => {
      active = false;
    };
  }, [initialClaimId, t]);

  useEffect(() => {
    const currentState = window.history.state as Record<string, unknown> | null;
    if (
      currentState?.view === "application"
      && currentState.applicationStep !== (legalConsentAccepted ? initialHistoryStep.step : 0)
    ) {
      window.history.replaceState(
        {
          ...currentState,
          applicationStep: legalConsentAccepted ? initialHistoryStep.step : 0,
        },
        "",
      );
    }

    function handlePopState(event: PopStateEvent) {
      const state = event.state as { view?: string; applicationStep?: number } | null;
      if (state?.view !== "application") return;
      if (!legalConsentAccepted) {
        setCompleted(false);
        setStep(0);
        return;
      }
      const nextStep = Number.isInteger(state.applicationStep) ? state.applicationStep! : 1;
      setCompleted(nextStep === 9);
      setStep(nextStep === 9 ? 8 : Math.min(8, Math.max(0, nextStep)));
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [initialHistoryStep.step, legalConsentAccepted]);

  useEffect(() => {
    setData((current) => ({
      ...current,
      applicant: { ...current.applicant, preferred_language: language },
      accident: { ...current.accident, language },
    }));
  }, [language]);

  useEffect(() => {
    let active = true;
    void api.getProfile()
      .then((profile) => {
        if (!active) return;
        setData((current) => ({
          ...current,
          applicant: {
            ...current.applicant,
            name: current.applicant.name || profile.name,
            name_en: current.applicant.name_en || profile.name_en || "",
            signature_name: current.applicant.signature_name
              || profile.signature_name
              || profile.name,
            birth_date: current.applicant.birth_date || profile.birth_date || "",
            worker_type: current.applicant.worker_type || profile.worker_type || "",
            phone: current.applicant.phone || profile.phone || "",
            email: current.applicant.email || profile.email || "",
            address: current.applicant.address || profile.address || "",
            nationality: current.applicant.nationality || profile.nationality || "",
          },
          workplace: {
            ...current.workplace,
            company_name: current.workplace.company_name
              || profile.workplace?.company_name
              || "",
            address: current.workplace.address || profile.workplace?.address || "",
            occupation: current.workplace.occupation
              || profile.workplace?.occupation
              || "",
            job_position: current.workplace.job_position
              || profile.workplace?.job_position
              || "",
          },
        }));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (step !== 3) return;
    let cancelled = false;
    api.getDocumentTypes(data.applicant.benefit_type)
      .then((options) => {
        if (!cancelled) setDocumentTypes(options);
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : t("wizard.errors.request"));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [data.applicant.benefit_type, step, t]);

  function updateApplicant(
    field: keyof ApplicationData["applicant"],
    value: string | boolean,
  ) {
    setData((current) => {
      const applicant = { ...current.applicant, [field]: value };
      if (field === "benefit_type") {
        applicant.relationship_to_deceased = value === "survivor_benefit" ? "spouse" : "self";
        if (value !== "survivor_benefit") applicant.deceased_worker_name = "";
      }
      if (field === "applicant_role" && value === "self") {
        applicant.injured_worker_name = "";
        applicant.relationship_to_worker = "";
        applicant.authority_document_type = "";
        applicant.authority_confirmed = false;
      }
      return { ...current, applicant };
    });
    const requiredField = `applicant.${field}` as StepOneRequiredField;
    setMissingStepOneFields((current) => {
      if (!current.has(requiredField)) return current;
      const nextFields = new Set(current);
      nextFields.delete(requiredField);
      return nextFields;
    });
  }

  function updateWorkplace(field: keyof ApplicationData["workplace"], value: string) {
    setData((current) => ({ ...current, workplace: { ...current.workplace, [field]: value } }));
    const requiredField = `workplace.${field}` as StepOneRequiredField;
    setMissingStepOneFields((current) => {
      if (!current.has(requiredField)) return current;
      const nextFields = new Set(current);
      nextFields.delete(requiredField);
      return nextFields;
    });
  }

  function updateAccident(field: keyof ApplicationData["accident"], value: string) {
    setData((current) => ({ ...current, accident: { ...current.accident, [field]: value } }));
  }

  function navigateStep(nextStep: number) {
    const boundedStep = Math.min(8, Math.max(0, nextStep));
    const currentState = window.history.state as Record<string, unknown> | null;
    window.history.pushState(
      { ...currentState, view: "application", applicationStep: boundedStep },
      "",
    );
    setCompleted(false);
    setStep(boundedStep);
  }

  function showCompletion() {
    const currentState = window.history.state as Record<string, unknown> | null;
    window.history.pushState(
      { ...currentState, view: "application", applicationStep: 9 },
      "",
    );
    setCompleted(true);
  }

  async function ensureClaim() {
    if (claimId) return claimId;
    const claim = await api.createClaim(language);
    setClaimId(claim.id);
    return claim.id;
  }

  async function acceptLegalTerms(payload: LegalConsentPayload) {
    if (await onAcceptLegalTerms(payload)) navigateStep(1);
  }

  async function next() {
    if (busy || !stepReady) return;
    setError("");
    if (step === 1) {
      const missingFields = getMissingStepOneFields(data);
      setMissingStepOneFields(missingFields);
      if (missingFields.size > 0) {
        setError(t("extra.required.summary", {count: missingFields.size}));
        return;
      }
    }
    if (!actionGate.tryStart()) return;
    setBusy(true);
    try {
      const id = await ensureClaim();
      if (step === 1) {
        await api.saveStep1(id, { applicant: data.applicant, workplace: data.workplace });
      } else if (step === 2) {
        await api.saveStep2(id, data.accident);
      } else if (step === 3) {
        for (const upload of files) {
          const uploaded = await api.uploadDocuments(id, [upload]);
          setDocumentIds(current => [...new Set([...current, ...uploaded.map(item => item.id)])]);
          setSavedDocumentNames(current => [...new Set([...current, upload.file.name])]);
          setFiles(current => current.filter(item => item !== upload));
        }
        setRequirements(await api.analyzeRequirements(id));
      } else if (step === 4) {
        setOcr(await api.runOcr(id, documentIds, language));
      } else if (step === 5) {
        const generated = await api.generate(id, data.accident);
        setAiResult(generated);
        setEditedText(generated.generated_statement_ko);
      } else if (step === 7) {
        if (!aiResult) throw new Error(t("wizard.errors.request"));
        if (aiResult.interview_status !== "ready") {
          const missingAnswers = getMissingInterviewAnswers(aiResult, reviewAnswers);
          if (missingAnswers.length > 0) {
            throw new Error(t("extra.interview.missing", {count: missingAnswers.length}));
          }
          const reviewed = await api.review(id, "regenerate", reviewAnswers);
          setAiResult(reviewed);
          setEditedText(reviewed.generated_statement_ko);
          setReviewAnswers({});
          return;
        }
        const accepted = await api.review(id, "accept");
        setAiResult(accepted);
      } else if (step === 8) {
        if (!aiResult?.form_id) throw new Error(t("wizard.missingForm"));
        if (!factsConfirmed || !responsibilityConfirmed) {
          throw new Error(ui("사실 확인과 최종 제출 책임 확인이 모두 필요합니다."));
        }
        await api.updateForm(
          id,
          aiResult.form_id,
          editedText,
          factsConfirmed,
          responsibilityConfirmed,
        );
        showCompletion();
        return;
      }
      navigateStep(step + 1);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("wizard.errors.request"));
    } finally {
      actionGate.finish();
      setBusy(false);
    }
  }

  // Use the actual form controls and production workflow. Each section stays
  // visible before saving; never auto-confirm final facts/responsibility.
  useEffect(() => {
    if (!resumeLoading) { window.scrollTo({top: 0, behavior: "instant"}); document.querySelector<HTMLElement>(".wizard-title")?.focus({preventScroll: true}); }
  }, [demo, step, resumeLoading]);

  useEffect(() => {
    if (!demo || resumeLoading || demoPaused || completed || step >= 7) return;
    let cancelled = false;
    const timers: number[] = [];
    const delay = (ms: number) => new Promise<void>(resolve => {
      timers.push(window.setTimeout(resolve, ms));
    });
    setDemoPreparedStep(0);
    void (async () => {
      const basic = demoFields(demo, 'basic');
      const patches: Array<[string, string, unknown]> = step === 1
        ? Object.entries(basic).flatMap(([section, fields]) => Object.entries(fields as Record<string, unknown>).map(([key, value]) => [section, key, value] as [string, string, unknown]))
        : step === 2 ? Object.entries(demoFields(demo, 'accident')).map(([key, value]) => ['accident', key, value]) : [];
      for (const [section, key, value] of patches) {
        await delay(350);
        if (cancelled) return;
        setData(current => ({...current, [section]: {...current[section as keyof ApplicationData], [key]: value}}));
        await delay(50);
        const control = Array.from(document.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('.wizard-main input, .wizard-main select, .wizard-main textarea')).find(node => node.value === String(value));
        control?.scrollIntoView({block: 'center', behavior: 'smooth'});
      }
      if (step === 3) setFiles(demoUploads(demo).filter(upload => !savedDocumentNames.includes(upload.file.name)));
      if (!cancelled) setDemoPreparedStep(step);
    })();
    return () => { cancelled = true; timers.forEach(window.clearTimeout); };
  }, [demo, step, resumeLoading, demoPaused, completed]);

  useEffect(() => {
    if (!demo || demoPaused || resumeLoading || busy || error || completed || step >= 7 || demoPreparedStep !== step || !stepReady) return;
    const timer = window.setTimeout(() => { void next(); }, 4500);
    return () => window.clearTimeout(timer);
  }, [demo, demoPaused, resumeLoading, busy, error, completed, step, demoPreparedStep, stepReady, data, files, documentIds]);

  useEffect(() => {
    if (!claimId || !aiResult?.form_id || resumeLoading || completed || busy || step < 7) return;
    let active = true;
    setDraftStatus('saving');
    const timer = window.setTimeout(() => {
      void api.saveReviewDraft(claimId, aiResult.form_id!, editedText, reviewAnswers)
        .then(() => { if (active) setDraftStatus('saved'); })
        .catch(() => { if (active) setDraftStatus('failed'); });
    }, 800);
    return () => { active = false; window.clearTimeout(timer); };
  }, [claimId, aiResult?.form_id, editedText, reviewAnswers, resumeLoading, completed, busy, step]);

  useEffect(() => {
    if (!demo || resumeLoading || busy || completed || step !== 7 || !aiResult) return;
    setReviewAnswers(current => {
      const filled = fillDemoReviewAnswers(demo, aiResult.missing_fields, current);
      return Object.keys(filled).length === Object.keys(current).length ? current : filled;
    });
  }, [demo, resumeLoading, busy, completed, step, aiResult]);

  async function regenerate() {
    if (!claimId || !aiResult) return;
    if (!actionGate.tryStart()) return;
    setBusy(true);
    setError("");
    try {
      const missingAnswers = getMissingInterviewAnswers(aiResult, reviewAnswers);
      if (missingAnswers.length > 0) {
        throw new Error(t("extra.interview.missing", {count: missingAnswers.length}));
      }
      const result = await api.review(claimId, "regenerate", reviewAnswers);
      setAiResult(result);
      setEditedText(result.generated_statement_ko);
      setReviewAnswers({});
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("wizard.errors.regenerate"));
    } finally {
      actionGate.finish();
      setBusy(false);
    }
  }

  async function download(destination: PackageDestination) {
    if (!claimId) return;
    if (!actionGate.tryStart()) return;
    setBusy(true);
    setError("");
    try {
      setPreparedDownload(await api.downloadPackage(claimId, destination));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("wizard.errors.download"));
    } finally {
      actionGate.finish();
      setBusy(false);
    }
  }

  async function stopApplication() {
    if (!window.confirm(ui("현재 신청을 중단할까요? 이 체험의 진행 상태만 바뀝니다."))) return;
    if (!claimId) {
      onExit();
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.abandonClaim(claimId);
      onExit();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("wizard.errors.request"));
    } finally {
      setBusy(false);
    }
  }

  if (resumeLoading) {
    return <main className="application-layout"><section className="wizard-main"><PageLoading title={ui("신청 정보를 불러오는 중입니다")} description={ui("마지막 저장 단계부터 안전하게 이어갑니다.")} /></section></main>;
  }

  if (completed) {
    return <Completion benefitType={data.applicant.benefit_type} language={language} onDownload={download} onExit={onExit} busy={busy} error={error} preparedDownload={preparedDownload} />;
  }

  const title = t(`wizard.steps.${step}.title`);
  const description = t(`wizard.steps.${step}.description`);
  const displayStep = step + 1;
  return (
    <main className={`application-layout${demo ? ' demo-application' : ''}`}>
      <StepSidebar current={displayStep} />
      <section className="wizard-main">
        <MobileProgress current={displayStep} />
        {demo && <aside className="demo-controls"><p aria-live="polite">{step >= 7 ? t('demo.review') : error ? t('demo.errorPaused') : demoPaused ? t('demo.paused') : t('demo.auto')}</p>{step < 7 && <button type="button" className="outline-button" onClick={() => {setError('');setDemoPaused(value => !value);}} disabled={busy}>{demoPaused ? t('demo.resume') : t('demo.pause')}</button>}</aside>}
        <div className="wizard-top-actions">
          <button className="back-link" onClick={step <= 1 ? onExit : () => navigateStep(step - 1)}><ArrowLeft size={16} /> {step <= 1 ? t("wizard.dashboard") : t("wizard.previous")}</button>
          <button type="button" className="stop-application-button" onClick={() => void stopApplication()} disabled={busy}><CircleStop size={17} /> {ui("신청 중단")}</button>
        </div>
        <header className="wizard-title" tabIndex={-1}><span className="section-kicker">{t("common.stepLabel")} {displayStep}</span><h1>{title}</h1><p>{description}</p></header>
        {error && <div className="error-banner" role="alert"><AlertCircle size={18} /> {error}</div>}
        {step >= 7 && draftStatus && <p className="draft-save-status" role="status">{t(`demo.draft.${draftStatus}`)}</p>}

        {step === 0 && <TermsConsentStep onAccept={acceptLegalTerms} />}
        {step === 1 && <StepOne data={data} updateApplicant={updateApplicant} updateWorkplace={updateWorkplace} missingFields={missingStepOneFields} language={language} />}
        {step === 2 && <StepTwo data={data} update={updateAccident} />}
        {step === 3 && <StepThree files={files} onFiles={setFiles} documentTypes={documentTypes} benefitType={data.applicant.benefit_type} language={language} />}
        {step === 3 && savedDocumentNames.length > 0 && <ul className="demo-stored-files">{savedDocumentNames.map(name => <li key={name}><Check size={16} /> {name}</li>)}</ul>}
        {step === 4 && <StepFour result={requirements} accidentType={data.accident.accident_type} />}
        {step === 5 && <StepFive result={ocr} />}
        {step === 6 && <StepSix result={aiResult} />}
        {step === 7 && (
          <StepSeven
            result={aiResult}
            answers={reviewAnswers}
            onAnswer={(field, value) =>
              setReviewAnswers((current) => ({ ...current, [field]: value }))
            }
            onRegenerate={regenerate}
            onEdit={() => navigateStep(8)}
            busy={busy}
          />
        )}
        {step === 8 && (
          <StepEight
            value={editedText}
            onChange={setEditedText}
            result={aiResult}
            factsConfirmed={factsConfirmed}
            responsibilityConfirmed={responsibilityConfirmed}
            onFactsConfirmed={setFactsConfirmed}
            onResponsibilityConfirmed={setResponsibilityConfirmed}
          />
        )}

        {step > 0 && <footer className="wizard-actions">
          <p aria-live="polite"><Info size={15} /> {stepReady ? t("wizard.savedHint") : ui("필수 입력값과 단계별 결과를 준비하면 진행할 수 있습니다.")}</p>
          <button
            className="primary-button"
            onClick={next}
            disabled={busy || !stepReady}
          >
            {busy ? <LoaderCircle className="spin" size={18} /> : step === 8 ? <Check size={18} /> : null}
            {step === 8
              ? t("wizard.confirm")
              : step === 7 && aiResult?.interview_status !== "ready"
                ? t("extra.interview.apply")
                : t("wizard.next")}
            {!busy && step < 8 && <ArrowRight size={18} />}
          </button>
        </footer>}
      </section>
    </main>
  );
}

function Field({ label, required, children, wide, error }: { label: string; required?: boolean; children: ReactNode; wide?: boolean; error?: string }) {
  return <label className={`form-field ${wide ? "wide" : ""} ${error ? "invalid" : ""}`}><span>{label}{required && <em>*</em>}</span>{children}{error && <small className="field-error">{error}</small>}</label>;
}

function StepOne({ data, updateApplicant, updateWorkplace, missingFields, language }: {
  data: ApplicationData;
  updateApplicant: (
    field: keyof ApplicationData["applicant"],
    value: string | boolean,
  ) => void;
  updateWorkplace: (field: keyof ApplicationData["workplace"], value: string) => void;
  missingFields: ReadonlySet<StepOneRequiredField>;
  language: SupportedLanguage;
}) {
  const { t } = useTranslation();
  const requiredError = (field: StepOneRequiredField) => missingFields.has(field) ? t("extra.required.field") : undefined;

  return (
    <div className="step-stack">
      <section className="form-card">
        <div className="form-card-heading"><span><FileText size={20} /></span><div><h2>{t("wizard.form.applicantTitle")}</h2><p>{t("wizard.form.applicantHelp")}</p></div></div>
        <div className="form-grid">
          <Field label={t("extra.benefit.benefit")} required wide>
            <select value={data.applicant.benefit_type} onChange={(event) => updateApplicant("benefit_type", event.target.value)}>
              <option value="medical_care">{t("extra.benefit.medical")}</option>
              <option value="survivor_benefit">{t("extra.benefit.survivor")}</option>
            </select>
          </Field>
          <Field label={ui("신청인 역할")} required wide>
            <select
              value={data.applicant.applicant_role}
              onChange={(event) => updateApplicant("applicant_role", event.target.value)}
            >
              <option value="self">{ui("본인")}</option>
              <option value="guardian">{ui("보호자")}</option>
              <option value="welfare_worker">{ui("복지 담당자")}</option>
              <option value="authorized_representative">{ui("위임받은 대리인")}</option>
            </select>
          </Field>
          <Field label={t("wizard.form.name")} required error={requiredError("applicant.name")}><input required aria-invalid={missingFields.has("applicant.name")} value={data.applicant.name} onChange={(e) => updateApplicant("name", e.target.value)} placeholder={t("wizard.form.namePlaceholder")} /></Field>
          <Field label={t("wizard.form.nameEn")}><input value={data.applicant.name_en} onChange={(e) => updateApplicant("name_en", e.target.value)} placeholder="HONG GILDONG" /></Field>
          <Field label={t("wizard.form.phone")} required error={requiredError("applicant.phone")}><input required aria-invalid={missingFields.has("applicant.phone")} value={data.applicant.phone} onChange={(e) => updateApplicant("phone", e.target.value)} placeholder="010-0000-0000" /></Field>
          <Field label={t("wizard.form.email")}><input type="email" value={data.applicant.email} onChange={(e) => updateApplicant("email", e.target.value)} placeholder="name@example.com" /></Field>
          <Field label={t("wizard.form.address")} required wide error={requiredError("applicant.address")}><input required aria-invalid={missingFields.has("applicant.address")} value={data.applicant.address} onChange={(e) => updateApplicant("address", e.target.value)} placeholder={t("wizard.form.addressPlaceholder")} /></Field>
          {data.applicant.benefit_type === "survivor_benefit" && (
            <>
              <Field label={t("extra.benefit.deceased")} required error={requiredError("applicant.deceased_worker_name")}>
                <input required aria-invalid={missingFields.has("applicant.deceased_worker_name")} value={data.applicant.deceased_worker_name} onChange={(event) => updateApplicant("deceased_worker_name", event.target.value)} />
              </Field>
              <Field label={t("extra.benefit.relationship")} required>
                <select value={data.applicant.relationship_to_deceased} onChange={(event) => updateApplicant("relationship_to_deceased", event.target.value)}>
                  <option value="spouse">{t("extra.benefit.spouse")}</option>
                </select>
              </Field>
            </>
          )}
          {data.applicant.applicant_role !== "self" && (
            <>
              <Field
                label={ui("재해 근로자 성명")}
                required
                error={requiredError("applicant.injured_worker_name")}
              >
                <input
                  value={data.applicant.injured_worker_name}
                  onChange={(event) => updateApplicant("injured_worker_name", event.target.value)}
                />
              </Field>
              <Field
                label={ui("근로자와의 관계")}
                required
                error={requiredError("applicant.relationship_to_worker")}
              >
                <input
                  value={data.applicant.relationship_to_worker}
                  onChange={(event) => updateApplicant("relationship_to_worker", event.target.value)}
                  placeholder={ui("예: 배우자, 자녀, 사례관리자")}
                />
              </Field>
              <Field
                label={ui("권한 확인 문서")}
                required
                error={requiredError("applicant.authority_document_type")}
              >
                <select
                  value={data.applicant.authority_document_type}
                  onChange={(event) => updateApplicant("authority_document_type", event.target.value)}
                >
                  <option value="">{ui("선택")}</option>
                  <option value="power_of_attorney">{ui("위임장")}</option>
                  <option value="guardianship_document">{ui("후견 관계 서류")}</option>
                  <option value="welfare_agency_authorization">{ui("복지기관 권한 확인서")}</option>
                </select>
              </Field>
              <Field
                label={ui("권한·동의 확인")}
                required
                wide
                error={requiredError("applicant.authority_confirmed")}
              >
                <label className="consent-check">
                  <input
                    type="checkbox"
                    checked={data.applicant.authority_confirmed}
                    onChange={(event) => updateApplicant("authority_confirmed", event.target.checked)}
                  />
                  {ui("근로자의 동의 또는 적법한 대리 권한을 확인했습니다.")}</label>
              </Field>
            </>
          )}
        </div>
      </section>
      <section className="form-card">
        <div className="form-card-heading"><span><BriefcaseBusiness size={20} /></span><div><h2>{t("wizard.form.workplaceTitle")}</h2><p>{t("wizard.form.workplaceHelp")}</p></div></div>
        <div className="form-grid">
          <Field label={t("wizard.form.company")} required error={requiredError("workplace.company_name")}><input required aria-invalid={missingFields.has("workplace.company_name")} value={data.workplace.company_name} onChange={(e) => updateWorkplace("company_name", e.target.value)} placeholder={t("wizard.form.companyPlaceholder")} /></Field>
          <Field label={t("wizard.form.businessNo")}><input value={data.workplace.business_registration_no} onChange={(e) => updateWorkplace("business_registration_no", e.target.value)} placeholder="000-00-00000" /></Field>
          <Field label={ui("사업장 관리번호")}><input value={data.workplace.management_number ?? ""} maxLength={30} onChange={(e) => updateWorkplace("management_number", e.target.value)} placeholder="000-00-00000-0" /></Field>
          <Field label={ui("사업주명")}><input value={data.workplace.representative_name ?? ""} onChange={(e) => updateWorkplace("representative_name", e.target.value)} /></Field>
          <Field label={ui("사업장 연락처")}><input type="tel" value={data.workplace.phone ?? ""} onChange={(e) => updateWorkplace("phone", e.target.value)} /></Field>
          <Field label={ui("근로자 유형")} required error={requiredError("applicant.worker_type")}>
            <select
              required
              aria-invalid={missingFields.has("applicant.worker_type")}
              value={data.applicant.worker_type}
              onChange={(event) => updateApplicant("worker_type", event.target.value)}
            >
              <option value="">{ui("선택")}</option>
              {workerTypeOptions.map((workerType) => (
                <option key={workerType} value={workerType}>{ui(workerType)}</option>
              ))}
            </select>
          </Field>
          <Field label={t("wizard.form.workplaceAddress")} required wide error={requiredError("workplace.address")}><input required aria-invalid={missingFields.has("workplace.address")} value={data.workplace.address} onChange={(e) => updateWorkplace("address", e.target.value)} placeholder={t("wizard.form.workplaceAddressPlaceholder")} /></Field>
          <Field label={t("wizard.form.occupation")}><input value={data.workplace.occupation} onChange={(e) => updateWorkplace("occupation", e.target.value)} placeholder={t("wizard.form.occupationPlaceholder")} /></Field>
          <Field label={t("wizard.form.position")}><input value={data.workplace.job_position} onChange={(e) => updateWorkplace("job_position", e.target.value)} placeholder={t("wizard.form.positionPlaceholder")} /></Field>
        </div>
      </section>
    </div>
  );
}

function StepTwo({ data, update }: { data: ApplicationData; update: (field: keyof ApplicationData["accident"], value: string) => void }) {
  const { t } = useTranslation();
  const types = [
    ["work_accident", BriefcaseBusiness, t("wizard.accident.workTitle"), t("wizard.accident.workDetail")],
    ["occupational_disease", HeartPulse, t("wizard.accident.diseaseTitle"), t("wizard.accident.diseaseDetail")],
    ["commute", MapPin, t("wizard.accident.commuteTitle"), t("wizard.accident.commuteDetail")],
  ] as const;
  return (
    <div className="step-stack">
      <section className="form-card">
        <div className="section-field-title"><h2>{t("wizard.accident.question")}</h2><p>{t("wizard.accident.help")}</p></div>
        <div className="choice-grid">
          {types.map(([value, Icon, title, detail]) => (
            <button key={value} className={data.accident.accident_type === value ? "selected" : ""} onClick={() => update("accident_type", value)}>
              <Icon /><strong>{title}</strong><small>{detail}</small>{data.accident.accident_type === value && <i><Check size={14} /></i>}
            </button>
          ))}
        </div>
      </section>
      <section className="form-card">
        <div className="form-grid">
          <Field label={ui("사고일 정확도")} required>
            <select value={data.accident.accident_date_precision} onChange={(event) => update("accident_date_precision", event.target.value)}>
              <option value="exact">{ui("정확히 알고 있음")}</option>
              <option value="approximate">{ui("대략 알고 있음")}</option>
              <option value="unknown">{ui("모름")}</option>
            </select>
          </Field>
          {data.accident.accident_date_precision !== "unknown" && (
            <Field label={t("wizard.accident.date")} required={data.accident.accident_date_precision === "exact"}>
              <input type="date" value={data.accident.accident_date} onChange={(e) => update("accident_date", e.target.value)} />
            </Field>
          )}
          {data.accident.accident_date_precision === "approximate" && (
            <Field label={ui("대략적인 사고일 설명")} wide>
              <input
                value={data.accident.approximate_date_text}
                onChange={(event) => update("approximate_date_text", event.target.value)}
                placeholder={ui("예: 2026년 7월 둘째 주 야간근무 중")}
              />
            </Field>
          )}
          <Field label={ui("사고시간 정확도")}>
            <select value={data.accident.accident_time_precision} onChange={(event) => update("accident_time_precision", event.target.value)}>
              <option value="unknown">{ui("모름")}</option>
              <option value="approximate">{ui("대략 알고 있음")}</option>
              <option value="exact">{ui("정확히 알고 있음")}</option>
            </select>
          </Field>
          {data.accident.accident_time_precision !== "unknown" && (
            <Field label={t("wizard.accident.time")}>
              <input type="time" value={data.accident.accident_time} onChange={(e) => update("accident_time", e.target.value)} />
            </Field>
          )}
          <Field label={t("wizard.accident.place")} required wide><input value={data.accident.accident_place} onChange={(e) => update("accident_place", e.target.value)} placeholder={t("wizard.accident.placePlaceholder")} /></Field>
          <Field label={t("wizard.accident.task")} required wide><input value={data.accident.task_description} onChange={(e) => update("task_description", e.target.value)} placeholder={t("wizard.accident.taskPlaceholder")} /></Field>
          <Field label={t("wizard.accident.account")} required wide>
            <div className="textarea-wrap"><textarea rows={7} value={data.accident.raw_description} onChange={(e) => update("raw_description", e.target.value)} placeholder={t("wizard.accident.accountPlaceholder")} /><button type="button" onClick={() => update("raw_description", sampleData.accident.raw_description)}><Mic size={17} /> 예시 내용 입력</button></div>
          </Field>
          <Field label={ui("목격자 유무")} required>
            <select value={data.accident.witness_status} onChange={(event) => update("witness_status", event.target.value)}>
              <option value="no">{ui("목격자 없음")}</option>
              <option value="yes">{ui("목격자 있음")}</option>
            </select>
          </Field>
          {data.accident.witness_status === "yes" && (
            <>
              <Field label={ui("목격자 성명")} required>
                <input required value={data.accident.witness_name} onChange={(event) => update("witness_name", event.target.value)} />
              </Field>
              <Field label={ui("목격자 연락처")}>
                <input inputMode="tel" value={data.accident.witness_phone} onChange={(event) => update("witness_phone", event.target.value)} />
              </Field>
              <Field label={ui("신청인과의 관계")} required>
                <input required value={data.accident.witness_relationship} onChange={(event) => update("witness_relationship", event.target.value)} placeholder={ui("예: 같은 작업조 동료")} />
              </Field>
              <Field label={ui("목격 내용")} required wide>
                <textarea required rows={4} value={data.accident.witness_statement} onChange={(event) => update("witness_statement", event.target.value)} placeholder={ui("목격자가 직접 본 사실을 작성해주세요.")} />
              </Field>
            </>
          )}
        </div>
        <div className="language-notice"><Sparkles size={18} /><div><strong>{t("wizard.accident.foreignTitle")}</strong><p>{t("wizard.accident.foreignHelp")}</p></div></div>
      </section>
    </div>
  );
}

function StepThree({
  files,
  onFiles,
  documentTypes,
  benefitType,
  language,
}: {
  files: PendingDocumentUpload[];
  onFiles: (files: PendingDocumentUpload[]) => void;
  documentTypes: DocumentTypeOption[];
  benefitType: ApplicationData["applicant"]["benefit_type"];
  language: SupportedLanguage;
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  function selectFiles(event: ChangeEvent<HTMLInputElement>) {
    const preferredCode = benefitType === "survivor_benefit"
      ? "family_relationship_certificate"
      : "diagnosis";
    const defaultType = documentTypes.find((item) => item.code === preferredCode)?.code
      ?? documentTypes.find((item) => item.required_by_default)?.code
      ?? preferredCode;
    const selected = Array.from(event.target.files ?? []).map((file) => ({
      file,
      document_type: defaultType,
      issue_date: "",
      source_kind: "user_upload" as const,
    }));
    onFiles([...files, ...selected]);
    event.target.value = "";
  }

  function updateType(index: number, documentType: string) {
    onFiles(files.map((upload, currentIndex) => (
      currentIndex === index ? { ...upload, document_type: documentType } : upload
    )));
  }

  function updateDocument(
    index: number,
    update: Partial<Pick<PendingDocumentUpload, "issue_date" | "source_kind">>,
  ) {
    onFiles(files.map((upload, currentIndex) => (
      currentIndex === index ? { ...upload, ...update } : upload
    )));
  }

  return (
    <div className="step-stack">
      <label className="upload-zone">
        <input ref={inputRef} type="file" disabled hidden aria-hidden="true" />
        <span><UploadCloud size={34} /></span><h2>예시 서류로 업로드 화면을 체험하세요</h2><p>합성 진단서 · 재직 확인서 · 목격자 확인서가 준비되어 있어요.</p><button type="button" className="outline-button" onClick={(event) => { event.preventDefault(); onFiles(sampleUploads()); }}>예시 서류 불러오기</button>
      </label>
      {files.length > 0 && <section className="form-card"><div className="form-card-heading"><span><FileCheck2 size={20} /></span><div><h2>{t("wizard.details.selectedFiles")}</h2><p>{t("wizard.details.uploadReady", { count: files.length })}</p></div></div><ul className="file-list">{files.map((upload, index) => <li key={`${upload.file.name}-${upload.file.size}-${index}`}><FileText /><div className="file-meta"><strong title={upload.file.name}>{upload.file.name}</strong><small>{(upload.file.size / 1024 / 1024).toFixed(2)} MB</small></div><div className="file-document-fields"><label className="file-type-field"><span>{ui("문서 유형")}</span><select value={upload.document_type} onChange={(event) => updateType(index, event.target.value)}>{documentTypes.map((item) => <option key={item.code} value={item.code}>{documentTypeLabel(item.code, language === "ko" ? item.name_ko : item.name_en)}</option>)}</select></label><label className="file-type-field"><span>{ui("문서 발행일")}</span><input type="date" value={upload.issue_date} onChange={(event) => updateDocument(index, { issue_date: event.target.value })} /></label><label className="file-type-field"><span>{ui("문서 출처")}</span><select value={upload.source_kind} onChange={(event) => updateDocument(index, { source_kind: event.target.value as PendingDocumentUpload["source_kind"] })}><option value="user_upload">{ui("사용자 보유 원본")}</option><option value="issuer_direct">{ui("발행기관 직접 수령")}</option><option value="demo_fixture">{ui("합성 테스트 문서")}</option></select></label></div><CheckCircle2 /></li>)}</ul></section>}
      <div className="info-card"><Info size={20} /><div><strong>{t("wizard.details.documentsOptional")}</strong><p>{t("wizard.details.documentsOptionalHelp")}</p></div></div>
    </div>
  );
}

function StepFour({ result, accidentType }: { result: RequirementAnalysis | null; accidentType: string }) {
  const { t } = useTranslation();
  if (!result) return <LoadingCard text={t("wizard.details.analysisLoading")} />;
  const typeKey = ["work_accident", "occupational_disease", "commute"].includes(accidentType)
    ? accidentType
    : "unknown";
  const benefits = result.expected_benefits.map(requirementText);
  const evidence = result.additional_evidence.map(requirementText);
  const generatedLabel = ui("서비스 생성");
  const storedLabel = ui("외부 원본 저장");
  return (
    <div className="step-stack">
      <section className="analysis-hero"><span><ClipboardCheck size={26} /></span><div><small>{t("wizard.details.recommendedType")}</small><h2>{t(`analysis.types.${typeKey}`)}</h2><p>{t("wizard.details.analysisNotice")}</p></div></section>
      <section className="form-card"><div className="form-card-heading"><span><FileCheck2 size={20} /></span><div><h2>{t("wizard.details.requiredDocuments")}</h2><p>{t("wizard.details.requiredDocumentsHelp")}</p></div></div><ul className="requirement-list">{result.required_documents.map((item) => <li key={item.code}><span className={item.handling_mode === "generate" ? "generated-badge" : "stored-badge"}>{item.handling_mode === "generate" ? generatedLabel : `${item.required ? ui("필수 · ") : ""}${storedLabel}`}</span><div><strong>{documentTypeLabel(item.code, item.name)}</strong><small>{requirementText(item.reason)}</small></div><CheckCircle2 /></li>)}</ul></section>
      <section className="two-column-cards"><article className="soft-card"><h3>{t("wizard.details.expectedBenefits")}</h3>{benefits.map((item) => <p key={item}><Check size={15} /> {item}</p>)}</article><article className="soft-card"><h3>{t("wizard.details.evidenceExamples")}</h3>{evidence.map((item) => <p key={item}><Check size={15} /> {item}</p>)}</article></section>
      <p className="disclaimer"><Info size={15} /> {t("analysis.disclaimer")}</p>
    </div>
  );
}

function StepFive({ result }: { result: OcrResult | null }) {
  const { t } = useTranslation();
  if (!result) return <LoadingCard text={t("wizard.details.ocrLoading")} />;
  const verification = result.identity_verification;
  const verificationPassed = ["verified", "not_required", "admin_verified"].includes(verification.status);
  const fieldValidation = result.field_validation;
  const fieldValidationPassed = ["passed", "not_applicable"].includes(fieldValidation.status);
  return (
    <div className="step-stack">
      <section className="status-card success"><span><ScanText size={25} /></span><div><small>{t("wizard.details.ocrStatus")}</small><h2>{result.status === "completed" ? t("wizard.details.ocrCompleted") : t("wizard.details.ocrStarted")}</h2><p>{t("wizard.details.ocrHelp")}</p></div><CheckCircle2 /></section>
      <section className={`identity-verification-card ${verificationPassed ? "verified" : "blocked"}`}>
        <span>{verificationPassed ? <ShieldCheck size={25} /> : <AlertCircle size={25} />}</span>
        <div>
          <small>{ui("제출 문서 본인 확인")}</small>
          <h2>{verificationPassed ? ui("확인 완료") : ui("확인 필요")}</h2>
          <p>{ui(verification.message)}</p>
          {verification.benefit_type === "survivor_benefit" && (
            <strong>{ui("배우자 관계와 신청인·사망 근로자 성명을 함께 확인합니다.")}</strong>
          )}
        </div>
      </section>
      {verification.checks.length > 0 && (
        <details className="form-card compact-details" open={!verificationPassed}>
          <summary className="panel-heading"><strong>{ui("문서별 확인 결과")}</strong></summary>
          <div className="compact-details-body">
          <ul className="identity-check-list">
            {verification.checks.map((check) => (
              <li key={check.document_name} className={check.status}>
                {check.status === "verified" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <span><strong>{check.document_name}</strong><small>{ui(check.reason)}</small></span>
              </li>
            ))}
          </ul>
          </div>
        </details>
      )}
      <section className={`identity-verification-card ${fieldValidationPassed ? "verified" : "blocked"}`}>
        <span>{fieldValidationPassed ? <ListChecks size={25} /> : <AlertCircle size={25} />}</span>
        <div>
          <small>{ui("OCR 필드 검증")}</small>
          <h2>
            {fieldValidation.status === "not_applicable"
              ? ui("검증 대상 없음")
              : ui("{{matched}}/{{total}}개 필드 일치", {matched: fieldValidation.matched_fields, total: fieldValidation.total_fields})}
          </h2>
          <p>
            {fieldValidationPassed
              ? ui("신청 정보와 OCR 결과의 핵심 필드를 대조했습니다.")
              : ui("누락된 필드는 원본 문서와 직접 대조한 뒤 진행해주세요.")}
          </p>
          <strong>{ui("모델: {{model}}", {model: fieldValidation.model_name})}</strong>
        </div>
      </section>
      {fieldValidation.checks.length > 0 && (
        <details className="form-card compact-details" open={!fieldValidationPassed}>
          <summary className="panel-heading"><strong>{ui("필드별 일치 결과")}</strong><span className="confidence">{Math.round(fieldValidation.score * 100)}%</span></summary>
          <div className="compact-details-body">
          <ul className="identity-check-list">
            {fieldValidation.checks.map((check) => (
              <li key={check.field_name} className={check.status === "matched" ? "verified" : "manual_review_required"}>
                {check.status === "matched" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <span>
                  <strong>{ui(check.label)}</strong>
                  <small>{check.expected_value} · {check.status === "matched" ? ui("{{document}}에서 확인", {document: check.matched_document ?? ui("문서")}) : ui("OCR 결과에서 찾지 못함")}</small>
                </span>
              </li>
            ))}
          </ul>
          </div>
        </details>
      )}
      <details className="form-card compact-details" open={!verificationPassed || !fieldValidationPassed}><summary className="panel-heading"><strong>{t("wizard.details.extractedData")}</strong><span className="confidence">{t("wizard.details.confidence", { score: result.fields.length ? Math.round(result.fields.reduce((sum, field) => sum + field.confidence, 0) / result.fields.length * 100) : 0 })}</span></summary><div className="ocr-grid compact-details-body">{result.fields.length ? result.fields.map((field) => <label key={field.name}><span>{ui(field.name)}<small>{Math.round(field.confidence * 100)}%</small></span><input defaultValue={field.value} /></label>) : <p>{t("wizard.details.ocrPending")}</p>}</div></details>
      {result.warnings.map((warning) => <div className="warning-card" key={warning}><AlertCircle size={18} /><p>{warning}</p></div>)}
    </div>
  );
}

function StepSix({ result }: { result: AIResult | null }) {
  const { t } = useTranslation();
  if (!result) return <LoadingCard text={t("wizard.details.aiLoading")} />;
  return (
    <div className="step-stack">
      <section className="ai-score-card"><div><span><Sparkles size={23} /></span><div><small>{t("wizard.details.quality")}</small><h2>{result.document_quality.overall}</h2></div></div><div className="score-bar"><i style={{ width: `${result.document_quality.overall}%` }} /></div><p>{t("wizard.details.aiNotice")}</p></section>
      <FactAuditCard result={result} />
      <section className="generated-document"><div className="document-toolbar"><span><FileText size={18} /> {t("wizard.details.draft")}</span><button className="outline-small" onClick={() => window.dispatchEvent(new Event("demo-package-preview"))}><Download size={15} /> {t("wizard.details.preview")}</button></div><div className="document-paper"><span className="paper-label">{t("wizard.details.accidentAccount")}</span><p>{result.generated_statement_ko}</p><div className="signature-line"><span>{t("wizard.details.writtenDate")}</span><i /><span>{t("wizard.details.applicantConfirm")}</span><i /></div></div></section>
      {result.warnings.map((warning) => <div className="warning-card" key={warning}><AlertCircle size={18} /><p>{warning}</p></div>)}
    </div>
  );
}

function StepSeven({
  result,
  answers,
  onAnswer,
  onRegenerate,
  onEdit,
  busy,
}: {
  result: AIResult | null;
  answers: Record<string, string>;
  onAnswer: (field: string, value: string) => void;
  onRegenerate: () => void;
  onEdit: () => void;
  busy: boolean;
}) {
  const { t } = useTranslation();
  if (!result) return <LoadingCard text={t("wizard.details.reviewLoading")} />;
  return (
    <div className="step-stack">
      <section className={`review-summary ${result.regeneration_recommended ? "needs-review" : "ready"}`}><span>{result.regeneration_recommended ? <AlertCircle size={27} /> : <CheckCircle2 size={27} />}</span><div><small>{t("wizard.details.reviewResult")}</small><h2>{result.regeneration_recommended ? t("wizard.details.reviewNeeded") : t("wizard.details.reviewReady")}</h2><p>{t("wizard.details.reviewScore", { score: result.document_quality.overall })}</p></div></section>
      <div className="interview-round-card">
        <Sparkles size={20} />
        <div><strong>{ui("AI 인터뷰 {{round}}차 확인", {round: result.interview_round + 1})}</strong><p>{ui("지금까지 답변 {{count}}개를 반영했습니다.", {count: result.answered_question_count})}</p></div>
        <span className={`interview-status ${result.interview_status}`}>{result.interview_status === "ready" ? ui("검증 완료") : result.interview_status === "questions_pending" ? ui("추가 답변 필요") : ui("사실 확인 필요")}</span>
      </div>
      {result.missing_fields.length > 0 ? <section className="form-card"><div className="form-card-heading"><span><AlertCircle size={20} /></span><div><h2>{t("wizard.details.moreInfo")}</h2><p>{t("wizard.details.moreInfoHelp")}</p></div></div><div className="question-list">{result.missing_fields.map((item) => <label key={item.field}><span><strong>{ui(item.label)}</strong><small>{item.question_user_language || item.question_ko}</small></span><textarea rows={3} value={answers[item.field] ?? ""} onChange={(event) => onAnswer(item.field, event.target.value)} placeholder={item.question_user_language || item.question_ko} /></label>)}</div></section> : <div className="status-card success"><CheckCircle2 /><div><h2>{t("wizard.details.factsConfirmed")}</h2><p>{t("wizard.details.factsConfirmedHelp")}</p></div></div>}
      <FactAuditCard result={result} />
      <section className="review-actions"><button className="outline-button" onClick={onRegenerate} disabled={busy || !hasRequiredInterviewAnswers(result, answers)}><RefreshCw size={17} /> {t("wizard.details.regenerate")}</button><button className="outline-button" onClick={onEdit} disabled={busy || result.interview_status !== "ready" || result.missing_fields.length > 0}><PencilLine size={17} /> {t("wizard.details.editDirectly")}</button></section>
    </div>
  );
}

function FactAuditCard({ result }: { result: AIResult }) {
  useTranslation();
  return (
    <details className={`fact-audit-card compact-details ${result.fact_audit.status}`} open={result.fact_audit.status === 'blocked'}>
      <summary className="fact-audit-heading">
        {result.fact_audit.status === "blocked" ? <AlertCircle size={22} /> : <ShieldCheck size={22} />}
        <strong>{ui("입력 사실 일치 검증")}</strong>
        <span>{result.fact_audit.status === 'blocked' ? ui("확인 필요") : ui("통과")}</span>
      </summary>
      <div className="compact-details-body">
      <p>{factAuditMessage(result.fact_audit.message)}</p>
      <ul className="fact-check-list">
        {result.fact_audit.field_checks.map((check) => (
          <li key={check.field} className={check.status}>
            {check.status === "matched" ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
            <span><strong>{ui(check.label)}</strong><small>{ui(check.message)}</small></span>
          </li>
        ))}
      </ul>
      {result.fact_audit.unsupported_facts.length > 0 && (
        <p className="unsupported-facts">{ui("입력 근거가 없는 표현: {{facts}}", {facts: result.fact_audit.unsupported_facts.join(", ")})}</p>
      )}
      <WitnessUsageCard result={result} />
      </div>
    </details>
  );
}

function WitnessUsageCard({ result }: { result: AIResult }) {
  const { t } = useTranslation();
  return (
    <div className="info-card">
      <Info size={20} />
      <div>
        <strong>{t("witness.title")}</strong>
        <p>{t("witness.usage", {
          status: t(`witness.status.${result.witness_usage.status}`),
          count: result.witness_usage.record_count,
          used: result.witness_usage.used_in_statement
            ? t("witness.usedYes")
            : t("witness.usedNo"),
        })}</p>
      </div>
    </div>
  );
}

function StepEight({
  value,
  onChange,
  result,
  factsConfirmed,
  responsibilityConfirmed,
  onFactsConfirmed,
  onResponsibilityConfirmed,
}: {
  value: string;
  onChange: (value: string) => void;
  result: AIResult | null;
  factsConfirmed: boolean;
  responsibilityConfirmed: boolean;
  onFactsConfirmed: (value: boolean) => void;
  onResponsibilityConfirmed: (value: boolean) => void;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="step-stack editor-layout">
      <section className={`form-card editor-card${expanded ? ' editor-expanded' : ''}`}><div className="document-toolbar"><span><PencilLine size={18} /> {t("wizard.details.directEdit")}</span><button type="button" className="outline-small editor-size-toggle" aria-expanded={expanded} aria-controls="final-statement" onClick={() => setExpanded(value => !value)}>{t(expanded ? 'demo.collapseEditor' : 'demo.expandEditor')}</button><small>{t("wizard.details.characters", { count: value.length })}</small></div><textarea id="final-statement" aria-label={t("wizard.details.directEdit")} value={value} onChange={(event) => onChange(event.target.value)} rows={expanded ? 20 : 10} /><p className="editor-help">{t("wizard.details.editHelp")}</p></section>
      <aside className="suggestion-panel"><span className="section-kicker">{t("common.aiCheckLabel")}</span><h2>{t("wizard.details.finalCheck")}</h2><ul><li><CheckCircle2 /> {t("wizard.details.checkDatePlace")}</li><li><CheckCircle2 /> {t("wizard.details.checkTask")}</li><li className={result?.missing_fields.length ? "warn" : ""}>{result?.missing_fields.length ? <AlertCircle /> : <CheckCircle2 />} {t("wizard.details.missingCount", { count: result?.missing_fields.length ?? 0 })}</li><li className={result?.fact_audit.status === "blocked" ? "warn" : ""}>{result?.fact_audit.status === "blocked" ? <AlertCircle /> : <ShieldCheck />} {ui("사실 대조: {{status}}", {status: result?.fact_audit.status === "blocked" ? ui("확인 필요") : ui("통과")})}</li></ul><label className="consent-check"><input type="checkbox" checked={factsConfirmed} onChange={(event) => onFactsConfirmed(event.target.checked)} />{ui("사고일시·장소·작업·상병 등 최종 문구의 사실을 직접 확인했습니다.")}</label><label className="consent-check"><input type="checkbox" checked={responsibilityConfirmed} onChange={(event) => onResponsibilityConfirmed(event.target.checked)} />{ui("AI 초안은 참고자료이며 최종 제출 내용의 책임이 신청인에게 있음을 확인합니다.")}</label><div className="legal-note"><Info /><p>{t("wizard.details.legal")}</p></div></aside>
    </div>
  );
}

function LoadingCard({ text }: { text: string }) {
  const { t } = useTranslation();
  return <PageLoading title={text} description={t("wizard.details.wait")} compact />;
}

function Completion({
  benefitType,
  language,
  onDownload,
  onExit,
  busy,
  error,
  preparedDownload,
}: {
  benefitType: ApplicationData["applicant"]["benefit_type"];
  language: SupportedLanguage;
  onDownload: (destination: PackageDestination) => void;
  onExit: () => void;
  busy: boolean;
  error: string;
  preparedDownload: BrowserFile | null;
}) {
  const { t } = useTranslation();
  const packageContents = benefitType === "survivor_benefit"
    ? ui("유족급여·장례비 청구 정보서 PDF · 재해경위서 PDF")
    : t("wizard.details.packageContents");
  return (
    <main className="completion-page page-shell">
      <section className="completion-hero"><span><Check size={36} /></span><small>{t("common.applicationReadyLabel")}</small><h1>{t("wizard.details.completionTitle")}</h1><p>실제 서류 생성 없이, 제출 준비가 끝난 화면까지 체험하셨습니다.</p></section>
      {error && <div className="error-banner"><AlertCircle size={18} /> {error}</div>}
      <PreparedDownload file={preparedDownload} />
      <section className="package-card panel"><div className="package-icon"><FileCheck2 /></div><div><h2>{t("wizard.details.package")}</h2><p>{packageContents}</p><span>{t("wizard.details.zip")}</span></div><div className="package-actions"><button className="primary-button" onClick={() => onDownload("downloads")} disabled={busy}>{busy ? <LoaderCircle className="spin" /> : <Download />} 결과 화면 미리보기</button><button className="outline-button" onClick={() => onDownload("choose")} disabled={busy}><FolderOpen size={17} /> 패키지 구성 보기</button></div></section>
      <section className="next-guide panel"><h2>{t("wizard.details.nextGuide")}</h2><ol><li><span>1</span><p><strong>{t("wizard.details.checkFiles")}</strong>{t("wizard.details.checkFilesHelp")}</p></li><li><span>2</span><p><strong>{t("wizard.details.officialRoute")}</strong>{t("wizard.details.officialRouteHelp")}</p></li><li><span>3</span><p><strong>{t("wizard.details.keepOriginals")}</strong>{t("wizard.details.keepOriginalsHelp")}</p></li></ol></section>
      <div className="completion-actions"><button className="outline-button" onClick={onExit}>{t("wizard.details.backDashboard")}</button></div>
    </main>
  );
}
