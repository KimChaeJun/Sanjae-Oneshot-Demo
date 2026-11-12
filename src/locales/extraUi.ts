// Existing locale-specific copy, consolidated under i18next.
import type {SupportedLanguage} from '../i18n';
const requiredValidationMessages: Record<SupportedLanguage, { summary: string; field: string }> = {
  ko: { summary: "필수 입력 항목 {{count}}개를 확인해주세요.", field: "필수 입력 항목입니다." },
  en: { summary: "Check the {{count}} required fields.", field: "This field is required." },
  vi: { summary: "Hãy kiểm tra {{count}} trường bắt buộc.", field: "Trường này là bắt buộc." },
  fil: { summary: "Suriin ang {{count}} required fields.", field: "Required ang field na ito." },
  th: { summary: "โปรดตรวจสอบช่องที่จำเป็น {{count}} ช่อง", field: "จำเป็นต้องกรอกข้อมูลนี้" },
  km: { summary: "សូមពិនិត្យវាលចាំបាច់ចំនួន {{count}}។", field: "ចាំបាច់ត្រូវបំពេញវាលនេះ។" },
  zh: { summary: "请检查 {{count}} 个必填项。", field: "此项为必填项。" },
  ja: { summary: "必須入力項目 {{count}} 件を確認してください。", field: "必須入力項目です。" },
};
const interviewValidationMessages: Record<SupportedLanguage, { missing: string; apply: string }> = {
  ko: { missing: "AI 인터뷰 필수 질문 {{count}}개에 답변해주세요.", apply: "답변 반영 및 사실 검증" },
  en: { missing: "Answer the {{count}} required AI interview question(s).", apply: "Apply answers and verify facts" },
  vi: { missing: "Hãy trả lời {{count}} câu hỏi bắt buộc của phỏng vấn AI.", apply: "Áp dụng câu trả lời và kiểm tra dữ kiện" },
  fil: { missing: "Sagutan ang {{count}} required AI interview question.", apply: "Ilapat ang sagot at i-verify ang facts" },
  th: { missing: "โปรดตอบคำถามสัมภาษณ์ AI ที่จำเป็น {{count}} ข้อ", apply: "นำคำตอบไปใช้และตรวจสอบข้อเท็จจริง" },
  km: { missing: "សូមឆ្លើយសំណួរសម្ភាសន៍ AI ចាំបាច់ចំនួន {{count}}។", apply: "អនុវត្តចម្លើយ និងផ្ទៀងផ្ទាត់ព័ត៌មាន" },
  zh: { missing: "请回答 {{count}} 个 AI 访谈必答问题。", apply: "应用回答并核实事实" },
  ja: { missing: "AI インタビューの必須質問 {{count}} 件に回答してください。", apply: "回答を反映して事実を確認" },
};
const benefitTranslations = {
    ko: {
      benefit: "신청 급여 유형",
      medical: "요양급여 등 본인 신청",
      survivor: "사망유족급여(배우자 신청)",
      deceased: "사망 근로자 성명",
      relationship: "사망 근로자와의 관계",
      spouse: "배우자",
    },
    en: {
      benefit: "Benefit application type",
      medical: "Worker's own claim",
      survivor: "Survivor benefit (spouse)",
      deceased: "Deceased worker name",
      relationship: "Relationship to deceased",
      spouse: "Spouse",
    },
    vi: {
      benefit: "Loại trợ cấp",
      medical: "Người lao động tự nộp",
      survivor: "Trợ cấp tuất (vợ/chồng)",
      deceased: "Tên người lao động đã mất",
      relationship: "Quan hệ với người đã mất",
      spouse: "Vợ/chồng",
    },
    fil: {
      benefit: "Uri ng benepisyo",
      medical: "Sariling claim ng worker",
      survivor: "Survivor benefit (asawa)",
      deceased: "Pangalan ng namatay na worker",
      relationship: "Relasyon sa namatay",
      spouse: "Asawa",
    },
    th: {
      benefit: "ประเภทสิทธิประโยชน์ที่ยื่นขอ",
      medical: "ลูกจ้างยื่นคำขอด้วยตนเอง",
      survivor: "สิทธิประโยชน์ผู้รอดชีวิต (คู่สมรส)",
      deceased: "ชื่อของลูกจ้างที่เสียชีวิต",
      relationship: "ความสัมพันธ์กับผู้เสียชีวิต",
      spouse: "คู่สมรส",
    },
    km: {
      benefit: "ប្រភេទអត្ថប្រយោជន៍",
      medical: "កម្មករដាក់ពាក្យដោយខ្លួនឯង",
      survivor: "អត្ថប្រយោជន៍សម្រាប់អ្នកនៅរស់ (ប្តី/ប្រពន្ធ)",
      deceased: "ឈ្មោះកម្មករដែលបានស្លាប់",
      relationship: "ទំនាក់ទំនងជាមួយអ្នកស្លាប់",
      spouse: "ប្តី/ប្រពន្ធ",
    },
    zh: {
      benefit: "申请给付类型",
      medical: "劳动者本人申请",
      survivor: "遗属给付（配偶申请）",
      deceased: "已故劳动者姓名",
      relationship: "与已故劳动者的关系",
      spouse: "配偶",
    },
    ja: {
      benefit: "申請する給付の種類",
      medical: "労働者本人による申請",
      survivor: "遺族給付（配偶申請）",
      deceased: "死亡した労働者の氏名",
      relationship: "死亡した労働者との関係",
      spouse: "配偶者",
    },
  };
