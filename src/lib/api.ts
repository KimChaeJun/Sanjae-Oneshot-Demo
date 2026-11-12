import { demoRequest } from '../demo/transport';
import type { AIResult, ApplicationData, AuthSession, ClaimDetail, ClaimDocument, ClaimSummary, DocumentTypeOption, GeneratedDocument, OcrResult, PendingDocumentUpload, ProfileSummary, RequirementAnalysis } from '../types';
import type { BrowserFile } from './browserFile';
export type PackageDestination = 'downloads' | 'choose';
export function getAuthSession(): AuthSession | null { return null; }
async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await demoRequest(path, { method, body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body) });
  if (!response.ok) throw new Error((await response.json()).detail);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
export const api = {
  getProfile: () => request<ProfileSummary>('/profile/me'),
  listClaims: () => request<ClaimSummary[]>('/claims'),
  getResumableClaim: () => request<ClaimSummary | null>('/claims/resumable'),
  getClaimDetail: (id: string) => request<ClaimDetail>(`/claims/${id}/detail`),
  createClaim: (language: string) => request<ClaimSummary>('/claims', 'POST', { language }),
  resumeClaim: (id: string) => request<ClaimSummary>(`/claims/${id}/resume`, 'POST'),
  abandonClaim: (id: string) => request<ClaimSummary>(`/claims/${id}/abandon`, 'POST'),
  deleteClaim: (id: string) => request<void>(`/claims/${id}`, 'DELETE'),
  saveStep1: (id: string, data: Pick<ApplicationData, 'applicant' | 'workplace'>) => request<ClaimSummary>(`/claims/${id}/steps/1`, 'PUT', data),
  saveStep2: (id: string, data: ApplicationData['accident']) => request<ClaimSummary>(`/claims/${id}/steps/2`, 'PUT', data),
  getDocumentTypes: (_benefit: string) => request<DocumentTypeOption[]>('/claims/document-types'),
  uploadDocuments: async (id: string, uploads: PendingDocumentUpload[]) => {
    const documents = [];
    for (const upload of uploads) {
      const form = new FormData(); form.append('files', upload.file); form.append('document_type', upload.document_type);
      documents.push(...await request<Array<{ id: string; file_name: string }>>(`/claims/${id}/steps/3/documents`, 'POST', form));
    }
    return documents;
  },
  analyzeRequirements: (id: string) => request<RequirementAnalysis>(`/claims/${id}/steps/4/analyze`, 'POST'),
  runOcr: (id: string, _documents: string[], _language: string) => request<OcrResult>(`/claims/${id}/steps/5/ocr`, 'POST'),
  generate: (id: string, _accident: ApplicationData['accident']) => request<AIResult>(`/claims/${id}/steps/6/generate`, 'POST'),
  review: (id: string, action: string, user_answers: Record<string, string> = {}) => request<AIResult>(`/claims/${id}/steps/7/review`, 'POST', { action, user_answers }),
  saveReviewDraft: (id: string, form_id: string, generated_text: string, answers: Record<string, string>) => request<void>(`/claims/${id}/review-draft`, 'PUT', { form_id, generated_text, answers }),
  updateForm: (id: string, formId: string, generated_text: string, facts_confirmed: boolean, responsibility_confirmed: boolean) => request<ClaimSummary>(`/claims/${id}/steps/8/forms/${formId}`, 'PUT', { generated_text, facts_confirmed, responsibility_confirmed }),
  downloadPackage: async (_id: string, _destination: PackageDestination = 'downloads'): Promise<BrowserFile | null> => { window.dispatchEvent(new Event('demo-package-preview')); return null; },
  openClaimDocument: async (_id: string, _document: ClaimDocument): Promise<BrowserFile | null> => { window.dispatchEvent(new Event('demo-package-preview')); return null; },
  openGeneratedDocument: async (_id: string, _document: GeneratedDocument): Promise<BrowserFile | null> => { window.dispatchEvent(new Event('demo-package-preview')); return null; },
};
