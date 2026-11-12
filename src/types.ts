export type View = "login" | "signup" | "dashboard" | "application" | "mypage" | "claim-detail" | "profile-edit" | "admin";

export interface AuthSession {
  user_id: string;
  email: string;
  access_token: string | null;
  refresh_token: string | null;
  token_type: string;
  expires_in: number | null;
  email_confirmation_required: boolean;
  message: string;
  role: "user" | "admin";
  authenticator_assurance_level?: "aal1" | "aal2";
  mfa_required?: boolean;
  app_expires_at?: number;
  last_activity_at?: number;
  session_started_at?: number;
}

export interface ProfileSummary {
  user_id: string;
  name: string;
  name_en: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  nationality: string | null;
  preferred_language: "ko" | "en" | "vi" | "fil" | "th" | "km" | "zh" | "ja";
  birth_date: string | null;
  worker_type: string | null;
  signature_name: string | null;
  signature_image: string | null;
  identity_number_type: "resident" | "foreign" | null;
  identity_number_masked: string | null;
  visa_type: string | null;
  interpreter_needed: boolean;
  workplace: {
    company_name?: string;
    address?: string;
    occupation?: string;
    job_position?: string;
  } | null;
  total_claims: number;
  ready_claims: number;
  latest_claim_id: string | null;
}

export interface ProfileUpdate {
  birth_date_verification: string;
  name: string;
  name_en: string | null;
  phone: string | null;
  address: string | null;
  nationality: string | null;
  preferred_language: "ko" | "en" | "vi" | "fil" | "th" | "km" | "zh" | "ja";
  signature_name: string | null;
  signature_image?: string | null;
  identity_number_type?: "foreign" | null;
  foreign_registration_no?: string | null;
}

export interface ClaimSummary {
  id: string;
  accident_type: string | null;
  claim_status: string;
  current_step: number;
  language?: "ko" | "en" | "vi" | "fil" | "th" | "km" | "zh" | "ja";
  created_at?: string;
  updated_at: string;
  completed_at?: string | null;
  processing_status?: ProcessingStatus;
  processing_completed_at?: string | null;
  deletion_due_at?: string | null;
  lifecycle_status: "active" | "abandoned";
  abandoned_at?: string | null;
  draft_expires_at?: string | null;
}

export type AdminStepStatus = "not_started" | "in_progress" | "completed" | "needs_action";
export type ProcessingStatus =
  | "not_started"
  | "submitted"
  | "under_review"
  | "additional_documents_required"
  | "approved"
  | "denied"
  | "completed";

export interface AdminStepProgress {
  step: number;
  status: AdminStepStatus;
  note: string;
  updated_by?: string | null;
  updated_at?: string | null;
}

export interface ClaimDocument {
  id: string;
  document_type: string;
  file_name: string;
  storage_path: string;
  status: string;
  mime_type?: string | null;
  file_size?: number | null;
  sha256?: string | null;
  issue_date?: string | null;
  source_kind?: "user_upload" | "issuer_direct" | "generated" | "demo_fixture";
  integrity_status?: "unverified" | "hash_recorded" | "issuer_verified" | "manual_review_required" | "verified" | "rejected";
  created_at?: string | null;
}

export interface GeneratedDocument {
  id: string;
  document_key: string;
  file_name: string;
  storage_path: string;
  mime_type: string;
  file_size?: number | null;
  created_at: string;
}

export interface DocumentTypeOption {
  code: string;
  name_ko: string;
  name_en: string;
  category: string;
  processing_type: "generated" | "ocr" | "manual";
  handling_mode: "generate" | "store";
  needs_ocr: boolean;
  required_by_default: boolean;
  uploadable: boolean;
  benefit_types: string[];
  source_forms: string[];
}

export interface PendingDocumentUpload {
  file: File;
  document_type: string;
  issue_date: string;
  source_kind: "user_upload" | "issuer_direct" | "demo_fixture";
}

