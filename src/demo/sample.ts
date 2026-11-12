import type { ApplicationData, PendingDocumentUpload } from '../types';
import { profile } from './fixtures';

export const sampleData: ApplicationData = {
  applicant: {
    name: '김민준', name_en: 'KIM MINJUN', signature_name: '김민준', birth_date: '1988-05-14',
    worker_type: '근로자', phone: '010-0000-0000', email: 'demo@example.com',
    address: '서울특별시 영등포구 예시로 120', nationality: '대한민국', preferred_language: 'ko',
    benefit_type: 'medical_care', applicant_role: 'self', injured_worker_name: '', relationship_to_worker: '',
    authority_document_type: '', authority_confirmed: false, deceased_worker_name: '', relationship_to_deceased: 'self',
  },
  workplace: {
    company_name: '한빛물류 주식회사', business_registration_no: '000-00-00000', management_number: '',
    representative_name: '이대표 (예시)', phone: '02-000-0000', address: '경기도 고양시 예시산업로 42',
    occupation: '물류 상하차 및 포장', job_position: '현장 작업자',
  },
  accident: {
    accident_type: 'work_accident', accident_date: '2026-08-20', accident_date_precision: 'exact', approximate_date_text: '',
    accident_time: '10:30', accident_time_precision: 'exact', accident_place: '한빛물류 물류센터 2층 포장 구역',
    task_description: '완성품 상자를 운반하고 있었습니다.',
    raw_description: '완성품 상자를 옮기던 중 바닥에 놓인 포장끈에 발이 걸려 넘어졌습니다. 넘어지면서 오른쪽 손목과 허리를 바닥에 부딪혔습니다.',
    language: 'ko', injury_parts: ['오른쪽 손목', '허리'], witness_status: 'no', witness_name: '', witness_phone: '',
    witness_relationship: '', witness_statement: '',
  },
};
export function sampleUploads(): PendingDocumentUpload[] {
  return [['진단서', 'diagnosis'], ['재직업무확인서', 'employment'], ['목격자확인서', 'witness']].map(([name, type]) => ({
    file: new File(['SYNTHETIC DEMO PLACEHOLDER'], `${name}_예시.pdf`, { type: 'application/pdf' }),
    document_type: type, issue_date: '2026-08-20', source_kind: 'demo_fixture',
  }));
}
profile.address = sampleData.applicant.address;
profile.workplace.address = sampleData.workplace.address;
