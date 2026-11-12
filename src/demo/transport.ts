import { profile, documentTypes, requirements, ocrResult, aiResult } from './fixtures';

const claims = new Map<string, Record<string, any>>();
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
export function clearDemo() { claims.clear(); }

/** Local transport only. No fetch or remote fallback. */
export async function demoRequest(path: string, options: RequestInit = {}): Promise<Response> {
  const url = path.split('?')[0], method = options.method ?? 'GET';
  const body = typeof options.body === 'string' ? JSON.parse(options.body) : {};
  await new Promise(resolve => setTimeout(resolve, method === 'GET' ? 100 : /analyze|ocr|generate|review/.test(path) ? 850 : 180));
  if (url === '/profile/me') {
    if (method !== 'GET') Object.assign(profile, body);
    return json({ ...profile, total_claims: claims.size, ready_claims: [...claims.values()].filter(c => c.claim_status === 'ready').length });
  }
  if (url.startsWith('/auth/') || url.includes('legal-consent') || url.includes('telemetry')) return json({ message: '데모 화면입니다.' });
  if (url === '/claims/document-types') return json(documentTypes);
  if (url === '/claims/resumable') return json([...claims.values()].reverse().find(c => c.claim_status !== 'ready' && c.lifecycle_status === 'active') ?? null);
  if (url === '/claims' && method === 'GET') return json([...claims.values()].reverse());
  if (url === '/claims' && method === 'POST') {
    const id = `demo-${crypto.randomUUID()}`, now = new Date().toISOString();
    const claim = { id, accident_type: 'work_accident', claim_status: 'draft', current_step: 1, language: body.language ?? 'ko',
      created_at: now, updated_at: now, completed_at: null, lifecycle_status: 'active', abandoned_at: null,
      draft_expires_at: new Date(Date.now() + 86400000).toISOString(), access_expires_at: null, within_user_access_period: true,
      documents: [], generated_documents: [], data: {} };
    claims.set(id, claim); return json(claim);
  }
  const id = url.split('/')[2], claim = claims.get(id);
  if (!claim) return json({ detail: '체험이 초기화되었습니다. 새 신청으로 다시 시작해주세요.' }, 404);
  if (method === 'DELETE') { claims.delete(id); return new Response(null, { status: 204 }); }
  if (url.endsWith('/detail')) return json(claim);
  if (url.endsWith('/resume')) { claim.lifecycle_status = 'active'; return json(claim); }
  if (url.endsWith('/abandon')) { claim.lifecycle_status = 'abandoned'; return json(claim); }
  if (url.endsWith('/steps/1')) claim.data.step1 = body;
  else if (url.endsWith('/steps/2')) { claim.data.step2 = body; claim.accident_type = body.accident_type; }
  else if (url.endsWith('/steps/3/documents')) {
    const form = options.body as FormData, file = form.get('files') as File;
    const document = { id: crypto.randomUUID(), file_name: file.name, document_type: form.get('document_type'), storage_path: '', status: 'confirmed', mime_type: file.type, file_size: file.size };
    claim.documents.push(document); claim.data.step3 = claim.documents; return json([document]);
  } else if (url.endsWith('/analyze')) { claim.data.step4 = requirements; claim.current_step = 4; return json(requirements); }
  else if (url.endsWith('/ocr')) { claim.data.step5 = ocrResult; claim.current_step = 5; return json(ocrResult); }
  else if (url.endsWith('/generate')) {
    claim.data.step6 = { result: structuredClone(aiResult), form_id: aiResult.form_id, form_type: aiResult.form_type, form_version: 1 };
    claim.current_step = 6; return json(claim.data.step6.result);
  } else if (url.endsWith('/review')) { claim.data.step7 = { accepted: true }; claim.current_step = 7; return json(claim.data.step6.result); }
  else if (url.includes('/steps/8/forms/')) {
    claim.data.step8 = body; claim.claim_status = 'ready'; claim.current_step = 8; claim.completed_at = new Date().toISOString();
    claim.generated_documents = ['01_산재_신청정보_예시.pdf', '02_재해경위서_예시.pdf'].map((file_name, index) => ({ id: `sample-${index}`, file_name, form_type: index ? 'accident_statement' : 'claim_form', version: 1, status: 'demo', created_at: claim.completed_at }));
  } else if (url.endsWith('/review-draft')) { claim.data.review_draft = body; return json({ saved: true }); }
  else return json({ detail: '이 체험에서는 화면 이동만 제공됩니다.' }, 400);
  claim.current_step = Number(url.match(/steps\/(\d)/)?.[1] ?? claim.current_step);
  claim.updated_at = new Date().toISOString(); return json(claim);
}