export interface ClaimDetail extends ClaimSummary {
  access_expires_at: string | null;
  within_user_access_period: boolean;
  documents: ClaimDocument[];
  generated_documents: GeneratedDocument[];
  data: {
    step1?: {
      applicant?: Partial<ApplicationData["applicant"]>;
      workplace?: Partial<ApplicationData["workplace"]>;
    };
    step2?: Partial<ApplicationData["accident"]>;
    step3?: ClaimDocument[];
    step6?: {
      generated_statement_ko?: string;
      result?: {
        generated_statement_ko?: string;
      };
    };
    step8?: {
      generated_text?: string;
      form_data?: Record<string, unknown>;
    };
    step5?: {
      identity_verification?: IdentityVerification;
      field_validation?: OcrFieldValidation;
    };
    admin_review?: {
      status: "pending" | "approved" | "needs_correction";
      note?: string;
      reviewed_by?: string;
      reviewed_at?: string;
    };
    processing_progress?: {
      status: ProcessingStatus;
      note?: string;
      updated_by?: string;
      updated_at?: string;
      processing_completed_at?: string | null;
      deletion_due_at?: string | null;
      history?: Array<Record<string, unknown>>;
    };
  };
}

export interface RequirementAnalysis {
  recommended_claim_type: string;
  expected_benefits: string[];
  required_documents: Array<{
    code: string;
    name: string;
    required: boolean;
    reason: string;
    category?: string | null;
    processing_type: "generated" | "ocr" | "manual";
    handling_mode: "generate" | "store";
    needs_ocr: boolean;
  }>;
  additional_evidence: string[];
  disclaimer: string;
}

export interface OcrResult {
  job_id: string;
  status: string;
  fields: Array<{
    name: string;
    value: string;
    confidence: number;
    user_confirmed: boolean;
  }>;
  warnings: string[];
  field_validation: OcrFieldValidation;
  identity_verification: IdentityVerification;
}

export interface OcrFieldValidation {
  status: "passed" | "review_required" | "not_applicable";
  model_name: string;
  score: number;
  matched_fields: number;
  total_fields: number;
  checks: Array<{
    field_name: string;
    label: string;
    expected_value: string;
    status: "matched" | "missing";
    match_method: "normalized_exact" | "alias" | "none";
    matched_document: string | null;
    confidence: number | null;
  }>;
}

export interface IdentityVerification {
  status: "verified" | "rejected" | "manual_review_required" | "not_required" | "admin_verified" | "admin_rejected";
  benefit_type: "medical_care" | "survivor_benefit";
  expected_applicant_name: string | null;
  expected_deceased_name: string | null;
  message: string;
  checks: Array<{
    document_name: string;
    status: "verified" | "rejected" | "manual_review_required";
    applicant_name_found: boolean;
    deceased_name_found: boolean | null;
    spouse_relationship_found: boolean | null;
    matched_name: string | null;
    reason: string;
  }>;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  review_note?: string | null;
}

export interface AdminClaimSummary {
  id: string;
  user_id: string;
  applicant_name: string;
  benefit_type: string;
  claim_status: string;
  current_step: number;
  updated_at: string;
  verification_status: string;
  final_form_ready: boolean;
  admin_review_status: string;
  missing_count: number;
  ocr_average_confidence: number | null;
  integrity_status: string;
  fact_audit_status: string;
  elapsed_seconds: number;
  current_step_elapsed_seconds: number;
  processing_status: ProcessingStatus;
  processing_completed_at: string | null;
  deletion_due_at: string | null;
  lifecycle_status: "active" | "abandoned";
  abandoned_at: string | null;
  draft_expires_at: string | null;
}

export interface AdminClaimDetail extends AdminClaimSummary {
  data: ClaimDetail["data"];
  step_progress: AdminStepProgress[];
}

