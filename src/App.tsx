import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, FileText, Play, RotateCcw, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Header } from './components/Header';
import { AuthIntro } from './components/AuthIntro';
import { ApplicationWizard } from './pages/ApplicationWizard';
import { DashboardPage } from './pages/DashboardPage';
import { MyPage } from './pages/MyPage';
import { ClaimDetailPage } from './pages/ClaimDetailPage';
import { clearDemo } from './demo/transport';
import { profile, aiResult } from './demo/fixtures';
import type { View } from './types';
import './demo.css';

export default function App() {
  const { t } = useTranslation();
  const [view, setView] = useState<View>('login');
  const [claimId, setClaimId] = useState<string | null>(null);
  const [run, setRun] = useState(0);
  const [preview, setPreview] = useState(false);
  const [toast, setToast] = useState('');
  const closeButton = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    window.history.replaceState({ view: 'login' }, '', window.location.pathname);
    const pop = (event: PopStateEvent) => {
      const state = event.state as { view?: View; claimId?: string } | null;
      setView(state?.view ?? 'login'); setClaimId(state?.claimId ?? null);
    };
    const showPreview = () => setPreview(true);
    window.addEventListener('popstate', pop); window.addEventListener('demo-package-preview', showPreview);
    return () => { window.removeEventListener('popstate', pop); window.removeEventListener('demo-package-preview', showPreview); };
  }, []);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [view]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 3200); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => {
    if (!preview) return;
    previousFocus.current = document.activeElement as HTMLElement; closeButton.current?.focus();
    const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') setPreview(false); if (e.key === 'Tab') { e.preventDefault(); closeButton.current?.focus(); } };
    window.addEventListener('keydown', escape);
    return () => { window.removeEventListener('keydown', escape); document.body.style.overflow = overflow; previousFocus.current?.focus(); };
  }, [preview]);
  function navigate(next: View, id: string | null = null) {
    if (next === 'profile-edit') { setToast('체험용 기본 정보입니다. 신청 화면에서 예시 정보를 수정해볼 수 있어요.'); return; }
    window.history.pushState({ view: next, claimId: id, applicationStep: 1 }, '', `#/${next}`);
    setClaimId(id); setView(next);
  }
  function reset() { clearDemo(); setRun(value => value + 1); navigate('login'); }
  function start(id: string | null = null) { setRun(value => value + 1); navigate('application', id); }
  return <div className="app-shell demo-shell">
    <Header loggedIn={view !== 'login'} isAdmin={false} sessionRemainingMs={3600000} sessionCountdownActive={false} onNavigate={navigate} onLogout={() => navigate('login')} />
    <aside className="demo-banner" aria-label="데모 안내"><div><span className="demo-badge"><Play size={11} fill="currentColor" /> INTERACTIVE DEMO</span><span>예시 데이터로 체험해보세요. <b>실제 전송·접수는 이루어지지 않아요.</b></span></div><button type="button" onClick={reset}><RotateCcw size={14} /> 처음부터</button></aside>
    {view === 'login' && <main className="login-page page-shell demo-entry"><AuthIntro /><section className="login-card demo-welcome">
      <span className="demo-welcome-icon"><Play size={27} fill="currentColor" /></span><span className="section-kicker">직접 둘러보는 산재원샷</span>
      <h2>신청 준비의 처음부터 끝까지,<br />가볍게 체험해보세요.</h2><p>별도 가입이나 서류 준비 없이<br />실제 서비스의 화면 흐름을 살펴볼 수 있어요.</p>
      <ul><li><Check size={17} /> 예시 정보와 서류가 미리 채워져 있어요</li><li><Check size={17} /> 버튼을 누르며 내 속도로 둘러보세요</li><li><Check size={17} /> 약 2~3분이면 전체 흐름을 확인해요</li></ul>
      <button className="primary-button demo-start" onClick={() => navigate('dashboard')}>데모 시작하기 <ArrowRight size={19} /></button><button className="link-button demo-direct" onClick={() => start()}>바로 신청 화면 체험하기 <ArrowRight size={15} /></button><small>화면 체험용입니다. 개인정보나 실제 서류를 입력하지 않아도 됩니다.</small>
    </section></main>}
    {view === 'dashboard' && <DashboardPage key={`dashboard-${run}`} fallbackUserName={profile.name} onStart={() => start()} onResume={start} onMyPage={() => navigate('mypage')} />}
    {run > 0 && <div hidden={view !== 'application'}><ApplicationWizard key={run} initialClaimId={claimId} legalConsentAccepted={true} onAcceptLegalTerms={() => true} onExit={() => navigate('dashboard')} /></div>}
    {view === 'mypage' && <MyPage onStart={() => start()} onResume={start} onOpenClaim={id => navigate('claim-detail', id)} onEditProfile={() => navigate('profile-edit')} />}
    {view === 'claim-detail' && claimId && <ClaimDetailPage claimId={claimId} onBack={() => navigate('mypage')} />}
    <footer className="site-footer"><div><strong>{t('common.brand')}</strong><span>프로젝트 화면 체험</span></div><div className="site-footer-notice"><p>근로복지공단 공식 서비스가 아닙니다. OCR·AI 결과와 점수는 고정된 예시이며 실제 분석이 수행되지 않습니다.</p><p>새로고침하면 체험 정보가 초기화됩니다.</p></div></footer>
    {toast && <div className="demo-toast" role="status">{toast}</div>}
    {preview && <div className="demo-modal-backdrop" onMouseDown={() => setPreview(false)}><section className="demo-result-modal" role="dialog" aria-modal="true" aria-labelledby="demo-result-title" onMouseDown={e => e.stopPropagation()}>
      <button ref={closeButton} className="demo-modal-close" onClick={() => setPreview(false)} aria-label="미리보기 닫기"><X size={22} /></button><span className="section-kicker">제출 준비 패키지 · 화면 예시</span><h2 id="demo-result-title">이렇게 서류를 정리해드려요.</h2><p>데모에서는 실제 PDF 생성과 다운로드를 진행하지 않습니다.</p>
      <div className="demo-document-tabs"><span><FileText size={16} /> 신청 정보서</span><span><FileText size={16} /> 재해경위서</span></div>
      <article className="demo-paper"><small>산재원샷 · 체험용 예시</small><h3>재해경위서</h3><dl><div><dt>신청인</dt><dd>김민준 (가상 인물)</dd></div><div><dt>사고 일시</dt><dd>2026년 8월 20일 10:30</dd></div><div><dt>사업장</dt><dd>한빛물류 주식회사 (가상 사업장)</dd></div></dl><h4>사고 경위</h4><p>{aiResult.generated_statement_ko}</p><div className="demo-paper-sign">신청인 <strong>김민준</strong> (예시)</div><div className="demo-watermark">DEMO · 제출용으로 사용할 수 없습니다</div></article>
    </section></div>}
  </div>;
}
