import { ui } from "../lib/uiTranslation";
import {
  ArrowRight,
  CheckCircle2,
  FileWarning,
  HeartPulse,
  Info,
  LockKeyhole,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  REQUIRED_LEGAL_CONSENTS,
  allRequiredLegalConsentsAccepted,
  type LegalConsentPayload,
  type LegalConsentSelection,
  type RequiredLegalConsent,
  buildCurrentLegalConsentPayload,
} from "../lib/termsConsent";


interface TermsConsentStepProps {
  onAccept: (payload: LegalConsentPayload) => Promise<void> | void;
}

const emptySelection: LegalConsentSelection = {
  terms_accepted: false,
  privacy_accepted: false,
  sensitive_information_accepted: false,
  unique_identifier_accepted: false,
  document_truth_accepted: false,
};
export function TermsConsentStep({ onAccept }: TermsConsentStepProps) {
  useTranslation();
  const privacyOperatorName =
    import.meta.env.VITE_PRIVACY_OPERATOR_NAME?.trim() || ui("산재원샷 운영팀");
  const privacyOfficer =
    import.meta.env.VITE_PRIVACY_OFFICER_NAME?.trim() || ui("개인정보 보호책임자");
  const privacyContact =
    import.meta.env.VITE_PRIVACY_CONTACT_EMAIL?.trim() || ui("서비스 내 개인정보 문의 채널");

  const [selection, setSelection] = useState<LegalConsentSelection>(emptySelection);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const allAccepted = useMemo(
    () => allRequiredLegalConsentsAccepted(selection),
    [selection],
  );

  function toggle(key: RequiredLegalConsent, checked: boolean) {
    setSelection((current) => ({ ...current, [key]: checked }));
    setError("");
  }

  function toggleAll(checked: boolean) {
    setSelection(
      Object.fromEntries(
        REQUIRED_LEGAL_CONSENTS.map((key) => [key, checked]),
      ) as LegalConsentSelection,
    );
    setError("");
  }

  async function continueToService() {
    if (!allAccepted) {
      setError(ui("서비스 이용에 필요한 필수 항목에 모두 동의해주세요."));
      return;
    }
    setPending(true);
    setError("");
    try {
      await onAccept(buildCurrentLegalConsentPayload(selection));
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : ui("동의 기록을 저장하지 못했습니다. 잠시 후 다시 시도해주세요."),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="terms-step">
      <aside className="terms-safety-note">
        <ShieldCheck size={25} aria-hidden="true" />
        <div>
          <strong>{ui("동의 전에 알아두세요")}</strong>
          <p>
            {ui("동의를 거부할 권리가 있습니다. 다만 필수 동의를 거부하면 민감한 신청정보를 처리할 수 없어 서비스를 이용할 수 없습니다.")}</p>
        </div>
      </aside>

      <section className="terms-card" aria-label={ui("필수 약관과 개인정보 동의")}>
        <label className="consent-all">
          <input
            type="checkbox"
            checked={allAccepted}
            onChange={(event) => toggleAll(event.target.checked)}
          />
          <span>
            <CheckCircle2 size={22} aria-hidden="true" />
            <strong>{ui("필수 항목에 모두 동의합니다")}</strong>
            <small>{ui("각 항목을 열어 세부 내용을 확인할 수 있습니다.")}</small>
          </span>
        </label>

        <ConsentItem
          id="terms_accepted"
          checked={selection.terms_accepted}
          onChange={toggle}
          icon={<Scale size={22} aria-hidden="true" />}
          title={ui("서비스 이용약관")}
          defaultOpen
        >
          <h3>{ui("1. 서비스의 성격과 이용자 확인 의무")}</h3>
          <ul>
            <li>{ui("산재원샷은 산업재해 신청자료의 작성과 정리를 돕는 보조 도구이며, 근로복지공단의 공식 서비스나 법률·노무·의학 자문이 아닙니다.")}</li>
            <li>{ui("AI·OCR 결과와 자동 생성 문서는 참고자료입니다. 이용자는 제출 전에 사실관계, 금액, 날짜, 성명과 첨부문서를 직접 확인해야 합니다.")}</li>
            <li>{ui("서비스 이용 또는 문서 생성만으로 산재 승인, 보험급여 지급이나 법률상 권리가 보장되지 않습니다.")}</li>
          </ul>
          <h3>{ui("2. 금지행위와 책임")}</h3>
          <ul>
            <li>{ui("타인의 명의·문서를 권한 없이 사용하거나, 허위 사실을 입력하거나, 문서를 위조·변조하거나, 조작된 증거를 제출하는 행위를 금지합니다.")}</li>
            <li>{ui("이용자의 고의 또는 과실로 허위·조작 자료가 작성·제출되어 처리 지연, 불승인, 환수, 제재 또는 운영자·제3자의 손해가 발생한 경우 이용자는 관계 법령과 본인의 귀책 범위에서 책임을 부담합니다.")}</li>
            <li>{ui("운영자는 부정 이용이 합리적으로 의심되는 경우 이용 제한, 처리 중단, 관련 자료의 보존 및 법령에 따른 관계기관 협조 조치를 할 수 있습니다.")}</li>
            <li>{ui("이 조항은 운영자의 고의·중대한 과실, 개인정보 보호의무 또는 관계 법령상 책임을 면제하지 않습니다.")}</li>
          </ul>
        </ConsentItem>

        <ConsentItem
          id="privacy_accepted"
          checked={selection.privacy_accepted}
          onChange={toggle}
          icon={<LockKeyhole size={22} aria-hidden="true" />}
          title={ui("개인정보 수집·이용")}
        >
          <dl className="terms-data-grid">
            <div><dt>{ui("개인정보처리자")}</dt><dd>{privacyOperatorName}</dd></div>
            <div><dt>{ui("보호책임자·문의")}</dt><dd>{privacyOfficer} · {privacyContact}</dd></div>
            <div><dt>{ui("수집 항목")}</dt><dd>{ui("성명, 이메일, 연락처, 주소, 국적·언어, 생년월일, 서명, 계정정보, 사업장·고용정보, 사고 경위, 업로드 문서의 내용·파일정보, 서비스 이용 및 보안 기록")}</dd></div>
            <div><dt>{ui("이용 목적")}</dt><dd>{ui("회원 식별, 산재 신청 준비, OCR·AI 분석, 누락 점검, 신청서·제출 패키지 생성, 문의 대응, 보안 및 부정 이용 방지")}</dd></div>
            <div><dt>{ui("보유 기간")}</dt><dd>{ui("작성 중 신청은 마지막 저장일부터 90일간 보관 후 삭제합니다. 사용자가 삭제를 요청하면 신청내용과 첨부파일을 즉시 삭제합니다. 완료된 신청의 사용자 상세 조회는 신청일로부터 30일이며, 관리자가 실제 산재 처리가 완료됐음을 확인하면 그 시점부터 1년 뒤 신청자료와 첨부파일을 삭제합니다. 법령상 별도 보존의무가 있는 경우에만 해당 기간 동안 필요한 최소 범위를 분리 보관합니다.")}</dd></div>
            <div><dt>{ui("동의 거부")}</dt><dd>{ui("동의를 거부할 수 있으나, 필수정보를 처리할 수 없어 계정 생성과 신청 준비 서비스를 이용할 수 없습니다.")}</dd></div>
            <div><dt>{ui("처리위탁")}</dt><dd>{ui("Supabase(인증·데이터베이스·파일 저장), Amazon Web Services(서버·보안로그·승인메일), OpenAI(AI 초안·사실 점검)를 사용합니다. OCR은 서비스 서버의 PaddleOCR로 처리하며, 수탁자와는 보호의무를 정하고 처리현황을 점검합니다.")}</dd></div>
            <div><dt>{ui("AI 제공 최소화")}</dt><dd>{ui("OpenAI에는 신청서 전체나 원본 파일을 보내지 않고 AI 기능에 필요한 텍스트만 가명·마스킹하여 전송합니다. API 요청은 모델 학습에 사용되지 않도록 운영하고 응답 저장을 끈 상태(store=false)로 호출합니다. 다만 기본 악용방지 로그에는 최대 30일간 내용이 포함될 수 있어, 운영자는 가능한 경우 Zero Data Retention 승인을 적용합니다.")}</dd></div>
            <div><dt>{ui("국외 이전")}</dt><dd>{ui("OpenAI AI 처리 시 최소화된 텍스트가 암호화된 통신으로 국외 처리시설에 이전될 수 있습니다. 이전 시점은 AI 기능을 요청한 때, 방법은 전용 API 전송이며 목적·항목·보유기간은 위 내용과 같습니다. Supabase 프로젝트와 AWS 운영 리전은 대한민국 서울 리전을 우선 사용합니다.")}</dd></div>
            <div><dt>{ui("자동화 처리")}</dt><dd>{ui("OCR·AI 결과는 작성 보조 및 누락 알림에만 사용합니다. 산재 인정 여부나 권리를 자동으로 결정하지 않으며 이용자와 담당자가 원문을 확인·수정할 수 있습니다.")}</dd></div>
            <div><dt>{ui("정보주체 권리")}</dt><dd>{ui("열람·정정·삭제·처리정지·동의철회를 요청할 수 있습니다. 요청은 위 문의처에서 본인 확인 후 처리하며, 법령상 보존 의무가 있는 자료는 분리 보관 후 만료 시 삭제합니다.")}</dd></div>
          </dl>
        </ConsentItem>

        <ConsentItem
          id="sensitive_information_accepted"
          checked={selection.sensitive_information_accepted}
          onChange={toggle}
          icon={<HeartPulse size={22} aria-hidden="true" />}
          title={ui("민감정보 처리")}
        >
          <dl className="terms-data-grid">
            <div><dt>{ui("처리 항목")}</dt><dd>{ui("상병명, 진단·검사·치료·입원·수술·장해 정보, 의료기관과 진료기록, 사고 당시의 신체상태 및 건강 관련 증빙")}</dd></div>
            <div><dt>{ui("이용 목적")}</dt><dd>{ui("산재 신청서 작성 지원, 제출 필요자료 확인, 문서 OCR, AI 초안 생성과 사실관계 점검")}</dd></div>
            <div><dt>{ui("보유 기간")}</dt><dd>{ui("개인정보 수집·이용 동의의 보유 기간과 동일합니다.")}</dd></div>
            <div><dt>{ui("동의 거부")}</dt><dd>{ui("건강정보 처리 동의를 별도로 거부할 수 있으나, 산재 신청 준비의 핵심 기능을 제공할 수 없습니다.")}</dd></div>
          </dl>
        </ConsentItem>

        <ConsentItem
          id="unique_identifier_accepted"
          checked={selection.unique_identifier_accepted}
          onChange={toggle}
          icon={<ShieldCheck size={22} aria-hidden="true" />}
          title={ui("고유식별정보 처리")}
        >
          <dl className="terms-data-grid">
            <div><dt>{ui("처리 항목")}</dt><dd>{ui("외국인등록번호(해당 이용자가 선택하여 입력한 경우에 한함)")}</dd></div>
            <div><dt>{ui("이용 목적")}</dt><dd>{ui("신청인 식별과 공식 신청서 작성 지원")}</dd></div>
            <div><dt>{ui("보유 기간")}</dt><dd>{ui("개인정보 수집·이용 동의의 보유 기간과 동일하며 암호화하여 보관합니다.")}</dd></div>
            <div><dt>{ui("주민등록번호")}</dt><dd>{ui("현재 서비스에서는 주민등록번호를 수집하지 않습니다. 향후 법령이 구체적으로 처리를 요구하거나 허용하는 별도 기능이 필요한 경우에만 개인정보 보호법 제24조의2가 정한 절차와 보호조치를 적용합니다.")}</dd></div>
            <div><dt>{ui("동의 거부")}</dt><dd>{ui("별도 동의를 거부할 수 있으나, 해당 식별정보가 필요한 신청서 작성 기능이 제한될 수 있습니다.")}</dd></div>
          </dl>
        </ConsentItem>

        <ConsentItem
          id="document_truth_accepted"
          checked={selection.document_truth_accepted}
          onChange={toggle}
          icon={<FileWarning size={22} aria-hidden="true" />}
          title={ui("제출정보·서류 진실성 확인")}
        >
          <div className="truth-confirmation">
            <strong>{ui("이용자는 다음 사항을 확인합니다.")}</strong>
            <ul>
              <li>{ui("입력 내용과 업로드 문서는 본인 또는 적법한 권한을 가진 자료이며, 알고 있는 범위에서 진실하고 정확합니다.")}</li>
              <li>{ui("허위 진술, 타인 문서의 무단 사용, 문서 위조·변조 및 조작된 자료 제출을 하지 않습니다.")}</li>
              <li>{ui("제출 전 자동 추출·생성된 내용을 직접 검토하고 오류를 수정합니다.")}</li>
              <li>{ui("악의적이거나 중대한 과실에 의한 부정행위로 발생한 손해와 불이익에 대해 관계 법령과 귀책 범위에 따른 책임을 부담합니다.")}</li>
            </ul>
          </div>
        </ConsentItem>

        <div className="law-reference-links">
          <span>{ui("법적 참고 근거")}</span>
          <a href="https://www.law.go.kr/법령/개인정보보호법" target="_blank" rel="noreferrer">{ui("개인정보 보호법 제15·23·24·24조의2")}</a>
          <a href="https://www.law.go.kr/법령/약관의규제에관한법률" target="_blank" rel="noreferrer">{ui("약관규제법 제6·7조")}</a>
          <a href="https://www.law.go.kr/법령/형법" target="_blank" rel="noreferrer">{ui("형법 제225·229·231·234조")}</a>
        </div>

        {error && <div className="auth-message error" role="alert">{ui(error)}</div>}
      </section>

      <footer className="wizard-actions">
        <p><Info size={15} /> {ui("동의 기록은 계정에 안전하게 저장됩니다.")}</p>
        <button
          type="button"
          className="primary-button"
          disabled={!allAccepted || pending}
          onClick={() => void continueToService()}
        >
          {pending ? ui("동의 기록 중...") : ui("동의하고 다음")}
          <ArrowRight size={19} aria-hidden="true" />
        </button>
      </footer>
    </div>
  );
}

interface ConsentItemProps {
  id: RequiredLegalConsent;
  checked: boolean;
  onChange: (key: RequiredLegalConsent, checked: boolean) => void;
  icon: React.ReactNode;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function ConsentItem({
  id,
  checked,
  onChange,
  icon,
  title,
  defaultOpen = false,
  children,
}: ConsentItemProps) {
  useTranslation();
  return (
    <article className={`consent-item${checked ? " accepted" : ""}`}>
      <label className="consent-item-check">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(id, event.target.checked)}
        />
        <span className="consent-item-icon">{icon}</span>
        <span>
          <small>{ui("필수")}</small>
          <strong>{title}</strong>
        </span>
      </label>
      <details open={defaultOpen ? true : undefined}>
        <summary>{ui("세부 내용 보기")}</summary>
        <div className="consent-detail">{children}</div>
      </details>
    </article>
  );
}
