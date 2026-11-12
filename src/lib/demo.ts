import type { ApplicationData, PendingDocumentUpload } from '../types';

export interface DemoBundle {
  guide: {
    applicant: { preferred_language: ApplicationData['accident']['language'] };
    signature: { name: string; image: string };
    steps: Array<{ id: string; fields?: Record<string, any>; expected?: Record<string, unknown> }>;
  };
  files: Array<{ name: string; base64: string; mime_type: string; document_type: string; issued_at: string }>;
}
export interface DemoState { claim_id: string | null; completed: boolean; bundle: DemoBundle | null }
export function demoFields(bundle: DemoBundle, id: string): Record<string, any> {
  return bundle.guide.steps.find(step => step.id === id)?.fields ?? {};
}

// Only used with a server-issued synthetic demo bundle. Never infer medical
// details or an approval from a question. An absent fact stays explicitly unknown.
export function fillDemoReviewAnswers(
  bundle: DemoBundle,
  questions: Array<{ field: string; label: string }>,
  current: Record<string, string>,
): Record<string, string> {
  const supplied = demoFields(bundle, 'review').answers ?? {};
  const expected = bundle.guide.steps.find(step => step.id === 'ocr')?.expected ?? {};
  const diagnosis = typeof expected.diagnosis === 'string' ? expected.diagnosis.trim() : '';
  const unknown = '시연 자료에서 확인되지 않았습니다. 추가 사실은 기재하지 않습니다.';
  const next = { ...current };
  for (const item of questions) {
    // Even an intentionally emptied answer belongs to the user.
    if (Object.prototype.hasOwnProperty.call(current, item.field)) continue;
    const key = `${item.field} ${item.label}`;
    const category = /medical|treatment|diagnosis|치료|진료|진단/i.test(key) ? 'medical_treatment'
      : /work_disruption|work_impact|absence|결근|업무.*(지장|제한|영향)/i.test(key) ? 'work_disruption'
      : /post_accident|after_accident|first_aid|조치|응급/i.test(key) ? 'post_accident_action' : item.field;
    const known = supplied[item.field] ?? supplied[category];
    next[item.field] = typeof known === 'string' && known.trim() ? known
      : category === 'medical_treatment' && diagnosis
        ? `시연 진단소견서상 진단은 ${diagnosis}입니다. 구체적인 진료 경과와 추가 치료 내용은 확인되지 않았습니다.`
        : unknown;
  }
  return next;
}
export function demoUploads(bundle: DemoBundle): PendingDocumentUpload[] {
  return bundle.files.map(item => ({
    file: new File([Uint8Array.from(atob(item.base64), value => value.charCodeAt(0))], item.name, { type: item.mime_type }),
    document_type: item.document_type,
    issue_date: item.issued_at,
    source_kind: 'demo_fixture',
  }));
}
