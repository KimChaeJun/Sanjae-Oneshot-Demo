import i18n from "../i18n";
import { requirementCopy } from "../locales/requirementCopy";

const requirementSources = new Map<string, string>(
  requirementCopy.flatMap(row => row.map(text => [text, row[0]] as [string, string])),
);

/** Also handles persisted results created while another locale was selected. */
export function requirementText(source: string): string {
  return ui(requirementSources.get(source) ?? source);
}

const documentNames: Record<string, string> = {
  medical_care_application_kr: "요양급여신청서",
  medical_care_temporary_disability_application_en: "요양급여·휴업급여 신청(청구)서(영문)",
  temporary_disability_benefit_claim: "휴업급여·상병보상연금 청구서",
  unpaid_benefit_claim: "미지급 보험급여 청구서",
  disability_benefit_claim_en: "장해급여청구서(영문)",
  disability_prevention_application: "장해급여·합병증 등 예방관리 신청서",
  additional_injury_application_opinion: "추가상병 신청서·소견서",
  recurrence_application_opinion: "재요양 신청서·소견서",
  medical_care_application_en: "영어 요양급여신청서",
  survivor_benefit_funeral_claim: "유족급여·진폐유족연금·장례비 청구서",
  accident_statement: "재해경위서", integrated_application: "통합신청서",
  passport_fact_certificate_application: "여권 사실증명 신청서",
  diagnosis: "진단서", medical_record: "의무기록",
  medical_expense_claim_support: "영문 요양비청구서 작성·발행본",
  employment: "재직·업무 확인 자료", work_order: "작업지시서",
  witness_statement: "목격자 확인서", accident_photo: "사고 현장 사진·CCTV",
  accident_fact_confirmation: "사고 사실 확인 자료",
  family_relationship_certificate: "가족관계·배우자 확인 자료",
  death_certificate: "사망진단서·사망 사실 확인 자료",
  mobile_foreign_registration: "모바일 외국인등록증 등록·인증 자료",
  residence_status_document: "체류자격 관련 서류", passport_fact_certificate: "여권사실증명",
  other_compensation: "다른 보상·배상 확인 자료",
};

export function documentTypeLabel(code: string, fallback = code): string {
  return ui(documentNames[code] ?? fallback);
}

/** The backend may include a list of fixed field labels in this status message. */
export function factAuditMessage(message: string): string {
  const prefix = "사용자가 입력한 핵심 사실이 생성문에서 확인되지 않습니다: ";
  return message.startsWith(prefix)
    ? ui("사용자가 입력한 핵심 사실이 생성문에서 확인되지 않습니다: {{fields}}", {
      fields: message.slice(prefix.length).split(", ").map(label => ui(label)).join(", "),
    })
    : ui(message);
}

/** Source-keyed UI copy. Domain values and user/document contents stay unchanged. */
export function ui(source: string, values: Record<string, string | number> = {}): string {
  return i18n.t(source, {
    ns: "ui",
    keySeparator: false,
    nsSeparator: false,
    defaultValue: source,
    ...values,
  });
}