export interface AdminOverview {
  generated_at: string;
  server: {
    status: "ok" | "degraded";
    database: "connected" | "unreachable" | "not_configured";
    environment: string;
    uptime_seconds: number;
  };
  claims: {
    total: number;
    active: number;
    abandoned: number;
    completed: number;
    needs_attention: number;
  };
  usage: Array<{
    date: string;
    visitors: number;
    page_views: number;
    errors: number;
    estimated_cost_usd: number;
  }>;
  cost_trend: Array<{
    date: string;
    aws_usd: number;
    supabase_usd: number;
    api_usd: number;
    total_usd: number;
  }>;
  cost_summary: {
    month_to_date_usd: number;
    month_to_date_krw: number;
    aws_usd: number;
    supabase_usd: number;
    api_usd: number;
    usd_krw_rate: number;
    exchange_rate_date: string;
    exchange_rate_source: "ecb" | "fallback";
    aws_cost_available: boolean;
    supabase_cost_configured: boolean;
  };
  recent_errors: Array<{
    path: string | null;
    status_code: number | null;
    occurred_at: string;
  }>;
  cost_rates_configured: boolean;
}

export interface AdminDatabaseTable {
  name: string;
  label: string;
  row_count: number;
  deletable: boolean;
}

export interface AdminDatabaseRows {
  table: string;
  rows: Array<Record<string, unknown>>;
}

export interface AIResult {
  form_id: string;
  form_type: string;
  form_version: number;
  generated_statement_ko: string;
  translated_input_ko?: string | null;
  translated_fields_ko?: Record<string, string>;
  witness_usage: {
    status: "present" | "none" | "unknown" | "skipped";
    source: "WITNESSES_TABLE";
    record_count: number;
    used_in_statement: boolean;
  };
  missing_fields: Array<{
    field: string;
    label: string;
    question_ko: string;
    question_user_language: string;
  }>;
  guide_questions: string[];
  warnings: string[];
  alternative_evidence_guidance: string[];
  document_quality: {
    six_w_completeness: number;
    fact_fidelity: number;
    clarity: number;
    consistency: number;
    overall: number;
  };
  fact_audit: {
    status: "passed" | "blocked";
    unsupported_facts: string[];
    checked_fact_count: number;
    field_checks: Array<{
      field: "who" | "when" | "where" | "what" | "how";
      label: string;
      status: "matched" | "missing" | "not_provided";
      source_value: string;
      message: string;
    }>;
    message: string;
  };
  regeneration_recommended: boolean;
  next_claim_status: string;
  requires_user_confirmation: boolean;
  interview_round: number;
  interview_status: "questions_pending" | "verification_blocked" | "ready";
  answered_question_count: number;
}

export interface ApplicationData {
  applicant: {
    name: string;
    name_en: string;
    signature_name: string;
    birth_date: string;
    worker_type: string;
    phone: string;
    email: string;
    address: string;
    nationality: string;
    preferred_language: "ko" | "en" | "vi" | "fil" | "th" | "km" | "zh" | "ja";
    benefit_type: "medical_care" | "survivor_benefit";
    applicant_role: "self" | "guardian" | "welfare_worker" | "authorized_representative";
    injured_worker_name: string;
    relationship_to_worker: string;
    authority_document_type: string;
    authority_confirmed: boolean;
    deceased_worker_name: string;
    relationship_to_deceased: "self" | "spouse";
  };
  workplace: {
    company_name: string;
    business_registration_no: string;
    management_number: string;
    representative_name: string;
    phone: string;
    address: string;
    occupation: string;
    job_position: string;
  };
  accident: {
    accident_type: "work_accident" | "occupational_disease" | "commute";
    accident_date: string;
    accident_date_precision: "exact" | "approximate" | "unknown";
    approximate_date_text: string;
    accident_time: string;
    accident_time_precision: "exact" | "approximate" | "unknown";
    accident_place: string;
    task_description: string;
    raw_description: string;
    language: "ko" | "en" | "vi" | "fil" | "th" | "km" | "zh" | "ja";
    injury_parts: string[];
    witness_status: "yes" | "no";
    witness_name: string;
    witness_phone: string;
    witness_relationship: string;
    witness_statement: string;
  };
}
