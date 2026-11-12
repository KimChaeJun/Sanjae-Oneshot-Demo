import type { AIResult, ApplicationData } from "../types";

export type StepOneRequiredField =
  | "applicant.name" | "applicant.phone" | "applicant.address" | "applicant.worker_type"
  | "applicant.deceased_worker_name" | "applicant.injured_worker_name"
  | "applicant.relationship_to_worker" | "applicant.authority_document_type"
  | "applicant.authority_confirmed" | "workplace.company_name" | "workplace.address";

const present = (value: unknown) => typeof value === "string" && value.trim().length > 0;

export function isLoginReady(email: string, password: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && password.length >= 8 && password.length <= 128;
}

export function getMissingStepOneFields(data: ApplicationData): Set<StepOneRequiredField> {
  const required: Array<[StepOneRequiredField, unknown]> = [
    ["applicant.name", data.applicant.name], ["applicant.phone", data.applicant.phone],
    ["applicant.address", data.applicant.address], ["applicant.worker_type", data.applicant.worker_type],
    ["workplace.company_name", data.workplace.company_name], ["workplace.address", data.workplace.address],
  ];
  if (data.applicant.benefit_type === "survivor_benefit") required.push(["applicant.deceased_worker_name", data.applicant.deceased_worker_name]);
  if (data.applicant.applicant_role !== "self") required.push(
    ["applicant.injured_worker_name", data.applicant.injured_worker_name],
    ["applicant.relationship_to_worker", data.applicant.relationship_to_worker],
    ["applicant.authority_document_type", data.applicant.authority_document_type],
    ["applicant.authority_confirmed", data.applicant.authority_confirmed ? "yes" : ""],
  );
  return new Set(required.filter(([, value]) => !present(value)).map(([key]) => key));
}

export function validCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + "T00:00:00Z");
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function isAccidentReady(data: ApplicationData["accident"]): boolean {
  if (!["work_accident", "commute", "occupational_disease"].includes(data.accident_type)) return false;
  if (![data.accident_place, data.task_description, data.raw_description].every(present) || data.raw_description.trim().length < 10) return false;
  if (data.accident_date_precision === "exact" && !validCalendarDate(data.accident_date)) return false;
  if (data.accident_date_precision === "approximate" && !validCalendarDate(data.accident_date) && !present(data.approximate_date_text)) return false;
  if (data.accident_time_precision === "exact" && !/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(data.accident_time)) return false;
  if (data.witness_status === "yes" && ![data.witness_name, data.witness_relationship, data.witness_statement].every(present)) return false;
  return true;
}

export function hasRequiredInterviewAnswers(result: AIResult | null, answers: Record<string, string>): boolean {
  return Boolean(result && result.missing_fields.every(item => present(answers[item.field])));
}

export function isProfileReady(form: { name: string; birth_date_verification: string; phone: string | null; address: string | null; nationality: string | null; identity_number: string }, signature: string, initialSetup: boolean): boolean {
  const birth = form.birth_date_verification;
  const iso = birth.slice(0, 4) + "-" + birth.slice(4, 6) + "-" + birth.slice(6, 8);
  const identityDigits = form.identity_number.replace(/\D/g, "");
  if (!present(form.name) || !signature || !/^\d{8}$/.test(birth) || !validCalendarDate(iso)) return false;
  if (iso > new Date().toISOString().slice(0, 10)) return false;
  if (identityDigits && identityDigits.length !== 13) return false;
  return !initialSetup || [form.phone, form.address, form.nationality].every(present);
}
