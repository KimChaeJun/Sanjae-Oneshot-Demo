import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { extraUi } from "./locales/extraUi";
import { uiResources } from "./locales/uiResources";
import { demoTranslations } from './locales/demo';

export const supportedLanguages = ["ko", "en", "vi", "fil", "th", "km", "zh", "ja"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const languageOptions: Record<SupportedLanguage, { nativeName: string; languageCode: string; regionCode: string }> = {
  en: { nativeName: "English", languageCode: "en", regionCode: "US" },
  fil: { nativeName: "Filipino", languageCode: "fil", regionCode: "PH" },
  ja: { nativeName: "日本語", languageCode: "ja", regionCode: "JP" },
  km: { nativeName: "ខ្មែរ", languageCode: "km", regionCode: "KH" },
  ko: { nativeName: "한국어", languageCode: "ko", regionCode: "KR" },
  th: { nativeName: "ไทย", languageCode: "th", regionCode: "TH" },
  vi: { nativeName: "Tiếng Việt", languageCode: "vi", regionCode: "VN" },
  zh: { nativeName: "中文", languageCode: "zh", regionCode: "CN" },
};

function includeLanguageWord(languageName: string, locale: string) {
  switch (locale.split("-")[0]) {
    case "en": return `${languageName} language`;
    case "fil": return `Wikang ${languageName}`;
    case "th": return `ภาษา${languageName}`;
    case "km": return `ភាសា${languageName}`;
    default: return languageName;
  }
}

const khmerDisplayNames = {
  language: {
    ja: "ជប៉ុន",
    ko: "កូរ៉េ",
    zh: "ចិន",
  },
  region: {
    US: "សហរដ្ឋអាមេរិក",
    PH: "ហ្វ៊ីលីពីន",
    KH: "កម្ពុជា",
    TH: "ថៃ",
    VN: "វៀតណាម",
  },
} as const;

export function getLocalizedLanguageLabel(code: SupportedLanguage, locale?: string) {
  const option = languageOptions[code];
  const displayLocale = locale ?? "en";
  const baseLocale = displayLocale.split("-")[0];
  const showLanguageName = code === "ko" || code === "zh" || code === "ja";
  const displayType = showLanguageName ? "language" : "region";
  const displayCode = showLanguageName ? option.languageCode : option.regionCode;
  const khmerName = baseLocale !== "km"
    ? undefined
    : showLanguageName
      ? khmerDisplayNames.language[displayCode as keyof typeof khmerDisplayNames.language]
      : khmerDisplayNames.region[displayCode as keyof typeof khmerDisplayNames.region];
  let localizedName: string = khmerName ?? displayCode;
  if (!khmerName) {
    try {
      localizedName = new Intl.DisplayNames([displayLocale], { type: displayType }).of(displayCode)
        ?? displayCode;
    } catch {
      localizedName = new Intl.DisplayNames(["en"], { type: displayType }).of(displayCode)
        ?? displayCode;
    }
  }
  const parenthetical = showLanguageName
    ? includeLanguageWord(localizedName, displayLocale)
    : localizedName;
  return `${option.nativeName} (${parenthetical})`;
}

export function getSortedLanguageOptions(locale?: string) {
  const collator = new Intl.Collator(locale, { numeric: true, sensitivity: "base" });
  return supportedLanguages
    .map((code) => ({ code, label: getLocalizedLanguageLabel(code, locale) }))
    .sort((left, right) => collator.compare(left.label, right.label));
}

const resources = {
  ko: { translation: {
    witness: { title: "목격자 정보 연계", usage: "상태: {{status}} · 연계 {{count}}건 · 문서 반영: {{used}}", status: { present: "있음", none: "없음", unknown: "미확인", skipped: "건너뜀" }, usedYes: "예", usedNo: "아니요" },
    common: { brand: "산재원샷", notice: "근로복지공단 공식 서비스가 아닌 산재 신청 준비 지원 도구입니다.", myPage: "마이페이지", logout: "로그아웃", login: "로그인", menu: "메뉴", mainMenu: "주요 메뉴", language: "언어", applicationSteps: "신청 진행 단계", demoName: "김산재", profileMeta: "{{email}} · {{language}}", welcome: "환영합니다", mySanjae: "내 산재원샷", quickStartLabel: "빠른 시작", myPageLabel: "마이페이지", applicationsLabel: "신청 내역", extractedDataLabel: "추출 정보", aiCheckLabel: "AI 확인", applicationReadyLabel: "신청 준비 완료", stepLabel: "단계", footerService: "산업재해 신청 준비 지원 서비스", disclaimer: "본 서비스의 안내는 법률적 판단이나 산재 승인 결과를 보장하지 않습니다." },
    languages: { ko: "한국어", en: "English", vi: "Tiếng Việt", fil: "Filipino" },
    login: { eyebrow: "AI 기반 산재 신청 도우미", title1: "복잡한 산재 신청,", title2: "한 번에 준비하세요.", description: "사고 경위 입력부터 증빙 확인, 신청서 초안 생성까지 단계별로 안전하게 안내합니다.", ocrTitle: "문서 자동 인식", ocrDetail: "진단서와 증빙 자료에서 필요한 정보를 찾습니다.", checkTitle: "누락 항목 점검", checkDetail: "제출 전에 빠진 정보와 서류를 확인합니다.", packageTitle: "제출 패키지 생성", packageDetail: "확인한 서류를 한 번에 내려받을 수 있습니다.", prompt: "산재 신청 준비를 계속하려면 로그인해주세요.", signupPrompt: "계정을 만들고 신청 정보를 안전하게 보관하세요.", name: "성명", nameEn: "영문 성명(선택)", email: "이메일", password: "비밀번호", passwordRule: "8자 이상 입력해주세요.", remember: "로그인 유지", forgot: "비밀번호 찾기", or: "또는", demo: "간편인증서로 로그인", noAccount: "아직 계정이 없으신가요?", hasAccount: "이미 계정이 있으신가요?", signup: "회원가입", createAccount: "계정 만들기", processing: "처리 중…", authFailed: "인증 처리에 실패했습니다.", encryptedTitle: "개인정보·문서 애플리케이션 암호화", encryptedDetail: "입력한 민감정보와 업로드 문서는 서버에서 AES-256-GCM으로 암호화한 뒤 저장합니다." },
    dashboard: { greeting: "{{name}}님,", title: "산재 신청 준비를 시작해볼까요?", description: "입력하신 사실을 바탕으로 필요한 서류와 작성 순서를 안내해드립니다.", start: "새 신청 시작하기", readiness: "제출 준비도", readinessHelp: "새 신청을 시작하면 준비도를 단계별로 확인할 수 있어요.", active: "진행 중인 신청", ready: "준비 완료", duration: "예상 소요 시간", minutes: "약 15분", process: "신청은 이렇게 진행돼요", quickStart: "바로 시작", secureTitle: "입력 정보는 안전하게", secureDetail: "개인 서류는 비공개 저장소에 보관하고 본인 신청 건에만 접근하도록 설계했습니다.", profile: "내 정보 확인", summary: "신청 현황 요약", quick1Title: "기본·사고 정보 입력", quick1Detail: "신청인, 사업장, 사고 경위를 입력해요.", quick2Title: "증빙 서류 올리기", quick2Detail: "진단서와 보유한 자료를 업로드해요.", quick3Title: "AI 초안 확인", quick3Detail: "누락을 점검하고 문장을 직접 고쳐요.", quick4Title: "제출 자료 내려받기", quick4Detail: "확정한 내용을 ZIP 파일로 받아요." },
    mypage: { title: "마이페이지", description: "개인정보와 산재 신청 진행 상태를 관리합니다.", start: "새 신청 시작", edit: "정보 수정", applications: "내 신청 내역", empty: "아직 신청 내역이 없습니다.", emptyDetail: "새 신청을 시작하면 진행 상태가 여기에 표시됩니다.", security: "보안 및 로그인", notification: "알림 설정", privacy: "개인정보 처리 안내" },
    analysis: { types: { work_accident: "업무상 사고", occupational_disease: "업무상 질병", commute: "출퇴근 재해", unknown: "유형 확인 필요" }, benefits: { medical: "요양급여", leave: "휴업급여(요건 충족 시)" }, documents: { claim_form: { name: "요양급여 신청서", reason: "기본 신청 서류" }, medical: { name: "진단서 또는 의무기록", reason: "상병 및 치료 사실 확인" }, employment: { name: "재직·업무 확인 자료", reason: "업무 관련 사실 확인" } }, evidence: { workOrder: "작업지시서", siteMedia: "CCTV 또는 현장 사진", coworker: "동료 확인서" }, disclaimer: "자동 분석은 제출 준비를 돕기 위한 안내이며 산재 인정 여부를 판단하지 않습니다." },
    wizard: { progress: "신청 진행", dashboard: "대시보드", previous: "이전 단계", savedHint: "입력한 내용은 언제든 다시 수정할 수 있습니다.", confirm: "내용 확정하기", next: "저장하고 다음", missingForm: "생성된 서류 ID를 찾을 수 없습니다.", errors: { request: "요청 처리에 실패했습니다.", regenerate: "재생성에 실패했습니다.", download: "다운로드에 실패했습니다." }, form: { applicantTitle: "신청인 정보", applicantHelp: "신청하시는 분의 기본 정보입니다.", name: "성명", namePlaceholder: "홍길동", nameEn: "영문 성명", phone: "연락처", email: "이메일", address: "주소", addressPlaceholder: "현재 거주지 주소", workplaceTitle: "사업장 정보", workplaceHelp: "사고 당시 근무한 사업장 정보를 입력해주세요.", company: "사업장명", companyPlaceholder: "회사 또는 현장명", businessNo: "사업자등록번호", workplaceAddress: "사업장 주소", workplaceAddressPlaceholder: "사고 당시 근무 사업장 주소", occupation: "담당 업무", occupationPlaceholder: "예: 물류 상하차", position: "직책", positionPlaceholder: "예: 현장 직원" }, accident: { question: "어떤 유형에 가장 가까운가요?", help: "정확하지 않아도 괜찮습니다. 다음 단계에서 다시 분석합니다.", workTitle: "업무상 사고", workDetail: "작업 중 넘어짐, 끼임, 추락 등", diseaseTitle: "업무상 질병", diseaseDetail: "반복 작업이나 유해 요인으로 인한 질병", commuteTitle: "출퇴근 재해", commuteDetail: "통상적인 경로로 출퇴근 중 발생한 사고", date: "사고 날짜", time: "사고 시간", place: "사고 장소", placePlaceholder: "예: 2층 조립라인 포장 구역", task: "당시 하던 작업", taskPlaceholder: "예: 완성품 상자를 운반하고 있었습니다.", account: "사고 경위", accountPlaceholder: "무슨 일을 하다가, 어떤 상황에서, 어떻게 다쳤는지 기억나는 대로 적어주세요.", voice: "음성으로 입력", foreignTitle: "외국어로 입력해도 괜찮아요.", foreignHelp: "뜻을 바꾸지 않고 한국어 초안으로 정리하며, 원문도 함께 보관합니다." }, details: { uploadPrompt: "파일을 끌어놓거나 눌러서 선택하세요", formats: "PDF, JPG, PNG, WEBP · 파일당 최대 15MB", selectFiles: "파일 선택", selectedFiles: "선택한 파일", uploadReady: "{{count}}개 문서를 업로드할 준비가 되었습니다.", documentsOptional: "서류가 아직 없어도 다음 단계로 이동할 수 있어요.", documentsOptionalHelp: "나중에 마이페이지에서 추가할 수 있지만, 진단서가 있으면 더 정확한 안내를 받을 수 있습니다.", analysisLoading: "신청 유형과 필요 서류를 분석하고 있습니다.", recommendedType: "추천 신청 유형", analysisNotice: "입력 내용을 기준으로 한 안내이며 최종 인정 여부를 의미하지 않습니다.", requiredDocuments: "준비가 필요한 서류", requiredDocumentsHelp: "필수 여부와 필요한 이유를 확인하세요.", required: "필수", optional: "선택", expectedBenefits: "예상 급여", evidenceExamples: "추가 증빙 예시", ocrLoading: "문서 분석 작업을 준비하고 있습니다.", ocrStatus: "OCR 분석 상태", ocrCompleted: "문서 분석이 완료됐어요", ocrStarted: "문서 분석을 시작했어요", ocrHelp: "아래 정보가 맞는지 확인한 뒤 신청서에 반영합니다.", extractedData: "문서에서 찾은 정보", confidence: "평균 신뢰도 {{score}}%", ocrPending: "대기 중인 OCR 작업입니다. 완료 후 결과가 표시됩니다.", aiLoading: "확인된 사실을 바탕으로 신청서 초안을 생성하고 있습니다.", quality: "문서 완성도", aiNotice: "AI 초안은 참고용입니다. 사실과 다른 내용이 없는지 꼭 확인해주세요.", draft: "사고경위서 초안", preview: "미리보기", accidentAccount: "사고 경위", writtenDate: "작성일", applicantConfirm: "신청인 확인", reviewLoading: "생성된 문서의 누락과 모호한 표현을 확인하고 있습니다.", reviewResult: "AI 검토 결과", reviewNeeded: "확인이 필요한 항목이 있어요", reviewReady: "주요 항목이 모두 확인됐어요", reviewScore: "점수 {{score}}점 · 최종 판단과 제출 책임은 사용자에게 있습니다.", moreInfo: "추가 확인이 필요한 내용", moreInfoHelp: "답할 수 있는 항목만 보완해주세요.", factsConfirmed: "필수 사실관계가 모두 확인됐습니다.", factsConfirmedHelp: "다음 단계에서 문장을 직접 검토하고 수정하세요.", regenerate: "답변 반영해 다시 생성", editDirectly: "직접 수정하기", directEdit: "사고경위서 직접 수정", characters: "{{count}}자", editHelp: "사실과 다른 표현은 삭제하고, 확인할 수 있는 내용만 남겨주세요.", finalCheck: "마지막 확인", checkDatePlace: "사고 일시와 장소 확인", checkTask: "당시 작업 내용 확인", missingCount: "누락 항목 {{count}}개", userConfirmation: "사용자 최종 확인 필요", legal: "이 서비스는 문서 작성을 보조하며 법률 판단이나 승인 가능성을 제공하지 않습니다.", wait: "잠시만 기다려주세요.", completionTitle: "제출 준비가 완료됐어요.", completionHelp: "양식에 맞춘 PDF 3종을 ZIP으로 내려받을 수 있습니다.", package: "산재 신청 준비 패키지", packageContents: "요양급여 신청 정보서 PDF · 재해경위서 PDF · 제출 전 확인사항 PDF", zip: "PDF 3종 ZIP 파일", downloadPackage: "Downloads에 저장", chooseFolder: "저장 폴더 선택", nextGuide: "이제 무엇을 하면 되나요?", checkFiles: "다운로드 파일 확인", checkFilesHelp: "작성 내용과 빠진 첨부가 없는지 확인하세요.", officialRoute: "공식 제출 경로 확인", officialRouteHelp: "근로복지공단의 최신 접수 안내를 확인하세요.", keepOriginals: "원본 서류 보관", keepOriginalsHelp: "업로드한 진단서와 증빙 원본을 보관하세요.", backDashboard: "대시보드로 돌아가기" }, steps: {
      "0": { short: "사용 전 확인", detail: "중요한 정보 보호", title: "시작하기 전에 꼭 확인해주세요", description: "산재 신청에는 건강 정보와 중요한 서류가 포함됩니다. 내용을 읽고 동의해주세요." },
      "1": { short: "기본 정보", detail: "신청인·사업장", title: "기본 정보를 알려주세요", description: "신청인과 근무 사업장의 정보를 입력해주세요." },
      "2": { short: "사고 정보", detail: "사고 유형·경위", title: "사고 당시 상황을 알려주세요", description: "기억나는 사실을 편하게 적어주세요. 문장은 AI가 정리합니다." },
      "3": { short: "서류 올리기", detail: "진단서·확인 자료", title: "가지고 있는 서류를 올려주세요", description: "진단서나 병원 기록을 올리면 필요한 정보를 자동으로 찾습니다." },
      "4": { short: "필요 서류 확인", detail: "신청 종류·준비물", title: "무엇을 준비해야 하는지 확인해주세요", description: "입력한 내용을 바탕으로 신청 종류와 필요한 서류를 알려드립니다." },
      "5": { short: "서류 내용 확인", detail: "자동으로 읽은 정보", title: "서류에서 찾은 정보를 확인해주세요", description: "자동으로 읽은 내용이 맞는지 확인해야 신청서에 들어갑니다." },
      "6": { short: "초안 만들기", detail: "AI가 정리한 신청서", title: "AI가 신청서 초안을 만들었어요", description: "입력한 사실만으로 만들었습니다. 내용이 맞는지 꼭 확인해주세요." },
      "7": { short: "빠진 내용 확인", detail: "빠짐·불분명한 내용", title: "제출 전에 한 번 더 확인해요", description: "빠졌거나 분명하지 않은 내용을 확인하고 아는 만큼 보완해주세요." },
      "8": { short: "마지막 확인", detail: "고치기·내려받기", title: "마지막으로 내용을 확인하고 고쳐주세요", description: "문장을 직접 고친 뒤 제출 준비 파일을 내려받을 수 있습니다." }
    } }
  } },
  en: { translation: {
    witness: { title: "Witness data link", usage: "Status: {{status}} · {{count}} record(s) linked · Used in document: {{used}}", status: { present: "Present", none: "None", unknown: "Unknown", skipped: "Skipped" }, usedYes: "Yes", usedNo: "No" },
    common: { brand: "Sanjae Oneshot", notice: "An application-preparation tool, not an official Korea Workers' Compensation & Welfare Service.", myPage: "My page", logout: "Log out", login: "Log in", menu: "Menu", mainMenu: "Main menu", language: "Language", applicationSteps: "Application steps", demoName: "Kim Sanjae", profileMeta: "{{email}} · {{language}}", welcome: "Welcome", mySanjae: "My Sanjae", quickStartLabel: "Quick start", myPageLabel: "My page", applicationsLabel: "Applications", extractedDataLabel: "Extracted data", aiCheckLabel: "AI check", applicationReadyLabel: "Application ready", stepLabel: "Step", footerService: "Work injury claim preparation support", disclaimer: "This service does not provide legal decisions or guarantee claim approval." },
    languages: { ko: "한국어", en: "English", vi: "Tiếng Việt", fil: "Filipino" },
    login: { eyebrow: "AI work injury claim assistant", title1: "Prepare a complex claim", title2: "in one guided flow.", description: "We guide you from the accident account and evidence review to a draft application.", ocrTitle: "Document recognition", ocrDetail: "Find needed details in medical and evidence documents.", checkTitle: "Missing-item check", checkDetail: "Review missing information and documents before submission.", packageTitle: "Submission package", packageDetail: "Download confirmed materials together.", prompt: "Log in to continue preparing your claim.", signupPrompt: "Create an account to store your claim information securely.", name: "Name", nameEn: "English name (optional)", email: "Email", password: "Password", passwordRule: "Use at least 8 characters.", remember: "Keep me signed in", forgot: "Forgot password", or: "or", demo: "Log in with a simple certificate", noAccount: "No account yet?", hasAccount: "Already have an account?", signup: "Sign up", createAccount: "Create account", processing: "Processing…", authFailed: "Authentication failed.", encryptedTitle: "Application encryption for personal data and documents", encryptedDetail: "Sensitive entries and uploaded documents are encrypted with AES-256-GCM on the server before storage." },
    dashboard: { greeting: "{{name}},", title: "Ready to prepare your claim?", description: "We guide the documents and writing order based on the facts you enter.", start: "Start new claim", readiness: "Readiness", readinessHelp: "Start a claim to track readiness step by step.", active: "In progress", ready: "Ready", duration: "Estimated time", minutes: "About 15 min", process: "How the process works", quickStart: "Start now", secureTitle: "Your information stays protected", secureDetail: "Private documents are stored in a protected bucket and scoped to your own claim.", profile: "View my information", summary: "Claim status summary", quick1Title: "Enter basic and accident details", quick1Detail: "Add applicant, workplace, and accident facts.", quick2Title: "Upload evidence", quick2Detail: "Upload medical records and available evidence.", quick3Title: "Review the AI draft", quick3Detail: "Check missing items and edit the wording.", quick4Title: "Download submission files", quick4Detail: "Download confirmed content as a ZIP file." },
    mypage: { title: "My page", description: "Manage personal information and claim progress.", start: "Start new claim", edit: "Edit information", applications: "My claims", empty: "No claims yet.", emptyDetail: "Progress will appear here after you start a claim.", security: "Security and login", notification: "Notifications", privacy: "Privacy notice" },
    analysis: { types: { work_accident: "Work accident", occupational_disease: "Occupational disease", commute: "Commuting accident", unknown: "Claim type needs review" }, benefits: { medical: "Medical care benefits", leave: "Temporary disability benefits (if eligible)" }, documents: { claim_form: { name: "Medical care benefit application", reason: "Basic application form" }, medical: { name: "Medical certificate or medical record", reason: "Confirms the injury and treatment" }, employment: { name: "Employment and duty verification", reason: "Confirms the relationship to work" } }, evidence: { workOrder: "Work instructions", siteMedia: "CCTV or site photos", coworker: "Coworker statement" }, disclaimer: "This automated analysis supports preparation and does not decide whether the claim will be approved." },
    wizard: { progress: "Application progress", dashboard: "Dashboard", previous: "Previous", savedHint: "You can return and edit the information at any time.", confirm: "Confirm content", next: "Save and continue", missingForm: "The generated form ID is missing.", errors: { request: "The request could not be completed.", regenerate: "The draft could not be regenerated.", download: "The download failed." }, form: { applicantTitle: "Applicant information", applicantHelp: "Basic information about the person applying.", name: "Name", namePlaceholder: "Full name", nameEn: "Name in English", phone: "Phone", email: "Email", address: "Address", addressPlaceholder: "Current home address", workplaceTitle: "Workplace information", workplaceHelp: "Enter the workplace where you worked when the accident occurred.", company: "Workplace name", companyPlaceholder: "Company or site name", businessNo: "Business registration number", workplaceAddress: "Workplace address", workplaceAddressPlaceholder: "Address of the workplace at the time", occupation: "Main duties", occupationPlaceholder: "e.g. Loading and unloading", position: "Position", positionPlaceholder: "e.g. Site worker" }, accident: { question: "Which type is the closest match?", help: "It does not need to be exact. We will analyze it again in the next step.", workTitle: "Work accident", workDetail: "A fall, crush, or slip while working", diseaseTitle: "Occupational disease", diseaseDetail: "Illness caused by repetitive work or harmful exposure", commuteTitle: "Commuting accident", commuteDetail: "An accident on the usual route to or from work", date: "Accident date", time: "Accident time", place: "Accident place", placePlaceholder: "e.g. Packing area on the second floor", task: "Task at the time", taskPlaceholder: "e.g. I was moving finished-product boxes.", account: "What happened", accountPlaceholder: "Describe what you were doing, the situation, and how you were injured.", voice: "Voice input", foreignTitle: "You can write in your own language.", foreignHelp: "We keep the original and organize a Korean draft without changing its meaning." }, details: { uploadPrompt: "Drag files here or click to choose", formats: "PDF, JPG, PNG, WEBP · Up to 15 MB each", selectFiles: "Choose files", selectedFiles: "Selected files", uploadReady: "{{count}} document(s) ready to upload.", documentsOptional: "You can continue even if you do not have documents yet.", documentsOptionalHelp: "You can add them later from My page. A medical certificate enables more accurate guidance.", analysisLoading: "Analyzing the claim type and required documents.", recommendedType: "Recommended claim type", analysisNotice: "This guidance is based on your input and is not a final eligibility decision.", requiredDocuments: "Documents to prepare", requiredDocumentsHelp: "Review whether each item is required and why.", required: "Required", optional: "Optional", expectedBenefits: "Expected benefits", evidenceExamples: "Additional evidence examples", ocrLoading: "Preparing document analysis.", ocrStatus: "OCR status", ocrCompleted: "Document analysis is complete", ocrStarted: "Document analysis has started", ocrHelp: "Check the information below before using it in the application.", extractedData: "Information found in documents", confidence: "Average confidence {{score}}%", ocrPending: "OCR is pending. Results will appear when complete.", aiLoading: "Creating a draft from the confirmed facts.", quality: "Document quality", aiNotice: "The AI draft is for reference. Check carefully for anything that is not factual.", draft: "Accident statement draft", preview: "Preview", accidentAccount: "Accident account", writtenDate: "Date", applicantConfirm: "Applicant confirmation", reviewLoading: "Checking the generated document for missing or unclear wording.", reviewResult: "AI review result", reviewNeeded: "Some items need your review", reviewReady: "All key items are confirmed", reviewScore: "Score {{score}} · You remain responsible for the final decision and submission.", moreInfo: "More information needed", moreInfoHelp: "Complete only the items you can answer.", factsConfirmed: "All essential facts are confirmed.", factsConfirmedHelp: "Review and edit the wording in the next step.", regenerate: "Regenerate with answers", editDirectly: "Edit directly", directEdit: "Edit accident statement", characters: "{{count}} characters", editHelp: "Remove anything inaccurate and keep only information you can confirm.", finalCheck: "Final check", checkDatePlace: "Accident date and place checked", checkTask: "Task at the time checked", missingCount: "{{count}} missing item(s)", userConfirmation: "Final user confirmation required", legal: "This service assists document writing and does not provide legal judgment or approval probability.", wait: "Please wait a moment.", completionTitle: "Your preparation package is ready.", completionHelp: "Download the confirmed application information and guidance files together.", package: "Work injury claim preparation package", packageContents: "Application JSON · Accident statement · Submission guide", zip: "ZIP file", downloadPackage: "Download package", nextGuide: "What should I do next?", checkFiles: "Review downloaded files", checkFilesHelp: "Check the written content and any missing attachments.", officialRoute: "Check the official submission route", officialRouteHelp: "Review the latest submission guidance from COMWEL.", keepOriginals: "Keep original documents", keepOriginalsHelp: "Keep the original medical certificates and evidence you uploaded.", backDashboard: "Back to dashboard" }, steps: {
      "0": { short: "Terms consent", detail: "Privacy · sensitive data", title: "Required consent before starting", description: "A work-injury claim includes health information and supporting documents. Review and accept the items below." },
      "1": { short: "Basic details", detail: "Applicant · workplace", title: "Tell us the basic details", description: "Enter information about the applicant and workplace." }, "2": { short: "Accident", detail: "Type · account", title: "Tell us what happened", description: "Write the facts you remember. AI will organize the wording." }, "3": { short: "Documents", detail: "Medical · evidence", title: "Upload documents you have", description: "We can find useful details in medical records and certificates." }, "4": { short: "Analysis", detail: "Type · requirements", title: "Review preparation items", description: "See the likely claim type and documents based on your input." }, "5": { short: "OCR review", detail: "Extracted data", title: "Review extracted document data", description: "Confirm OCR values before using them in the application." }, "6": { short: "Generate", detail: "AI draft", title: "Your AI draft is ready", description: "It uses entered facts only and requires your review." }, "7": { short: "AI review", detail: "Missing · unclear", title: "Check once more before submission", description: "Review missing or unclear items and add what you can." }, "8": { short: "Final edit", detail: "Confirm · download", title: "Review and edit the final text", description: "Edit the wording and download the preparation package." }
    } }
  } },
  vi: { translation: {
    witness: { title: "Liên kết dữ liệu nhân chứng", usage: "Trạng thái: {{status}} · Đã liên kết {{count}} bản ghi · Dùng trong tài liệu: {{used}}", status: { present: "Có", none: "Không có", unknown: "Chưa xác định", skipped: "Đã bỏ qua" }, usedYes: "Có", usedNo: "Không" },
    common: { brand: "Sanjae Oneshot", notice: "Công cụ hỗ trợ chuẩn bị hồ sơ, không phải dịch vụ chính thức của COMWEL.", myPage: "Trang cá nhân", logout: "Đăng xuất", login: "Đăng nhập", menu: "Menu", mainMenu: "Menu chính", language: "Ngôn ngữ", applicationSteps: "Các bước làm hồ sơ", demoName: "Kim Sanjae", profileMeta: "{{email}} · {{language}}", welcome: "Chào mừng", mySanjae: "Hồ sơ của tôi", quickStartLabel: "Bắt đầu nhanh", myPageLabel: "Trang cá nhân", applicationsLabel: "Hồ sơ", extractedDataLabel: "Dữ liệu trích xuất", aiCheckLabel: "AI kiểm tra", applicationReadyLabel: "Hồ sơ đã sẵn sàng", stepLabel: "Bước", footerService: "Hỗ trợ chuẩn bị hồ sơ tai nạn lao động", disclaimer: "Dịch vụ không đưa ra phán quyết pháp lý hoặc bảo đảm hồ sơ được chấp thuận." },
    languages: { ko: "한국어", en: "English", vi: "Tiếng Việt", fil: "Filipino" },
    login: { eyebrow: "Trợ lý AI cho hồ sơ tai nạn lao động", title1: "Hồ sơ phức tạp,", title2: "chuẩn bị trong một quy trình.", description: "Hướng dẫn từ khai báo tai nạn, kiểm tra chứng cứ đến tạo bản nháp.", ocrTitle: "Nhận dạng tài liệu", ocrDetail: "Tìm thông tin cần thiết trong giấy tờ y tế và chứng cứ.", checkTitle: "Kiểm tra thiếu sót", checkDetail: "Kiểm tra thông tin và giấy tờ còn thiếu.", packageTitle: "Gói nộp hồ sơ", packageDetail: "Tải các tài liệu đã xác nhận cùng lúc.", prompt: "Đăng nhập để tiếp tục chuẩn bị hồ sơ.", signupPrompt: "Tạo tài khoản để lưu hồ sơ của bạn một cách an toàn.", name: "Họ và tên", nameEn: "Tên tiếng Anh (không bắt buộc)", email: "Email", password: "Mật khẩu", passwordRule: "Nhập ít nhất 8 ký tự.", remember: "Duy trì đăng nhập", forgot: "Quên mật khẩu", or: "hoặc", demo: "Đăng nhập bằng chứng thư đơn giản", noAccount: "Chưa có tài khoản?", hasAccount: "Đã có tài khoản?", signup: "Đăng ký", createAccount: "Tạo tài khoản", processing: "Đang xử lý…", authFailed: "Xác thực không thành công.", encryptedTitle: "Mã hóa ứng dụng cho dữ liệu cá nhân và tài liệu", encryptedDetail: "Thông tin nhạy cảm và tài liệu tải lên được máy chủ mã hóa AES-256-GCM trước khi lưu." },
    dashboard: { greeting: "{{name}},", title: "Bắt đầu chuẩn bị hồ sơ nhé?", description: "Chúng tôi hướng dẫn giấy tờ và thứ tự viết dựa trên thông tin bạn nhập.", start: "Tạo hồ sơ mới", readiness: "Mức sẵn sàng", readinessHelp: "Bắt đầu để theo dõi tiến độ từng bước.", active: "Đang thực hiện", ready: "Đã sẵn sàng", duration: "Thời gian dự kiến", minutes: "Khoảng 15 phút", process: "Quy trình thực hiện", quickStart: "Bắt đầu", secureTitle: "Thông tin được bảo vệ", secureDetail: "Tài liệu được lưu riêng tư và chỉ tài khoản của bạn có thể truy cập.", profile: "Xem thông tin", summary: "Tóm tắt trạng thái hồ sơ", quick1Title: "Nhập thông tin cơ bản và tai nạn", quick1Detail: "Nhập người nộp, nơi làm việc và diễn biến tai nạn.", quick2Title: "Tải lên chứng cứ", quick2Detail: "Tải hồ sơ y tế và tài liệu hiện có.", quick3Title: "Kiểm tra bản nháp AI", quick3Detail: "Kiểm tra mục thiếu và tự sửa câu chữ.", quick4Title: "Tải tài liệu nộp", quick4Detail: "Nhận nội dung đã xác nhận dưới dạng ZIP." },
    mypage: { title: "Trang cá nhân", description: "Quản lý thông tin cá nhân và tiến độ hồ sơ.", start: "Tạo hồ sơ mới", edit: "Sửa thông tin", applications: "Hồ sơ của tôi", empty: "Chưa có hồ sơ.", emptyDetail: "Tiến độ sẽ hiển thị tại đây sau khi bắt đầu.", security: "Bảo mật và đăng nhập", notification: "Thông báo", privacy: "Thông tin quyền riêng tư" },
    analysis: { types: { work_accident: "Tai nạn lao động", occupational_disease: "Bệnh nghề nghiệp", commute: "Tai nạn trên đường đi làm", unknown: "Cần kiểm tra loại hồ sơ" }, benefits: { medical: "Trợ cấp điều trị", leave: "Trợ cấp nghỉ việc (nếu đủ điều kiện)" }, documents: { claim_form: { name: "Đơn đề nghị trợ cấp điều trị", reason: "Đơn cơ bản để nộp hồ sơ" }, medical: { name: "Giấy chẩn đoán hoặc hồ sơ y tế", reason: "Xác nhận thương tích và việc điều trị" }, employment: { name: "Tài liệu xác nhận việc làm và nhiệm vụ", reason: "Xác nhận mối liên hệ với công việc" } }, evidence: { workOrder: "Phiếu giao việc", siteMedia: "CCTV hoặc ảnh hiện trường", coworker: "Xác nhận của đồng nghiệp" }, disclaimer: "Phân tích tự động chỉ hỗ trợ chuẩn bị hồ sơ và không quyết định hồ sơ có được công nhận hay không." },
    wizard: { progress: "Tiến độ hồ sơ", dashboard: "Bảng điều khiển", previous: "Bước trước", savedHint: "Bạn có thể quay lại sửa thông tin bất cứ lúc nào.", confirm: "Xác nhận nội dung", next: "Lưu và tiếp tục", missingForm: "Không tìm thấy mã biểu mẫu đã tạo.", errors: { request: "Không thể xử lý yêu cầu.", regenerate: "Không thể tạo lại bản nháp.", download: "Tải xuống không thành công." }, form: { applicantTitle: "Thông tin người nộp", applicantHelp: "Thông tin cơ bản của người làm hồ sơ.", name: "Họ và tên", namePlaceholder: "Họ và tên đầy đủ", nameEn: "Tên tiếng Anh", phone: "Số điện thoại", email: "Email", address: "Địa chỉ", addressPlaceholder: "Địa chỉ đang cư trú", workplaceTitle: "Thông tin nơi làm việc", workplaceHelp: "Nhập nơi bạn làm việc khi tai nạn xảy ra.", company: "Tên nơi làm việc", companyPlaceholder: "Tên công ty hoặc công trường", businessNo: "Mã số đăng ký kinh doanh", workplaceAddress: "Địa chỉ nơi làm việc", workplaceAddressPlaceholder: "Địa chỉ nơi làm việc khi xảy ra tai nạn", occupation: "Công việc phụ trách", occupationPlaceholder: "Ví dụ: Bốc xếp hàng hóa", position: "Chức vụ", positionPlaceholder: "Ví dụ: Nhân viên hiện trường" }, accident: { question: "Loại nào gần đúng nhất?", help: "Không cần hoàn toàn chính xác. Hệ thống sẽ phân tích lại ở bước tiếp theo.", workTitle: "Tai nạn lao động", workDetail: "Trượt, kẹt hoặc ngã khi đang làm việc", diseaseTitle: "Bệnh nghề nghiệp", diseaseDetail: "Bệnh do công việc lặp lại hoặc yếu tố có hại", commuteTitle: "Tai nạn đi làm", commuteDetail: "Tai nạn trên tuyến đường đi làm hoặc về nhà thông thường", date: "Ngày xảy ra", time: "Thời gian", place: "Địa điểm", placePlaceholder: "Ví dụ: Khu đóng gói tầng 2", task: "Công việc lúc đó", taskPlaceholder: "Ví dụ: Tôi đang vận chuyển thùng thành phẩm.", account: "Diễn biến tai nạn", accountPlaceholder: "Hãy mô tả bạn đang làm gì, trong tình huống nào và bị thương ra sao.", voice: "Nhập bằng giọng nói", foreignTitle: "Bạn có thể nhập bằng ngôn ngữ của mình.", foreignHelp: "Hệ thống giữ nguyên bản gốc và tạo bản nháp tiếng Hàn mà không đổi ý nghĩa." }, details: { uploadPrompt: "Kéo thả tệp hoặc nhấn để chọn", formats: "PDF, JPG, PNG, WEBP · Tối đa 15 MB mỗi tệp", selectFiles: "Chọn tệp", selectedFiles: "Tệp đã chọn", uploadReady: "{{count}} tài liệu đã sẵn sàng tải lên.", documentsOptional: "Bạn có thể tiếp tục dù chưa có tài liệu.", documentsOptionalHelp: "Có thể thêm sau trong Trang cá nhân; giấy chứng nhận y tế giúp hướng dẫn chính xác hơn.", analysisLoading: "Đang phân tích loại hồ sơ và tài liệu cần thiết.", recommendedType: "Loại hồ sơ đề xuất", analysisNotice: "Hướng dẫn dựa trên thông tin đã nhập, không phải quyết định công nhận cuối cùng.", requiredDocuments: "Tài liệu cần chuẩn bị", requiredDocumentsHelp: "Kiểm tra tài liệu bắt buộc và lý do cần thiết.", required: "Bắt buộc", optional: "Tùy chọn", expectedBenefits: "Quyền lợi dự kiến", evidenceExamples: "Ví dụ chứng cứ bổ sung", ocrLoading: "Đang chuẩn bị phân tích tài liệu.", ocrStatus: "Trạng thái OCR", ocrCompleted: "Đã phân tích xong tài liệu", ocrStarted: "Đã bắt đầu phân tích tài liệu", ocrHelp: "Kiểm tra thông tin dưới đây trước khi đưa vào đơn.", extractedData: "Thông tin tìm thấy trong tài liệu", confidence: "Độ tin cậy trung bình {{score}}%", ocrPending: "OCR đang chờ xử lý. Kết quả sẽ hiển thị khi hoàn tất.", aiLoading: "Đang tạo bản nháp từ các dữ kiện đã xác nhận.", quality: "Độ hoàn thiện tài liệu", aiNotice: "Bản nháp AI chỉ để tham khảo. Hãy kiểm tra kỹ mọi nội dung không đúng sự thật.", draft: "Bản nháp diễn biến tai nạn", preview: "Xem trước", accidentAccount: "Diễn biến tai nạn", writtenDate: "Ngày viết", applicantConfirm: "Người nộp xác nhận", reviewLoading: "Đang kiểm tra nội dung thiếu hoặc chưa rõ.", reviewResult: "Kết quả AI kiểm tra", reviewNeeded: "Có mục cần bạn kiểm tra", reviewReady: "Đã xác nhận các mục chính", reviewScore: "Điểm {{score}} · Người dùng chịu trách nhiệm về quyết định và việc nộp cuối cùng.", moreInfo: "Cần xác nhận thêm", moreInfoHelp: "Chỉ bổ sung những mục bạn có thể trả lời.", factsConfirmed: "Đã xác nhận tất cả dữ kiện thiết yếu.", factsConfirmedHelp: "Kiểm tra và sửa câu chữ ở bước tiếp theo.", regenerate: "Tạo lại với câu trả lời", editDirectly: "Tự chỉnh sửa", directEdit: "Sửa diễn biến tai nạn", characters: "{{count}} ký tự", editHelp: "Xóa nội dung không đúng và chỉ giữ thông tin có thể xác nhận.", finalCheck: "Kiểm tra cuối", checkDatePlace: "Đã kiểm tra ngày và địa điểm", checkTask: "Đã kiểm tra công việc lúc đó", missingCount: "{{count}} mục còn thiếu", userConfirmation: "Cần người dùng xác nhận cuối", legal: "Dịch vụ hỗ trợ soạn tài liệu, không đưa ra phán quyết pháp lý hay khả năng được chấp thuận.", wait: "Vui lòng chờ một chút.", completionTitle: "Gói chuẩn bị hồ sơ đã sẵn sàng.", completionHelp: "Tải cùng lúc thông tin đã xác nhận và các tệp hướng dẫn.", package: "Gói chuẩn bị hồ sơ tai nạn lao động", packageContents: "JSON hồ sơ · Diễn biến tai nạn · Hướng dẫn nộp", zip: "Tệp ZIP", downloadPackage: "Tải gói hồ sơ", nextGuide: "Tiếp theo cần làm gì?", checkFiles: "Kiểm tra tệp đã tải", checkFilesHelp: "Kiểm tra nội dung và các tệp đính kèm còn thiếu.", officialRoute: "Kiểm tra kênh nộp chính thức", officialRouteHelp: "Xem hướng dẫn nộp mới nhất của COMWEL.", keepOriginals: "Giữ tài liệu gốc", keepOriginalsHelp: "Giữ bản gốc giấy chứng nhận y tế và chứng cứ đã tải lên.", backDashboard: "Quay lại bảng điều khiển" }, steps: {
      "0": { short: "Đồng ý điều khoản", detail: "Riêng tư · dữ liệu nhạy cảm", title: "Đồng ý bắt buộc trước khi bắt đầu", description: "Hồ sơ tai nạn lao động có thông tin sức khỏe và tài liệu chứng minh. Hãy kiểm tra rồi đồng ý các mục dưới đây." },
      "1": { short: "Thông tin cơ bản", detail: "Người nộp · nơi làm", title: "Cho biết thông tin cơ bản", description: "Nhập thông tin người nộp và nơi làm việc." }, "2": { short: "Tai nạn", detail: "Loại · diễn biến", title: "Cho biết tai nạn đã xảy ra", description: "Ghi các sự kiện bạn nhớ; AI sẽ sắp xếp câu chữ." }, "3": { short: "Tài liệu", detail: "Y tế · chứng cứ", title: "Tải lên tài liệu hiện có", description: "Hệ thống tìm thông tin trong giấy chứng nhận và hồ sơ y tế." }, "4": { short: "Phân tích", detail: "Loại · yêu cầu", title: "Kiểm tra mục cần chuẩn bị", description: "Xem loại hồ sơ và giấy tờ dự kiến từ thông tin đã nhập." }, "5": { short: "Kiểm tra OCR", detail: "Dữ liệu trích xuất", title: "Kiểm tra dữ liệu từ tài liệu", description: "Xác nhận giá trị OCR trước khi đưa vào đơn." }, "6": { short: "Tạo biểu mẫu", detail: "Bản nháp AI", title: "Bản nháp AI đã sẵn sàng", description: "Bản nháp chỉ dựa trên dữ kiện đã nhập và cần bạn kiểm tra." }, "7": { short: "AI kiểm tra", detail: "Thiếu · chưa rõ", title: "Kiểm tra lại trước khi nộp", description: "Xem các mục thiếu hoặc chưa rõ và bổ sung nếu có thể." }, "8": { short: "Sửa cuối", detail: "Xác nhận · tải", title: "Kiểm tra và sửa nội dung cuối", description: "Sửa câu chữ và tải gói chuẩn bị hồ sơ." }
    } }
  } },
  fil: { translation: {
    witness: { title: "Koneksyon ng witness data", usage: "Status: {{status}} · {{count}} record ang nakakonekta · Ginamit sa dokumento: {{used}}", status: { present: "Mayroon", none: "Wala", unknown: "Hindi pa alam", skipped: "Nilaktawan" }, usedYes: "Oo", usedNo: "Hindi" },
    common: { brand: "Sanjae Oneshot", notice: "Tool ito sa paghahanda at hindi opisyal na serbisyo ng COMWEL.", myPage: "Aking pahina", logout: "Mag-log out", login: "Mag-log in", menu: "Menu", mainMenu: "Pangunahing menu", language: "Wika", applicationSteps: "Mga hakbang ng aplikasyon", demoName: "Kim Sanjae", profileMeta: "{{email}} · {{language}}", welcome: "Maligayang pagdating", mySanjae: "Aking Sanjae", quickStartLabel: "Mabilis na pagsisimula", myPageLabel: "Aking pahina", applicationsLabel: "Mga aplikasyon", extractedDataLabel: "Nakuha na data", aiCheckLabel: "AI check", applicationReadyLabel: "Handa na ang aplikasyon", stepLabel: "Hakbang", footerService: "Tulong sa paghahanda ng work injury claim", disclaimer: "Hindi ito legal na pasya at hindi ginagarantiya ang pag-apruba ng claim." },
    languages: { ko: "한국어", en: "English", vi: "Tiếng Việt", fil: "Filipino" },
    login: { eyebrow: "AI assistant para sa work injury claim", title1: "Ihanda ang komplikadong claim", title2: "sa isang gabay na proseso.", description: "Gabay mula sa salaysay at ebidensya hanggang sa draft ng aplikasyon.", ocrTitle: "Pagkilala sa dokumento", ocrDetail: "Hanapin ang kailangang detalye sa medical at evidence documents.", checkTitle: "Suriin ang kulang", checkDetail: "Tingnan ang kulang na impormasyon at dokumento.", packageTitle: "Submission package", packageDetail: "I-download nang sabay ang nakumpirmang files.", prompt: "Mag-log in para ipagpatuloy ang claim.", signupPrompt: "Gumawa ng account para ligtas na mai-save ang claim.", name: "Pangalan", nameEn: "Pangalan sa English (opsyonal)", email: "Email", password: "Password", passwordRule: "Gumamit ng hindi bababa sa 8 character.", remember: "Panatilihing naka-log in", forgot: "Nakalimutan ang password", or: "o", demo: "Mag-login gamit ang simpleng certificate", noAccount: "Wala pang account?", hasAccount: "May account na?", signup: "Mag-sign up", createAccount: "Gumawa ng account", processing: "Pinoproseso…", authFailed: "Hindi nagtagumpay ang authentication.", encryptedTitle: "Application encryption para sa personal data at dokumento", encryptedDetail: "Ini-encrypt ng server gamit ang AES-256-GCM ang sensitibong impormasyon at uploads bago i-save." },
    dashboard: { greeting: "{{name}},", title: "Simulan na ba ang paghahanda?", description: "Gagabayan ka sa mga dokumento at pagkakasunod ayon sa facts na ilalagay mo.", start: "Bagong claim", readiness: "Kahandaan", readinessHelp: "Simulan ang claim para masubaybayan bawat hakbang.", active: "Ginagawa", ready: "Handa", duration: "Tinatayang oras", minutes: "Mga 15 minuto", process: "Paano ginagawa", quickStart: "Simulan", secureTitle: "Protektado ang impormasyon", secureDetail: "Pribado ang mga dokumento at para lamang sa sarili mong claim.", profile: "Tingnan ang impormasyon", summary: "Buod ng status ng claim", quick1Title: "Ilagay ang basic at accident details", quick1Detail: "Ilagay ang aplikante, workplace, at nangyari.", quick2Title: "Mag-upload ng ebidensya", quick2Detail: "I-upload ang medical records at ibang ebidensya.", quick3Title: "Suriin ang AI draft", quick3Detail: "Tingnan ang kulang at i-edit ang mga pangungusap.", quick4Title: "I-download ang submission files", quick4Detail: "Kunin ang nakumpirmang nilalaman bilang ZIP." },
    mypage: { title: "Aking pahina", description: "Pamahalaan ang personal na impormasyon at progreso.", start: "Bagong claim", edit: "I-edit", applications: "Aking claims", empty: "Wala pang claim.", emptyDetail: "Makikita rito ang progreso kapag nagsimula ka.", security: "Security at login", notification: "Notifications", privacy: "Privacy notice" },
    analysis: { types: { work_accident: "Aksidente sa trabaho", occupational_disease: "Sakit dahil sa trabaho", commute: "Aksidente sa pagbiyahe", unknown: "Kailangang suriin ang uri ng claim" }, benefits: { medical: "Medical care benefits", leave: "Temporary disability benefits (kung kwalipikado)" }, documents: { claim_form: { name: "Aplikasyon para sa medical care benefit", reason: "Pangunahing application form" }, medical: { name: "Medical certificate o medical record", reason: "Nagpapatunay sa pinsala at paggamot" }, employment: { name: "Patunay ng trabaho at tungkulin", reason: "Nagpapatunay sa kaugnayan sa trabaho" } }, evidence: { workOrder: "Work instructions", siteMedia: "CCTV o mga larawan ng lugar", coworker: "Pahayag ng katrabaho" }, disclaimer: "Ang awtomatikong pagsusuri ay gabay lamang sa paghahanda at hindi nagpapasya kung maaaprubahan ang claim." },
    wizard: { progress: "Progreso ng aplikasyon", dashboard: "Dashboard", previous: "Nakaraang hakbang", savedHint: "Maaari mong balikan at baguhin ang impormasyon anumang oras.", confirm: "Kumpirmahin", next: "I-save at magpatuloy", missingForm: "Hindi makita ang ID ng generated form.", errors: { request: "Hindi nakumpleto ang request.", regenerate: "Hindi nagawang buuin muli ang draft.", download: "Hindi na-download ang file." }, form: { applicantTitle: "Impormasyon ng aplikante", applicantHelp: "Pangunahing impormasyon ng naghahain ng claim.", name: "Pangalan", namePlaceholder: "Buong pangalan", nameEn: "Pangalan sa English", phone: "Telepono", email: "Email", address: "Address", addressPlaceholder: "Kasalukuyang tirahan", workplaceTitle: "Impormasyon ng workplace", workplaceHelp: "Ilagay ang workplace noong mangyari ang aksidente.", company: "Pangalan ng workplace", companyPlaceholder: "Kumpanya o site", businessNo: "Business registration number", workplaceAddress: "Address ng workplace", workplaceAddressPlaceholder: "Address ng workplace noong aksidente", occupation: "Pangunahing gawain", occupationPlaceholder: "Hal. Pagkarga at pagbaba", position: "Posisyon", positionPlaceholder: "Hal. Site worker" }, accident: { question: "Aling uri ang pinakamalapit?", help: "Hindi kailangang eksakto. Susuriin itong muli sa susunod na hakbang.", workTitle: "Aksidente sa trabaho", workDetail: "Pagkadulas, pagkaipit, o pagkahulog habang nagtatrabaho", diseaseTitle: "Sakit dahil sa trabaho", diseaseDetail: "Sakit mula sa paulit-ulit na gawain o mapanganib na exposure", commuteTitle: "Aksidente sa pagbiyahe", commuteDetail: "Aksidente sa karaniwang ruta papunta o pauwi sa trabaho", date: "Petsa ng aksidente", time: "Oras", place: "Lugar", placePlaceholder: "Hal. Packing area sa ikalawang palapag", task: "Ginagawa noong oras na iyon", taskPlaceholder: "Hal. Naglilipat ako ng mga kahon.", account: "Nangyari sa aksidente", accountPlaceholder: "Ilarawan ang ginagawa mo, ang sitwasyon, at kung paano ka nasaktan.", voice: "Voice input", foreignTitle: "Maaari kang sumulat sa sarili mong wika.", foreignHelp: "Itatago ang orihinal at gagawa ng Korean draft nang hindi binabago ang kahulugan." }, details: { uploadPrompt: "I-drag ang files dito o i-click para pumili", formats: "PDF, JPG, PNG, WEBP · Hanggang 15 MB bawat file", selectFiles: "Pumili ng files", selectedFiles: "Napiling files", uploadReady: "{{count}} dokumento ang handang i-upload.", documentsOptional: "Maaari kang magpatuloy kahit wala pang dokumento.", documentsOptionalHelp: "Maaari itong idagdag sa My page; mas tumpak ang gabay kung may medical certificate.", analysisLoading: "Sinusuri ang uri ng claim at kailangang dokumento.", recommendedType: "Inirerekomendang uri ng claim", analysisNotice: "Batay ito sa inilagay mo at hindi pinal na desisyon sa eligibility.", requiredDocuments: "Mga dokumentong ihahanda", requiredDocumentsHelp: "Tingnan kung alin ang required at bakit kailangan.", required: "Required", optional: "Optional", expectedBenefits: "Inaasahang benepisyo", evidenceExamples: "Halimbawa ng dagdag na ebidensya", ocrLoading: "Inihahanda ang document analysis.", ocrStatus: "Status ng OCR", ocrCompleted: "Tapos na ang document analysis", ocrStarted: "Nagsimula na ang document analysis", ocrHelp: "Suriin ang impormasyon bago ito gamitin sa aplikasyon.", extractedData: "Impormasyong nakita sa dokumento", confidence: "Average confidence {{score}}%", ocrPending: "Nakahintay ang OCR. Lalabas ang resulta kapag tapos na.", aiLoading: "Gumagawa ng draft mula sa nakumpirmang facts.", quality: "Kalidad ng dokumento", aiNotice: "Reference lamang ang AI draft. Suriing mabuti kung may hindi totoong nilalaman.", draft: "Draft ng accident statement", preview: "Preview", accidentAccount: "Salaysay ng aksidente", writtenDate: "Petsa", applicantConfirm: "Kumpirmasyon ng aplikante", reviewLoading: "Sinusuri ang kulang o malabong pananalita.", reviewResult: "Resulta ng AI review", reviewNeeded: "May mga item na kailangang suriin", reviewReady: "Nakumpirma ang mahahalagang item", reviewScore: "Score {{score}} · Pananagutan ng user ang pinal na desisyon at submission.", moreInfo: "Kailangan ng dagdag na impormasyon", moreInfoHelp: "Sagutan lamang ang kaya mong kumpirmahin.", factsConfirmed: "Nakumpirma ang lahat ng pangunahing facts.", factsConfirmedHelp: "Suriin at i-edit ang wording sa susunod na hakbang.", regenerate: "Bumuo muli gamit ang sagot", editDirectly: "Direktang i-edit", directEdit: "I-edit ang accident statement", characters: "{{count}} character", editHelp: "Alisin ang hindi tama at iwan lamang ang makukumpirma.", finalCheck: "Huling pagsusuri", checkDatePlace: "Nasuri ang petsa at lugar", checkTask: "Nasuri ang ginagawang trabaho", missingCount: "{{count}} kulang na item", userConfirmation: "Kailangan ang pinal na kumpirmasyon", legal: "Tumutulong ang serbisyo sa pagsulat at hindi nagbibigay ng legal na pasya o tsansa ng approval.", wait: "Sandali lamang.", completionTitle: "Handa na ang preparation package.", completionHelp: "I-download nang sabay ang nakumpirmang impormasyon at guide files.", package: "Work injury claim preparation package", packageContents: "Application JSON · Accident statement · Submission guide", zip: "ZIP file", downloadPackage: "I-download ang package", nextGuide: "Ano ang susunod na gagawin?", checkFiles: "Suriin ang downloaded files", checkFilesHelp: "Tingnan ang nilalaman at mga kulang na attachment.", officialRoute: "Suriin ang opisyal na submission route", officialRouteHelp: "Tingnan ang pinakabagong submission guide ng COMWEL.", keepOriginals: "Itago ang original documents", keepOriginalsHelp: "Itago ang original medical certificates at ebidensyang in-upload.", backDashboard: "Bumalik sa dashboard" }, steps: {
      "0": { short: "Pahintulot", detail: "Privacy · sensitibong data", title: "Kinakailangang pahintulot bago magsimula", description: "May health information at supporting documents ang claim. Basahin at tanggapin ang mga item sa ibaba." },
      "1": { short: "Pangunahing detalye", detail: "Aplikante · trabaho", title: "Ilagay ang pangunahing detalye", description: "Ilagay ang impormasyon ng aplikante at lugar ng trabaho." }, "2": { short: "Aksidente", detail: "Uri · salaysay", title: "Ikuwento ang nangyari", description: "Isulat ang facts na naaalala mo; aayusin ng AI ang pananalita." }, "3": { short: "Dokumento", detail: "Medical · ebidensya", title: "I-upload ang mga dokumento", description: "Hahanapin ang mahalagang detalye sa medical records at certificates." }, "4": { short: "Pagsusuri", detail: "Uri · kailangan", title: "Suriin ang ihahanda", description: "Tingnan ang posibleng uri at kailangang dokumento." }, "5": { short: "OCR review", detail: "Nakuha na data", title: "Suriin ang data mula sa dokumento", description: "Kumpirmahin ang OCR values bago ilagay sa aplikasyon." }, "6": { short: "Gumawa", detail: "AI draft", title: "Handa na ang AI draft", description: "Facts na inilagay mo lamang ang ginamit at kailangan mong suriin." }, "7": { short: "AI review", detail: "Kulang · malabo", title: "Suriin muli bago isumite", description: "Tingnan ang kulang o malabong items at dagdagan kung kaya." }, "8": { short: "Huling edit", detail: "Kumpirma · download", title: "Suriin at i-edit ang huling text", description: "Baguhin ang wording at i-download ang preparation package." }
    } }
  } },
} as const;

Object.assign(resources.ko.translation.common, {
  largeText: "쉬운 화면",
  largeTextEnable: "글자를 키우고 쉬운 말로 보기",
  largeTextDisable: "원래 화면으로 돌아가기",
  uiChangeTitle: "화면을 바꿀까요?",
  uiChangeToSenior: "글자를 키우고 어려운 말을 쉽게 바꿉니다.\n지금까지 입력한 내용은 그대로 남습니다.",
  uiChangeToDefault: "원래 화면으로 돌아갑니다.\n지금까지 입력한 내용은 그대로 남습니다.",
  uiChangeCancel: "취소",
  uiChangeConfirm: "변경하기",
  session: "세션",
  sessionActive: "활동 중",
  sessionCountdown: "비활성",
  sessionRemaining: "로그인 유지 시간 {{time}}",
  sessionPaused: "사용자 활동이 감지되었습니다. 1분간 활동이 없으면 60분 카운트다운이 시작됩니다.",
});
Object.assign(resources.en.translation.common, {
  largeText: "Large text",
  largeTextEnable: "Switch to the senior-friendly UI",
  largeTextDisable: "Switch to the default UI",
  uiChangeTitle: "Would you like to change the UI?",
  uiChangeToSenior: "The whole screen will switch to the senior-friendly UI. Your entries will be kept.",
  uiChangeToDefault: "The screen will return to the default UI. Your entries will be kept.",
  uiChangeCancel: "Cancel",
  uiChangeConfirm: "Change UI",
  session: "Session",
  sessionActive: "Active",
  sessionCountdown: "Inactive",
  sessionRemaining: "Session time remaining: {{time}}",
  sessionPaused: "Activity detected. The 60-minute countdown starts after one minute of inactivity.",
});
Object.assign(resources.vi.translation.common, {
  largeText: "Chữ lớn",
  largeTextEnable: "Chuyển sang giao diện thân thiện với người cao tuổi",
  largeTextDisable: "Chuyển về giao diện mặc định",
  uiChangeTitle: "Bạn có muốn thay đổi giao diện không?",
  uiChangeToSenior: "Toàn bộ màn hình sẽ chuyển sang giao diện thân thiện với người cao tuổi. Nội dung đã nhập sẽ được giữ nguyên.",
  uiChangeToDefault: "Màn hình sẽ trở về giao diện mặc định. Nội dung đã nhập sẽ được giữ nguyên.",
  uiChangeCancel: "Hủy",
  uiChangeConfirm: "Thay đổi",
  session: "Phiên",
  sessionActive: "Đang hoạt động",
  sessionCountdown: "Không hoạt động",
  sessionRemaining: "Thời gian đăng nhập còn lại: {{time}}",
  sessionPaused: "Đã phát hiện hoạt động. Bộ đếm 60 phút bắt đầu sau một phút không hoạt động.",
});
Object.assign(resources.fil.translation.common, {
  largeText: "Malaking teksto",
  largeTextEnable: "Lumipat sa senior-friendly UI",
  largeTextDisable: "Bumalik sa default UI",
  uiChangeTitle: "Gusto mo bang baguhin ang UI?",
  uiChangeToSenior: "Magbabago ang buong screen sa senior-friendly UI. Mananatili ang iyong mga inilagay.",
  uiChangeToDefault: "Babalik ang screen sa default UI. Mananatili ang iyong mga inilagay.",
  uiChangeCancel: "Kanselahin",
  uiChangeConfirm: "Baguhin",
  session: "Session",
  sessionActive: "Aktibo",
  sessionCountdown: "Hindi aktibo",
  sessionRemaining: "Natitirang oras ng login: {{time}}",
  sessionPaused: "May na-detect na activity. Magsisimula ang 60-minutong countdown pagkatapos ng isang minutong walang activity.",
});

Object.assign(resources.ko.translation.login, {
  signupKicker: "안전한 계정 만들기",
  goToSignup: "회원가입",
  goToLogin: "로그인",
  sessionExpired: "로그인 유지 시간이 경과되었습니다. 다시 로그인해주세요.",
});
Object.assign(resources.en.translation.login, {
  signupKicker: "Create a secure account",
  goToSignup: "Go to sign-up page",
  goToLogin: "Go to login page",
  sessionExpired: "Your 60-minute session ended after a period of inactivity. Please log in again.",
});
Object.assign(resources.vi.translation.login, {
  signupKicker: "Tạo tài khoản an toàn",
  goToSignup: "Đi đến trang đăng ký",
  goToLogin: "Đi đến trang đăng nhập",
  sessionExpired: "Phiên đăng nhập 60 phút đã kết thúc sau một thời gian không hoạt động. Vui lòng đăng nhập lại.",
});
Object.assign(resources.fil.translation.login, {
  signupKicker: "Gumawa ng secure na account",
  goToSignup: "Pumunta sa sign-up page",
  goToLogin: "Pumunta sa login page",
  sessionExpired: "Natapos ang 60-minutong session matapos ang panahon ng inactivity. Mag-log in muli.",
});

Object.assign(resources.ko.translation.mypage, {
  loading: "신청 내역을 불러오고 있습니다.",
  loadingDescription: "마이페이지로 이동 중입니다. 개인정보와 신청 내역을 불러오고 있습니다.",
  completed: "완료",
  inProgress: "진행 중",
  viewDetail: "상세 내역 조회",
  accessExpired: "30일 조회 기간 종료 · 별도 문의 필요",
  stepProgress: "{{step}}/8 단계",
});
Object.assign(resources.en.translation.mypage, {
  loading: "Loading your claims.",
  loadingDescription: "Moving to My page and loading your profile and applications.",
  completed: "Completed",
  inProgress: "In progress",
  viewDetail: "View details",
  accessExpired: "30-day access ended · Contact required",
  stepProgress: "Step {{step}} of 8",
});
Object.assign(resources.vi.translation.mypage, {
  loading: "Đang tải hồ sơ của bạn.",
  loadingDescription: "Đang chuyển đến Trang cá nhân và tải thông tin cùng hồ sơ của bạn.",
  completed: "Hoàn tất",
  inProgress: "Đang thực hiện",
  viewDetail: "Xem chi tiết",
  accessExpired: "Đã hết 30 ngày xem · Cần liên hệ",
  stepProgress: "Bước {{step}}/8",
});
Object.assign(resources.fil.translation.mypage, {
  loading: "Nilo-load ang iyong mga claim.",
  loadingDescription: "Pumupunta sa Aking pahina at nilo-load ang profile at mga application.",
  completed: "Tapos",
  inProgress: "Ginagawa",
  viewDetail: "Tingnan ang detalye",
  accessExpired: "Tapos na ang 30-araw na access · Makipag-ugnayan",
  stepProgress: "Hakbang {{step}}/8",
});

Object.assign(resources.ko.translation, {
  claimDetail: {
    kicker: "완료 신청 내역",
    title: "신청 상세 내역",
    description: "작성한 내용과 제출한 서류를 확인할 수 있습니다.",
    back: "마이페이지로 돌아가기",
    loading: "신청 상세 내역을 불러오고 있습니다.",
    unavailable: "상세 내역을 조회할 수 없습니다.",
    loadFailed: "신청 상세 내역을 불러오지 못했습니다.",
    retentionTitle: "자료 조회 및 보유 기간 안내",
    retentionNotice: "개인정보처리법에 의거하여 사용자가 조회 가능한 기간은 신청 완료일로부터 30일 이내이며, 최대 1년까지 소유하고 있습니다. 만일 30일이 지난 후에 자료가 필요할 경우엔 별도로 문의하셔야합니다.",
    completedAt: "신청 완료일",
    viewableUntil: "사용자 조회 가능 기한",
    applicantTitle: "신청인 작성 정보",
    applicantHelp: "신청 과정에서 작성한 개인정보입니다.",
    workplaceTitle: "사업장 작성 정보",
    workplaceHelp: "재해 당시 근무한 사업장 정보입니다.",
    accidentTitle: "재해 작성 내용",
    accidentHelp: "사용자가 입력하고 최종 확인한 재해 내용입니다.",
    generatedStatement: "최종 재해경위서",
    documentsTitle: "제출한 서류",
    documentsHelp: "신청 과정에서 제출한 원본 서류를 확인할 수 있습니다.",
    noDocuments: "제출한 서류가 없습니다.",
    openDocument: "서류 보기",
    opening: "여는 중…",
    documentOpenFailed: "제출 서류를 열지 못했습니다.",
    documentStatus: { uploaded: "업로드 완료", ocr_pending: "문서 인식 대기", ocr_completed: "문서 인식 완료", verified: "확인 완료", rejected: "확인 필요" },
  },
});
Object.assign(resources.en.translation, {
  claimDetail: {
    kicker: "Completed application",
    title: "Application details",
    description: "Review the information you entered and the documents you submitted.",
    back: "Back to My page",
    loading: "Loading application details.",
    unavailable: "Application details are unavailable.",
    loadFailed: "We could not load the application details.",
    retentionTitle: "Document access and retention period",
    retentionNotice: "Under the Personal Information Protection Act, users may access records within 30 days of application completion. Records may be retained for up to one year. If you need records after 30 days, you must contact us separately.",
    completedAt: "Completion date",
    viewableUntil: "User access deadline",
    applicantTitle: "Applicant information",
    applicantHelp: "Personal information entered during the application.",
    workplaceTitle: "Workplace information",
    workplaceHelp: "Workplace information at the time of the accident.",
    accidentTitle: "Accident information",
    accidentHelp: "The accident facts entered and confirmed by the user.",
    generatedStatement: "Final accident statement",
    documentsTitle: "Submitted documents",
    documentsHelp: "Review the original documents submitted during the application.",
    noDocuments: "No documents were submitted.",
    openDocument: "View document",
    opening: "Opening…",
    documentOpenFailed: "The submitted document could not be opened.",
    documentStatus: { uploaded: "Uploaded", ocr_pending: "Recognition pending", ocr_completed: "Recognition complete", verified: "Verified", rejected: "Needs review" },
  },
});
Object.assign(resources.vi.translation, {
  claimDetail: {
    kicker: "Hồ sơ đã hoàn tất",
    title: "Chi tiết hồ sơ",
    description: "Kiểm tra thông tin đã nhập và tài liệu đã nộp.",
    back: "Quay lại Trang cá nhân",
    loading: "Đang tải chi tiết hồ sơ.",
    unavailable: "Không thể xem chi tiết hồ sơ.",
    loadFailed: "Không thể tải chi tiết hồ sơ.",
    retentionTitle: "Thời hạn xem và lưu giữ tài liệu",
    retentionNotice: "Theo Luật Bảo vệ Thông tin Cá nhân, người dùng có thể xem hồ sơ trong vòng 30 ngày kể từ ngày hoàn tất. Hồ sơ có thể được lưu giữ tối đa một năm. Nếu cần tài liệu sau 30 ngày, bạn phải liên hệ riêng.",
    completedAt: "Ngày hoàn tất",
    viewableUntil: "Hạn người dùng được xem",
    applicantTitle: "Thông tin người nộp",
    applicantHelp: "Thông tin cá nhân đã nhập trong quá trình làm hồ sơ.",
    workplaceTitle: "Thông tin nơi làm việc",
    workplaceHelp: "Thông tin nơi làm việc tại thời điểm xảy ra tai nạn.",
    accidentTitle: "Thông tin tai nạn",
    accidentHelp: "Nội dung tai nạn do người dùng nhập và xác nhận.",
    generatedStatement: "Bản tường trình tai nạn cuối cùng",
    documentsTitle: "Tài liệu đã nộp",
    documentsHelp: "Xem tài liệu gốc đã nộp trong quá trình làm hồ sơ.",
    noDocuments: "Không có tài liệu đã nộp.",
    openDocument: "Xem tài liệu",
    opening: "Đang mở…",
    documentOpenFailed: "Không thể mở tài liệu đã nộp.",
    documentStatus: { uploaded: "Đã tải lên", ocr_pending: "Đang chờ nhận dạng", ocr_completed: "Đã nhận dạng", verified: "Đã xác nhận", rejected: "Cần kiểm tra" },
  },
});
Object.assign(resources.fil.translation, {
  claimDetail: {
    kicker: "Tapos na application",
    title: "Detalye ng application",
    description: "Tingnan ang impormasyong inilagay at mga dokumentong isinumite.",
    back: "Bumalik sa Aking pahina",
    loading: "Nilo-load ang detalye ng application.",
    unavailable: "Hindi available ang detalye ng application.",
    loadFailed: "Hindi ma-load ang detalye ng application.",
    retentionTitle: "Panahon ng access at pag-iingat ng dokumento",
    retentionNotice: "Sa ilalim ng Personal Information Protection Act, maaaring tingnan ng user ang records sa loob ng 30 araw mula sa pagkumpleto ng application. Maaaring itago ang records nang hanggang isang taon. Kung kailangan ang records pagkalipas ng 30 araw, kailangang makipag-ugnayan nang hiwalay.",
    completedAt: "Petsa ng pagkumpleto",
    viewableUntil: "Deadline ng user access",
    applicantTitle: "Impormasyon ng aplikante",
    applicantHelp: "Personal na impormasyong inilagay habang gumagawa ng application.",
    workplaceTitle: "Impormasyon ng workplace",
    workplaceHelp: "Impormasyon ng workplace noong mangyari ang aksidente.",
    accidentTitle: "Impormasyon ng aksidente",
    accidentHelp: "Mga detalye ng aksidente na inilagay at kinumpirma ng user.",
    generatedStatement: "Pinal na accident statement",
    documentsTitle: "Mga isinumiteng dokumento",
    documentsHelp: "Tingnan ang original documents na isinumite sa application.",
    noDocuments: "Walang isinumiteng dokumento.",
    openDocument: "Tingnan ang dokumento",
    opening: "Binubuksan…",
    documentOpenFailed: "Hindi mabuksan ang isinumiteng dokumento.",
    documentStatus: { uploaded: "Na-upload", ocr_pending: "Naghihintay ng recognition", ocr_completed: "Tapos ang recognition", verified: "Na-verify", rejected: "Kailangang suriin" },
  },
});

Object.assign(resources.ko.translation.wizard.details, {
  completionHelp: "양식에 맞춘 PDF 2종을 ZIP으로 내려받을 수 있습니다.",
  packageContents: "요양급여 신청 정보서 PDF · 재해경위서 PDF",
  zip: "PDF 2종 ZIP 파일",
});
Object.assign(resources.en.translation.wizard.details, {
  completionHelp: "Download two form-based PDFs together in one ZIP file.",
  packageContents: "Medical care application PDF · Accident statement PDF",
  zip: "ZIP file with 2 PDFs",
  downloadPackage: "Save to Downloads",
  chooseFolder: "Choose save folder",
});
Object.assign(resources.vi.translation.wizard.details, {
  completionHelp: "Tải hai tệp PDF theo biểu mẫu trong một tệp ZIP.",
  packageContents: "PDF thông tin đơn · PDF diễn biến tai nạn",
  zip: "Tệp ZIP gồm 2 PDF",
  downloadPackage: "Lưu vào Downloads",
  chooseFolder: "Chọn thư mục lưu",
});
Object.assign(resources.fil.translation.wizard.details, {
  completionHelp: "I-download ang dalawang form-based PDF sa isang ZIP file.",
  packageContents: "Application PDF · Accident statement PDF",
  zip: "ZIP file na may 2 PDF",
  downloadPackage: "I-save sa Downloads",
  chooseFolder: "Pumili ng save folder",
});

Object.assign(resources.ko.translation.common, {
  loadingDescription: "안전하게 저장된 정보를 불러오는 중입니다. 잠시만 기다려주세요.",
});
Object.assign(resources.en.translation.common, {
  loadingDescription: "Loading your securely stored information. Please wait.",
});
Object.assign(resources.vi.translation.common, {
  loadingDescription: "Đang tải thông tin được lưu trữ an toàn. Vui lòng chờ.",
});
Object.assign(resources.fil.translation.common, {
  loadingDescription: "Nilo-load ang ligtas na naka-save na impormasyon. Sandali lamang.",
});

Object.assign(resources.ko.translation.dashboard, {
  durationInput: "직접 입력 약 15분",
  durationDocuments: "+ 서류 준비 평균 1~3일 (시연 기준)",
  loading: "로그인이 완료되었습니다.",
  loadingDescription: "신청 현황과 제출 준비도를 확인하고 있습니다.",
});
Object.assign(resources.en.translation.dashboard, {
  durationInput: "About 15 min of input",
  durationDocuments: "+ 1–3 days for documents (demo assumption)",
  loading: "Login complete.",
  loadingDescription: "Checking your application status and submission readiness.",
});
Object.assign(resources.vi.translation.dashboard, {
  durationInput: "Khoảng 15 phút nhập liệu",
  durationDocuments: "+ 1–3 ngày chuẩn bị giấy tờ (giả định demo)",
  loading: "Đăng nhập hoàn tất.",
  loadingDescription: "Đang kiểm tra trạng thái hồ sơ và mức độ sẵn sàng nộp.",
});
Object.assign(resources.fil.translation.dashboard, {
  durationInput: "Mga 15 min na input",
  durationDocuments: "+ 1–3 araw para sa dokumento (demo assumption)",
  loading: "Tapos na ang pag-login.",
  loadingDescription: "Sinusuri ang status at kahandaan ng iyong application.",
});

const myPageTranslations = {
  ko: (resources.ko.translation as unknown as { mypage: Record<string, string> }).mypage,
  en: (resources.en.translation as unknown as { mypage: Record<string, string> }).mypage,
  vi: (resources.vi.translation as unknown as { mypage: Record<string, string> }).mypage,
  fil: (resources.fil.translation as unknown as { mypage: Record<string, string> }).mypage,
};
Object.assign(myPageTranslations.ko, {
  notificationOn: "알림 켜짐",
  notificationOff: "알림 꺼짐",
});
Object.assign(myPageTranslations.en, {
  notificationOn: "On",
  notificationOff: "Off",
});
Object.assign(myPageTranslations.vi, {
  notificationOn: "Đang bật",
  notificationOff: "Đang tắt",
});
Object.assign(myPageTranslations.fil, {
  notificationOn: "Naka-on",
  notificationOff: "Naka-off",
});

Object.assign(resources.ko.translation, {
  profileEdit: {
    kicker: "개인정보 관리",
    title: "개인정보 수정",
    description: "신청에 사용되는 개인정보를 확인하고 안전하게 수정합니다.",
    back: "마이페이지로 돌아가기",
    loading: "개인정보를 불러오고 있습니다.",
    loadingDescription: "개인정보 수정 화면으로 이동 중입니다. 암호화된 정보를 안전하게 불러오고 있습니다.",
    loadFailed: "개인정보를 불러오지 못했습니다.",
    identityTitle: "신청자 본인 확인이 필요합니다",
    identityHelp: "수정 내용을 저장하려면 신청자의 생년월일 8자리를 입력해야 합니다.",
    formTitle: "수정할 정보",
    encryptionHelp: "수정한 민감정보는 서버에서 암호화한 뒤 저장합니다.",
    emailReadonly: "로그인 이메일은 이 화면에서 변경할 수 없습니다.",
    nationality: "국적",
    signature: "서명",
    signaturePlaceholder: "서명에 사용할 성명을 입력하세요",
    signatureHelp: "아래 칸에 마우스나 손가락으로 직접 서명하세요. 배경은 제외하고 서명 획만 암호화하여 저장합니다.",
    signaturePreview: "직접 서명 입력 영역",
    signatureDrawHint: "이 영역에 직접 서명해주세요",
    signatureClear: "다시 쓰기",
    signatureMark: "(서명)",
    birthDate: "신청자 생년월일",
    birthDateHelp: "YYYYMMDD 형식의 숫자 8자리를 입력하세요. 확인 값은 새로 저장하지 않습니다.",
    birthDateFormat: "생년월일을 YYYYMMDD 형식의 숫자 8자리로 입력해주세요.",
    save: "본인 확인 후 저장",
    saving: "확인 및 저장 중…",
    saved: "개인정보가 안전하게 수정되었습니다.",
    saveFailed: "개인정보를 수정하지 못했습니다.",
    cancel: "취소",
  },
});
Object.assign(resources.en.translation, {
  profileEdit: {
    kicker: "Personal information",
    title: "Edit personal information",
    description: "Review and securely update the information used in your application.",
    back: "Back to My page",
    loading: "Loading your personal information.",
    loadingDescription: "Opening the edit page and securely loading your encrypted information.",
    loadFailed: "We could not load your personal information.",
    identityTitle: "Applicant identity verification is required",
    identityHelp: "Enter the applicant's 8-digit date of birth before saving changes.",
    formTitle: "Information to update",
    encryptionHelp: "Sensitive changes are encrypted on the server before storage.",
    emailReadonly: "Your sign-in email cannot be changed on this page.",
    nationality: "Nationality",
    signature: "Signature",
    signaturePlaceholder: "Enter the name to use as your signature",
    signatureHelp: "Sign directly in the box with a mouse or finger. Only the signature strokes are stored with encryption on a transparent background.",
    signaturePreview: "Draw your signature",
    signatureDrawHint: "Sign directly in this area",
    signatureClear: "Clear",
    signatureMark: "(signature)",
    birthDate: "Applicant date of birth",
    birthDateHelp: "Enter 8 digits in YYYYMMDD format. The verification value is not stored again.",
    birthDateFormat: "Enter the date of birth as 8 digits in YYYYMMDD format.",
    save: "Verify and save",
    saving: "Verifying and saving…",
    saved: "Your personal information was updated securely.",
    saveFailed: "We could not update your personal information.",
    cancel: "Cancel",
  },
});
Object.assign(resources.vi.translation, {
  profileEdit: {
    kicker: "Thông tin cá nhân",
    title: "Chỉnh sửa thông tin cá nhân",
    description: "Kiểm tra và cập nhật an toàn thông tin dùng trong hồ sơ.",
    back: "Quay lại Trang cá nhân",
    loading: "Đang tải thông tin cá nhân.",
    loadingDescription: "Đang mở trang chỉnh sửa và tải an toàn thông tin đã mã hóa.",
    loadFailed: "Không thể tải thông tin cá nhân.",
    identityTitle: "Cần xác minh danh tính người nộp",
    identityHelp: "Nhập 8 chữ số ngày sinh của người nộp trước khi lưu thay đổi.",
    formTitle: "Thông tin cần cập nhật",
    encryptionHelp: "Thông tin nhạy cảm được mã hóa trên máy chủ trước khi lưu.",
    emailReadonly: "Không thể đổi email đăng nhập tại trang này.",
    nationality: "Quốc tịch",
    signature: "Chữ ký",
    signaturePlaceholder: "Nhập tên dùng làm chữ ký",
    signatureHelp: "Ký trực tiếp trong ô bằng chuột hoặc ngón tay. Chỉ nét ký trên nền trong suốt được mã hóa và lưu.",
    signaturePreview: "Vùng ký trực tiếp",
    signatureDrawHint: "Ký trực tiếp vào vùng này",
    signatureClear: "Viết lại",
    signatureMark: "(ký tên)",
    birthDate: "Ngày sinh người nộp",
    birthDateHelp: "Nhập 8 chữ số theo YYYYMMDD. Giá trị xác minh không được lưu lại.",
    birthDateFormat: "Hãy nhập ngày sinh bằng 8 chữ số theo YYYYMMDD.",
    save: "Xác minh và lưu",
    saving: "Đang xác minh và lưu…",
    saved: "Thông tin cá nhân đã được cập nhật an toàn.",
    saveFailed: "Không thể cập nhật thông tin cá nhân.",
    cancel: "Hủy",
  },
});
Object.assign(resources.fil.translation, {
  profileEdit: {
    kicker: "Personal na impormasyon",
    title: "I-edit ang personal na impormasyon",
    description: "Suriin at ligtas na i-update ang impormasyong ginagamit sa application.",
    back: "Bumalik sa Aking pahina",
    loading: "Nilo-load ang personal na impormasyon.",
    loadingDescription: "Binubuksan ang edit page at ligtas na nilo-load ang encrypted na impormasyon.",
    loadFailed: "Hindi ma-load ang personal na impormasyon.",
    identityTitle: "Kailangang kumpirmahin ang aplikante",
    identityHelp: "Ilagay ang 8-digit na petsa ng kapanganakan ng aplikante bago mag-save.",
    formTitle: "Impormasyong ia-update",
    encryptionHelp: "Ini-encrypt sa server ang sensitibong pagbabago bago i-save.",
    emailReadonly: "Hindi mababago ang login email sa pahinang ito.",
    nationality: "Nasyonalidad",
    signature: "Lagda",
    signaturePlaceholder: "Ilagay ang pangalang gagamitin bilang lagda",
    signatureHelp: "Direktang pumirma sa kahon gamit ang mouse o daliri. Ang mga guhit lamang sa transparent na background ang ine-encrypt at sine-save.",
    signaturePreview: "Lugar para direktang pumirma",
    signatureDrawHint: "Direktang pumirma sa bahaging ito",
    signatureClear: "Burahin",
    signatureMark: "(lagda)",
    birthDate: "Petsa ng kapanganakan ng aplikante",
    birthDateHelp: "Maglagay ng 8 digit sa YYYYMMDD format. Hindi muling sine-save ang verification value.",
    birthDateFormat: "Ilagay ang petsa ng kapanganakan bilang 8 digit sa YYYYMMDD format.",
    save: "I-verify at i-save",
    saving: "Vine-verify at sine-save…",
    saved: "Ligtas na na-update ang personal na impormasyon.",
    saveFailed: "Hindi na-update ang personal na impormasyon.",
    cancel: "Kanselahin",
  },
});

const profileEditTranslations = {
  ko: (resources.ko.translation as unknown as { profileEdit: Record<string, string> }).profileEdit,
  en: (resources.en.translation as unknown as { profileEdit: Record<string, string> }).profileEdit,
  vi: (resources.vi.translation as unknown as { profileEdit: Record<string, string> }).profileEdit,
  fil: (resources.fil.translation as unknown as { profileEdit: Record<string, string> }).profileEdit,
};

Object.assign(profileEditTranslations.ko, {
  setupKicker: "첫 로그인 사전정보",
  setupTitle: "신청 전 기본정보를 입력해주세요",
  setupDescription: "처음 한 번만 입력하면 이후 신청서에 안전하게 불러옵니다.",
  setupIdentityTitle: "필수 사전정보 입력",
  setupIdentityHelp: "신청에 필요한 성명, 연락처, 주소, 국적, 생년월일, 사용 언어와 서명을 입력해주세요. 외국인등록번호는 해당하는 경우에만 선택적으로 입력합니다.",
  setupBirthDateHelp: "YYYYMMDD 형식의 숫자 8자리를 입력하세요. 암호화하여 저장합니다.",
  complete: "사전정보 저장 후 시작",
  completing: "사전정보 저장 중…",
  identityNumberType: "식별번호 유형",
  residentNumber: "주민등록번호",
  foreignNumber: "외국인등록번호",
  identityNumberHelp: "외국인등록번호가 있는 경우에만 입력하세요. 암호화해 저장하며 화면에는 마스킹하여 표시합니다.",
  identityNumberUpdateHelp: "변경할 때만 새 번호를 입력하세요. 비워두면 기존 번호를 유지합니다.",
  identityNumberFormat: "외국인등록번호 13자리를 입력해주세요.",
  signatureRequired: "서명 입력 영역에 직접 서명해주세요.",
});
Object.assign(profileEditTranslations.en, {
  setupKicker: "First-login setup",
  setupTitle: "Enter your basic information",
  setupDescription: "Complete this once so future applications can load it securely.",
  setupIdentityTitle: "Required information",
  setupIdentityHelp: "Enter your name, contact details, address, nationality, date of birth, language, and signature. A foreign registration number is optional and only for applicable users.",
  setupBirthDateHelp: "Enter 8 digits in YYYYMMDD format. It will be stored with encryption.",
  complete: "Save and continue",
  completing: "Saving information…",
  identityNumberType: "ID number type",
  residentNumber: "Resident registration number",
  foreignNumber: "Foreign registration number",
  identityNumberHelp: "Enter a foreign registration number only if applicable. It is encrypted and shown masked on screen.",
  identityNumberUpdateHelp: "Enter a new number only when changing it. Leave blank to keep the current number.",
  identityNumberFormat: "Enter all 13 digits of the registration number.",
  signatureRequired: "Draw your signature in the signature box.",
});
Object.assign(profileEditTranslations.vi, {
  setupKicker: "Thiết lập lần đăng nhập đầu",
  setupTitle: "Nhập thông tin cơ bản",
  setupDescription: "Chỉ cần hoàn tất một lần để dùng an toàn cho các hồ sơ sau.",
  setupIdentityTitle: "Thông tin bắt buộc",
  setupIdentityHelp: "Nhập họ tên, liên hệ, địa chỉ, quốc tịch, ngày sinh, số đăng ký, ngôn ngữ và chữ ký.",
  setupBirthDateHelp: "Nhập 8 chữ số theo YYYYMMDD. Dữ liệu sẽ được mã hóa khi lưu.",
  complete: "Lưu và tiếp tục",
  completing: "Đang lưu thông tin…",
  identityNumberType: "Loại số đăng ký",
  residentNumber: "Số đăng ký cư trú",
  foreignNumber: "Số đăng ký người nước ngoài",
  identityNumberHelp: "Nhập 6 chữ số đầu và 7 chữ số sau. Dữ liệu được mã hóa và chỉ hiển thị dạng che.",
  identityNumberUpdateHelp: "Chỉ nhập số mới khi cần đổi. Để trống để giữ số hiện tại.",
  identityNumberFormat: "Hãy nhập đủ 13 chữ số của số đăng ký.",
  signatureRequired: "Hãy ký trực tiếp trong ô chữ ký.",
});
Object.assign(profileEditTranslations.fil, {
  setupKicker: "Unang login setup",
  setupTitle: "Ilagay ang basic na impormasyon",
  setupDescription: "Isang beses lang itong kukumpletuhin para ligtas na magamit sa susunod na applications.",
  setupIdentityTitle: "Kailangang impormasyon",
  setupIdentityHelp: "Ilagay ang pangalan, contact, address, nasyonalidad, petsa ng kapanganakan, registration number, wika, at lagda.",
  setupBirthDateHelp: "Maglagay ng 8 digit sa YYYYMMDD format. Ise-save ito nang naka-encrypt.",
  complete: "I-save at magpatuloy",
  completing: "Sine-save ang impormasyon…",
  identityNumberType: "Uri ng registration number",
  residentNumber: "Resident registration number",
  foreignNumber: "Foreign registration number",
  identityNumberHelp: "Ilagay ang unang 6 at huling 7 digit. Naka-encrypt ito at masked lang sa screen.",
  identityNumberUpdateHelp: "Maglagay lamang kapag papalitan. Iwanang blangko para panatilihin ang kasalukuyan.",
  identityNumberFormat: "Ilagay ang kumpletong 13 digit na registration number.",
  signatureRequired: "Direktang pumirma sa signature box.",
});

Object.assign(resources.ko.translation, {
  passwordChange: {
    title: "비밀번호 변경",
    description: "현재 비밀번호를 확인한 뒤 새 비밀번호로 변경합니다.",
    current: "현재 비밀번호",
    new: "새 비밀번호",
    confirm: "새 비밀번호 확인",
    submit: "비밀번호 변경",
    changing: "변경 중…",
    changed: "비밀번호가 안전하게 변경되었습니다.",
    mismatch: "새 비밀번호와 확인 값이 일치하지 않습니다.",
    samePassword: "현재 비밀번호와 다른 새 비밀번호를 입력해주세요.",
    failed: "비밀번호를 변경하지 못했습니다.",
  },
  privacyModal: {
    title: "개인정보 처리방침",
    intro: "산재원샷은 산업재해 신청 준비를 지원하기 위해 필요한 최소한의 개인정보만 처리합니다.",
    collectedTitle: "1. 처리하는 개인정보",
    collectedBody: "계정 이메일, 성명, 연락처, 주소, 국적, 생년월일, 신청 내용과 사용자가 직접 올린 증빙서류를 처리할 수 있습니다.",
    purposeTitle: "2. 처리 목적",
    purposeBody: "본인 계정 확인, 신청서 작성 지원, 문서 분석, 신청 진행상태 저장 및 사용자가 요청한 결과물 제공에만 사용합니다.",
    retentionTitle: "3. 보유 및 파기",
    retentionBody: "작성 중 신청은 마지막 저장일부터 90일간 보관 후 삭제합니다. 사용자가 삭제를 선택하면 신청 내용과 업로드 문서를 즉시 파기하며, 원문을 5년간 별도 보관하지 않습니다. 완료된 신청의 사용자 조회 기간은 30일입니다.",
    protectionTitle: "4. 보호조치 및 제3자 제공",
    protectionBody: "민감한 프로필과 문서는 서버에서 AES-256-GCM으로 암호화하고 사용자별 접근권한을 적용합니다. 법령상 근거 또는 사용자의 별도 동의가 없는 한 개인정보를 제3자에게 판매하거나 임의 제공하지 않습니다.",
    rightsTitle: "5. 이용자의 권리",
    rightsBody: "마이페이지에서 개인정보를 확인·수정할 수 있으며, 열람·정정·삭제·처리정지를 요청할 수 있습니다. 본 서비스는 근로복지공단의 공식 서비스가 아니며 법률적 판단이나 승인 결과를 보장하지 않습니다.",
    close: "개인정보 처리방침 닫기",
    confirm: "확인했습니다",
  },
});
Object.assign(resources.en.translation, {
  passwordChange: {
    title: "Change password",
    description: "Confirm your current password, then set a new one.",
    current: "Current password",
    new: "New password",
    confirm: "Confirm new password",
    submit: "Change password",
    changing: "Changing…",
    changed: "Your password was changed securely.",
    mismatch: "The new password and confirmation do not match.",
    samePassword: "Choose a new password that differs from the current password.",
    failed: "We could not change your password.",
  },
  privacyModal: {
    title: "Privacy policy",
    intro: "Sanjae Oneshot processes only the personal information needed to help prepare a work injury claim.",
    collectedTitle: "1. Information processed",
    collectedBody: "We may process your account email, name, contact details, address, nationality, date of birth, claim entries, and evidence you upload.",
    purposeTitle: "2. Purpose",
    purposeBody: "Information is used only to verify your account, help prepare forms, analyze documents, save progress, and provide requested outputs.",
    retentionTitle: "3. Retention and deletion",
    retentionBody: "Draft claims are kept for 90 days after the last save. User deletion immediately removes claim content and uploaded documents; the original content is not secretly retained for five years. Completed claims remain viewable for 30 days.",
    protectionTitle: "4. Safeguards and sharing",
    protectionBody: "Sensitive profiles and documents are encrypted on the server with AES-256-GCM and protected by per-user access controls. We do not sell or disclose personal information without consent or a legal basis.",
    rightsTitle: "5. Your rights",
    rightsBody: "You can review and edit information in My page and request access, correction, deletion, or restriction. This is not an official COMWEL service and does not guarantee a legal decision or approval.",
    close: "Close privacy policy",
    confirm: "I understand",
  },
});
Object.assign(resources.vi.translation, {
  passwordChange: {
    title: "Đổi mật khẩu",
    description: "Xác nhận mật khẩu hiện tại rồi đặt mật khẩu mới.",
    current: "Mật khẩu hiện tại",
    new: "Mật khẩu mới",
    confirm: "Xác nhận mật khẩu mới",
    submit: "Đổi mật khẩu",
    changing: "Đang thay đổi…",
    changed: "Mật khẩu đã được thay đổi an toàn.",
    mismatch: "Mật khẩu mới và xác nhận không khớp.",
    samePassword: "Hãy chọn mật khẩu mới khác mật khẩu hiện tại.",
    failed: "Không thể đổi mật khẩu.",
  },
  privacyModal: {
    title: "Chính sách quyền riêng tư",
    intro: "Sanjae Oneshot chỉ xử lý thông tin cá nhân cần thiết để hỗ trợ chuẩn bị hồ sơ tai nạn lao động.",
    collectedTitle: "1. Thông tin được xử lý",
    collectedBody: "Có thể bao gồm email tài khoản, họ tên, liên hệ, địa chỉ, quốc tịch, ngày sinh, nội dung hồ sơ và chứng từ do bạn tải lên.",
    purposeTitle: "2. Mục đích",
    purposeBody: "Chỉ dùng để xác minh tài khoản, hỗ trợ lập đơn, phân tích tài liệu, lưu tiến độ và cung cấp kết quả bạn yêu cầu.",
    retentionTitle: "3. Lưu giữ và xóa",
    retentionBody: "Hồ sơ đang soạn được lưu 90 ngày kể từ lần lưu cuối. Khi người dùng xóa, nội dung và tài liệu tải lên sẽ bị xóa ngay và không được giữ bí mật trong 5 năm. Hồ sơ hoàn tất có thể xem trong 30 ngày.",
    protectionTitle: "4. Bảo vệ và chia sẻ",
    protectionBody: "Hồ sơ và tài liệu nhạy cảm được mã hóa AES-256-GCM trên máy chủ và giới hạn quyền truy cập theo từng người dùng. Không bán hoặc cung cấp tùy ý cho bên thứ ba.",
    rightsTitle: "5. Quyền của bạn",
    rightsBody: "Bạn có thể xem, sửa và yêu cầu truy cập, chỉnh sửa, xóa hoặc hạn chế xử lý. Đây không phải dịch vụ chính thức của COMWEL và không bảo đảm kết quả phê duyệt.",
    close: "Đóng chính sách quyền riêng tư",
    confirm: "Tôi đã hiểu",
  },
});
Object.assign(resources.fil.translation, {
  passwordChange: {
    title: "Palitan ang password",
    description: "Kumpirmahin ang kasalukuyang password bago magtakda ng bago.",
    current: "Kasalukuyang password",
    new: "Bagong password",
    confirm: "Kumpirmahin ang bagong password",
    submit: "Palitan ang password",
    changing: "Pinapalitan…",
    changed: "Ligtas na napalitan ang password.",
    mismatch: "Hindi magkatugma ang bagong password at confirmation.",
    samePassword: "Pumili ng bagong password na iba sa kasalukuyan.",
    failed: "Hindi napalitan ang password.",
  },
  privacyModal: {
    title: "Patakaran sa privacy",
    intro: "Pinoproseso lamang ng Sanjae Oneshot ang impormasyong kailangan sa paghahanda ng work injury claim.",
    collectedTitle: "1. Impormasyong pinoproseso",
    collectedBody: "Maaaring kabilang ang account email, pangalan, contact, address, nasyonalidad, petsa ng kapanganakan, claim entries, at ebidensyang in-upload mo.",
    purposeTitle: "2. Layunin",
    purposeBody: "Ginagamit lamang sa pag-verify ng account, paghahanda ng form, pagsusuri ng dokumento, pag-save ng progress, at pagbibigay ng hinihinging output.",
    retentionTitle: "3. Retention at deletion",
    retentionBody: "Itinatago ang draft sa loob ng 90 araw mula sa huling save. Kapag dinelete ng user, agad na binubura ang claim content at uploads at hindi lihim na itinatago nang limang taon. Makikita ang completed claim sa loob ng 30 araw.",
    protectionTitle: "4. Proteksyon at pagbabahagi",
    protectionBody: "Naka-encrypt sa server gamit ang AES-256-GCM ang sensitibong profile at dokumento at may per-user access control. Hindi ito ibinebenta o basta ibinibigay sa third party.",
    rightsTitle: "5. Iyong mga karapatan",
    rightsBody: "Maaari mong tingnan at i-edit ang impormasyon at humiling ng access, correction, deletion, o restriction. Hindi ito opisyal na COMWEL service at hindi ginagarantiya ang approval.",
    close: "Isara ang privacy policy",
    confirm: "Nauunawaan ko",
  },
});

Object.assign(resources.ko.translation.dashboard, {
  savedDescription: "진행 중인 신청은 90일 동안 안전하게 저장되며 언제든 마지막 단계부터 이어갈 수 있습니다.",
  resume: "신청 이어서 진행",
  startNew: "새 산재 신청 시작",
  savedLabel: "저장된 신청",
  savedTitle: "진행 중인 산재 신청이 있습니다",
  savedAtStep: "STEP {{step}}에서 마지막으로 저장했습니다.",
  expiresAt: "보관 만료일: {{date}}",
  ninetyDays: "저장일로부터 90일",
  continueWriting: "이어서 작성",
});
Object.assign(resources.en.translation.dashboard, {
  savedDescription: "In-progress claims are stored for 90 days and can be resumed from the last saved step.",
  resume: "Resume application",
  startNew: "Start a new claim",
  savedLabel: "Saved application",
  savedTitle: "You have an application in progress",
  savedAtStep: "Last saved at STEP {{step}}.",
  expiresAt: "Retention expires: {{date}}",
  ninetyDays: "90 days from the last save",
  continueWriting: "Continue",
});
Object.assign(resources.vi.translation.dashboard, {
  savedDescription: "Hồ sơ đang làm được lưu trong 90 ngày và có thể tiếp tục từ bước đã lưu gần nhất.",
  resume: "Tiếp tục hồ sơ",
  startNew: "Tạo hồ sơ mới",
  savedLabel: "Hồ sơ đã lưu",
  savedTitle: "Bạn có một hồ sơ đang thực hiện",
  savedAtStep: "Đã lưu gần nhất ở BƯỚC {{step}}.",
  expiresAt: "Hết thời hạn lưu: {{date}}",
  ninetyDays: "90 ngày từ lần lưu cuối",
  continueWriting: "Tiếp tục",
});
Object.assign(resources.fil.translation.dashboard, {
  savedDescription: "Ang kasalukuyang claim ay naka-save nang 90 araw at maaaring ipagpatuloy mula sa huling hakbang.",
  resume: "Ipagpatuloy ang application",
  startNew: "Magsimula ng bagong claim",
  savedLabel: "Naka-save na application",
  savedTitle: "May application kang ginagawa",
  savedAtStep: "Huling na-save sa STEP {{step}}.",
  expiresAt: "Pagtatapos ng retention: {{date}}",
  ninetyDays: "90 araw mula sa huling save",
  continueWriting: "Ipagpatuloy",
});

const claimDetailTranslations = {
  ko: (resources.ko.translation as unknown as { claimDetail: object }).claimDetail,
  en: (resources.en.translation as unknown as { claimDetail: object }).claimDetail,
  vi: (resources.vi.translation as unknown as { claimDetail: object }).claimDetail,
  fil: (resources.fil.translation as unknown as { claimDetail: object }).claimDetail,
};

Object.assign(claimDetailTranslations.ko, {
  loadingDescription: "선택한 신청의 작성 내용과 제출 서류를 확인하고 있습니다.",
  retentionNotice: "개인정보처리법에 의거하여 사용자가 조회 가능한 기간은 신청 완료일로부터 30일 이내이며, 최대 1년까지 소유하고 있습니다.\n만일 30일이 지난 후에 자료가 필요할 경우엔 별도로 문의하셔야합니다.",
  generatedDocumentsTitle: "최종 생성 서류",
  generatedDocumentsHelp: "8단계에서 확정한 PDF를 완료일로부터 30일 동안 다시 확인할 수 있습니다.",
  noGeneratedDocuments: "아직 저장된 최종 생성 서류가 없습니다.",
  generatedDocumentStored: "암호화 보관 중",
  generatedDocumentOpenFailed: "최종 생성 서류를 열지 못했습니다.",
  downloadPackage: "ZIP 다시 받기",
  downloadingPackage: "ZIP 생성 중…",
  packageDownloadFailed: "최종 제출 ZIP을 내려받지 못했습니다.",
});
Object.assign(claimDetailTranslations.en, {
  loadingDescription: "Checking the entered information and submitted documents for this application.",
  retentionNotice: "Under the Personal Information Protection Act, users may access records within 30 days of application completion. Records may be retained for up to one year.\nIf you need records after 30 days, you must contact us separately.",
  generatedDocumentsTitle: "Final generated documents",
  generatedDocumentsHelp: "Review the PDFs confirmed in step 8 for 30 days after completion.",
  noGeneratedDocuments: "No final generated documents have been stored yet.",
  generatedDocumentStored: "Stored with encryption",
  generatedDocumentOpenFailed: "The final generated document could not be opened.",
  downloadPackage: "Download ZIP again",
  downloadingPackage: "Building ZIP…",
  packageDownloadFailed: "The final submission ZIP could not be downloaded.",
});
Object.assign(claimDetailTranslations.vi, {
  loadingDescription: "Đang kiểm tra nội dung đã nhập và tài liệu đã nộp của hồ sơ này.",
  retentionNotice: "Theo Luật Bảo vệ Thông tin Cá nhân, người dùng có thể xem hồ sơ trong 30 ngày kể từ ngày hoàn tất. Hồ sơ có thể được lưu giữ tối đa một năm.\nNếu cần tài liệu sau 30 ngày, bạn phải liên hệ riêng.",
  generatedDocumentsTitle: "Tài liệu cuối cùng đã tạo",
  generatedDocumentsHelp: "Xem lại các PDF đã xác nhận ở bước 8 trong 30 ngày sau khi hoàn tất.",
  noGeneratedDocuments: "Chưa có tài liệu cuối cùng nào được lưu.",
  generatedDocumentStored: "Được lưu trữ mã hóa",
  generatedDocumentOpenFailed: "Không thể mở tài liệu cuối cùng.",
  downloadPackage: "Tải lại ZIP",
  downloadingPackage: "Đang tạo ZIP…",
  packageDownloadFailed: "Không thể tải ZIP hồ sơ cuối cùng.",
});
Object.assign(claimDetailTranslations.fil, {
  loadingDescription: "Sinusuri ang inilagay na impormasyon at mga dokumentong isinumite para sa application na ito.",
  retentionNotice: "Sa ilalim ng Personal Information Protection Act, maaaring tingnan ang records sa loob ng 30 araw mula sa pagkumpleto. Maaaring itago ang records nang hanggang isang taon.\nKung kailangan ang records pagkalipas ng 30 araw, kailangang makipag-ugnayan nang hiwalay.",
  generatedDocumentsTitle: "Mga huling nabuong dokumento",
  generatedDocumentsHelp: "Tingnan muli ang mga PDF na kinumpirma sa step 8 sa loob ng 30 araw.",
  noGeneratedDocuments: "Wala pang nakaimbak na final generated documents.",
  generatedDocumentStored: "Naka-encrypt na imbakan",
  generatedDocumentOpenFailed: "Hindi mabuksan ang final generated document.",
  downloadPackage: "I-download muli ang ZIP",
  downloadingPackage: "Ginagawa ang ZIP…",
  packageDownloadFailed: "Hindi ma-download ang final submission ZIP.",
});

const languageNames: Record<SupportedLanguage, string> = Object.fromEntries(
  supportedLanguages.map((code) => [code, languageOptions[code].nativeName]),
) as Record<SupportedLanguage, string>;
type TranslationResource = { translation: Record<string, unknown>; ui?: Record<string, string> };
const normalizedResources = resources as unknown as Record<string, TranslationResource>;

for (const resource of Object.values(normalizedResources)) {
  resource.translation.languages = languageNames;
}

// Keep the complete English UI copy as a fallback while preserving the selected
// locale for API requests and locale-aware formatting.
for (const code of ["th", "km", "zh", "ja"] as const) {
  normalizedResources[code] = {
    translation: {
      ...normalizedResources.en.translation,
      languages: languageNames,
    },
  };
}

for (const code of supportedLanguages) {
  normalizedResources[code].translation.extra = extraUi[code];
  normalizedResources[code].translation.demo = demoTranslations[code];
  normalizedResources[code].ui = uiResources[code];
}

const storedLanguage = localStorage.getItem("sanjae-language");
const initialLanguage = supportedLanguages.includes(storedLanguage as SupportedLanguage)
  ? storedLanguage!
  : "ko";

void i18n.use(initReactI18next).init({
  resources: normalizedResources,
  lng: initialLanguage,
  fallbackLng: "ko",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (language) => {
  localStorage.setItem("sanjae-language", language);
  document.documentElement.lang = language;
});

document.documentElement.lang = initialLanguage;

export default i18n;
