export const CURRENT_LEGAL_TERMS_VERSION = "2026-08-14.2";
const LEGAL_CONSENT_STORAGE_KEY = "sanjae-legal-consent";

export const REQUIRED_LEGAL_CONSENTS = [
  "terms_accepted",
  "privacy_accepted",
  "sensitive_information_accepted",
  "unique_identifier_accepted",
  "document_truth_accepted",
] as const;

export type RequiredLegalConsent = (typeof REQUIRED_LEGAL_CONSENTS)[number];

export type LegalConsentSelection = Record<RequiredLegalConsent, boolean>;

export interface LegalConsentPayload extends LegalConsentSelection {
  terms_version: string;
}

interface StoredLegalConsent extends LegalConsentPayload {
  accepted_at: string;
}

function legalConsentStorageKey(userId: string | null | undefined): string {
  return userId
    ? `${LEGAL_CONSENT_STORAGE_KEY}:${userId}`
    : LEGAL_CONSENT_STORAGE_KEY;
}

export function allRequiredLegalConsentsAccepted(
  selection: LegalConsentSelection,
): boolean {
  return REQUIRED_LEGAL_CONSENTS.every((key) => selection[key]);
}

export function buildCurrentLegalConsentPayload(
  selection: LegalConsentSelection,
): LegalConsentPayload {
  return {
    terms_version: CURRENT_LEGAL_TERMS_VERSION,
    ...selection,
  };
}

export function saveCurrentLegalConsent(
  selection: LegalConsentSelection,
  userId?: string | null,
): LegalConsentPayload {
  if (!allRequiredLegalConsentsAccepted(selection)) {
    throw new Error("필수 약관에 모두 동의해주세요.");
  }
  const payload = buildCurrentLegalConsentPayload(selection);
  const stored: StoredLegalConsent = {
    ...payload,
    accepted_at: new Date().toISOString(),
  };
  localStorage.setItem(
    legalConsentStorageKey(userId),
    JSON.stringify(stored),
  );
  return payload;
}

export function readCurrentLegalConsent(
  userId?: string | null,
): LegalConsentPayload | null {
  const storageKey = legalConsentStorageKey(userId);
  const raw = localStorage.getItem(storageKey);
  if (!raw) return null;
  try {
    const stored = JSON.parse(raw) as Partial<StoredLegalConsent>;
    if (stored.terms_version !== CURRENT_LEGAL_TERMS_VERSION) return null;
    const selection = Object.fromEntries(
      REQUIRED_LEGAL_CONSENTS.map((key) => [key, stored[key] === true]),
    ) as LegalConsentSelection;
    return allRequiredLegalConsentsAccepted(selection)
      ? buildCurrentLegalConsentPayload(selection)
      : null;
  } catch {
    localStorage.removeItem(storageKey);
    return null;
  }
}

export function hasCurrentLegalConsent(userId?: string | null): boolean {
  return readCurrentLegalConsent(userId) !== null;
}

export function clearCurrentLegalConsent(userId?: string | null): void {
  localStorage.removeItem(legalConsentStorageKey(userId));
}

export function applicationEntryStep(hasConsent: boolean): 0 | 1 {
  return hasConsent ? 1 : 0;
}