const retentionPolicyCopy: Record<SupportedLanguage, { notice: string; generated: string }> = {
  ko: {
    notice: "상세 조회는 신청일로부터 30일 동안 가능합니다. 산재 처리 완료를 관리자가 확인하면 그 시점부터 1년 뒤 신청 데이터와 첨부파일이 삭제됩니다.",
    generated: "8단계에서 확정한 PDF는 신청일로부터 30일 동안 다시 확인할 수 있습니다.",
  },
  en: {
    notice: "Claim details are available for 30 days from the application date. After an administrator confirms processing completion, the claim data and files are deleted one year later.",
    generated: "Confirmed PDFs remain available for 30 days from the application date.",
  },
  vi: {
    notice: "Có thể xem chi tiết trong 30 ngày kể từ ngày nộp đơn. Dữ liệu và tệp sẽ bị xóa sau một năm kể từ khi quản trị viên xác nhận hoàn tất xử lý.",
    generated: "Có thể xem lại PDF đã xác nhận trong 30 ngày kể từ ngày nộp đơn.",
  },
  fil: {
    notice: "Makikita ang claim details sa loob ng 30 araw mula sa application date. Buburahin ang claim data at files isang taon matapos kumpirmahin ng admin na tapos na ang processing.",
    generated: "Makikita muli ang confirmed PDFs sa loob ng 30 araw mula sa application date.",
  },
  th: {
    notice: "ดูรายละเอียดได้เป็นเวลา 30 วันนับจากวันที่ยื่นคำขอ หลังจากผู้ดูแลระบบยืนยันว่าดำเนินการเสร็จสิ้น ข้อมูลคำขอและไฟล์จะถูกลบในอีกหนึ่งปีถัดมา",
    generated: "สามารถเปิดดู PDF ที่ยืนยันแล้วได้อีกครั้งเป็นเวลา 30 วันนับจากวันที่ยื่นคำขอ",
  },
  km: {
    notice: "ព័ត៌មានលម្អិតអាចមើលបានរយៈពេល 30 ថ្ងៃចាប់ពីថ្ងៃដាក់ពាក្យ។ ទិន្នន័យ និងឯកសារនឹងត្រូវលុបមួយឆ្នាំបន្ទាប់ពីអ្នកគ្រប់គ្រងបញ្ជាក់ថាការដំណើរការបានបញ្ចប់។",
    generated: "ឯកសារ PDF ដែលបានបញ្ជាក់អាចមើលឡើងវិញបានរយៈពេល 30 ថ្ងៃចាប់ពីថ្ងៃដាក់ពាក្យ។",
  },
  zh: {
    notice: "申请详情可自申请日起查看 30 天。管理员确认处理完成后，申请数据和附件将在一年后删除。",
    generated: "第 8 步确认的 PDF 可自申请日起重新查看 30 天。",
  },
  ja: {
    notice: "申請詳細は申請日から30日間確認できます。管理者が処理完了を確認した時点から1年後に、申請データと添付ファイルが削除されます。",
    generated: "ステップ8で確定したPDFは、申請日から30日間再確認できます。",
  },
};
export const extraUi = Object.fromEntries(
  Object.keys(requiredValidationMessages).map(language => {
    const code = language as SupportedLanguage;
    return [code, {
      required: requiredValidationMessages[code],
      interview: interviewValidationMessages[code],
      benefit: benefitTranslations[code],
      retention: retentionPolicyCopy[code],
    }];
  }),
);
