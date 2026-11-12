import { ui } from "../lib/uiTranslation";
import { ALargeSmall, Check, Clock3, Menu, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useTranslation } from "react-i18next";

import { getLocalizedLanguageLabel, getSortedLanguageOptions, type SupportedLanguage } from "../i18n";
import { getAuthSession } from "../lib/api";
import type { View } from "../types";
import { Brand } from "./Brand";

function FlagIcon({ code }: { code: SupportedLanguage }) {
  if (code === "ko") {
    return (
      <svg className="language-flag" viewBox="0 0 24 16" aria-hidden="true" focusable="false">
        <rect x=".5" y=".5" width="23" height="15" rx="1.5" fill="#fff" stroke="#d9dde5" />
        <g transform="rotate(33 12 8)">
          <path d="M9 8a3 3 0 0 1 6 0c0 1.66-1.34 3-3 3s-3-1.34-3-3Z" fill="#2458a6" />
          <path d="M15 8a3 3 0 0 1-6 0c0-1.66 1.34-3 3-3s3 1.34 3 3Z" fill="#d72f43" />
          <circle cx="10.5" cy="8" r="1.5" fill="#2458a6" />
          <circle cx="13.5" cy="8" r="1.5" fill="#d72f43" />
        </g>
        <path d="m3.2 4.4 2.7-1.6m-2.2 2.4 2.7-1.6m11.2 8.8 2.7-1.6m-3.2.8 2.7-1.6M4.1 11.7l2.6 1.5m-2.1-2.4 2.6 1.5m10-8.6 2.6 1.5m-2.1-2.4 2.6 1.5" stroke="#16181c" strokeWidth=".7" />
      </svg>
    );
  }

  if (code === "en") {
    return (
      <svg className="language-flag" viewBox="0 0 24 16" aria-hidden="true" focusable="false">
        <rect width="24" height="16" rx="1.5" fill="#fff" />
        {[0, 2.46, 4.92, 7.38, 9.84, 12.3, 14.76].map((y) => <rect key={y} y={y} width="24" height="1.23" fill="#d9233f" />)}
        <rect width="10.5" height="8.6" rx="1" fill="#28468a" />
        <g fill="#fff">
          {[2, 5.2, 8.4].flatMap((x) => [1.7, 4.3, 6.9].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r=".45" />))}
        </g>
      </svg>
    );
  }

  if (code === "vi") {
    return (
      <svg className="language-flag" viewBox="0 0 24 16" aria-hidden="true" focusable="false">
        <rect width="24" height="16" rx="1.5" fill="#da251d" />
        <path d="m12 3 1.18 3.1 3.32.16-2.58 2.1.88 3.2L12 9.75l-2.8 1.81.88-3.2-2.58-2.1 3.32-.16L12 3Z" fill="#ffdf00" />
      </svg>
    );
  }

  if (code === "th") {
    return (
      <svg className="language-flag" viewBox="0 0 24 16" aria-hidden="true" focusable="false">
        <path d="M0 0h24v16H0z" fill="#a51931" />
        <path d="M0 2.7h24v10.6H0z" fill="#f4f5f8" />
        <path d="M0 5.3h24v5.4H0z" fill="#2d2a4a" />
      </svg>
    );
  }

  if (code === "km") {
    return (
      <svg className="language-flag" viewBox="0 0 24 16" aria-hidden="true" focusable="false">
        <path d="M0 0h24v16H0z" fill="#032ea1" />
        <path d="M0 4h24v8H0z" fill="#e00025" />
        <path d="M7 10.5h10l-1-1.4h-1V6.8h-1.5V5.5h-3V6.8H9v2.3H8z" fill="#fff" />
      </svg>
    );
  }

  if (code === "zh") {
    return (
      <svg className="language-flag" viewBox="0 0 24 16" aria-hidden="true" focusable="false">
        <rect width="24" height="16" rx="1.5" fill="#de2910" />
        <path d="m4.6 2.1.7 1.7 1.8.1-1.4 1.2.5 1.8-1.6-1-1.5 1 .5-1.8-1.4-1.2 1.8-.1.7-1.7Z" fill="#ffde00" />
      </svg>
    );
  }

  if (code === "ja") {
    return (
      <svg className="language-flag" viewBox="0 0 24 16" aria-hidden="true" focusable="false">
        <rect x=".5" y=".5" width="23" height="15" rx="1.5" fill="#fff" stroke="#d9dde5" />
        <circle cx="12" cy="8" r="3.4" fill="#bc002d" />
      </svg>
    );
  }

  return (
    <svg className="language-flag" viewBox="0 0 24 16" aria-hidden="true" focusable="false">
      <path d="M0 0h24v8H0z" fill="#244fa2" />
      <path d="M0 8h24v8H0z" fill="#cf293d" />
      <path d="M0 0v16L10 8 0 0Z" fill="#fff" />
      <circle cx="3.2" cy="8" r="1.35" fill="#f5d328" />
      <g fill="#f5d328"><circle cx="1.8" cy="3" r=".55" /><circle cx="1.8" cy="13" r=".55" /><circle cx="7.6" cy="8" r=".55" /></g>
    </svg>
  );
}

interface HeaderProps {
  loggedIn: boolean;
  isAdmin: boolean;
  sessionRemainingMs: number;
  sessionCountdownActive: boolean;
  onNavigate: (view: View) => void;
  onLogout: () => void;
}

function formatSessionTime(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1_000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function Header({
  loggedIn,
  isAdmin,
  sessionRemainingMs,
  sessionCountdownActive,
  onNavigate,
  onLogout,
}: HeaderProps) {
  const { t, i18n } = useTranslation();
  const language = (i18n.resolvedLanguage?.split("-")[0] ?? "ko") as SupportedLanguage;
  const sortedLanguageOptions = getSortedLanguageOptions(i18n.resolvedLanguage);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const accessibilityToggleRef = useRef<HTMLButtonElement>(null);
  const modalCancelRef = useRef<HTMLButtonElement>(null);
  const modalConfirmRef = useRef<HTMLButtonElement>(null);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [elderFriendlyUi, setElderFriendlyUi] = useState(
    () => (localStorage.getItem("sanjae-senior-ui")
      ?? localStorage.getItem("sanjae-large-text")) === "true",
  );
  const [uiChangeModalOpen, setUiChangeModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("elder-friendly-mode", elderFriendlyUi);
    localStorage.setItem("sanjae-senior-ui", String(elderFriendlyUi));
    localStorage.removeItem("sanjae-large-text");
  }, [elderFriendlyUi]);

  useEffect(() => {
    if (!uiChangeModalOpen) return;
    setLanguageMenuOpen(false);
    modalConfirmRef.current?.focus();

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setUiChangeModalOpen(false);
      accessibilityToggleRef.current?.focus();
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [uiChangeModalOpen]);

  useEffect(() => {
    if (!languageMenuOpen) return;

    function closeOnOutsideClick(event: MouseEvent) {
      if (!languageMenuRef.current?.contains(event.target as Node)) {
        setLanguageMenuOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setLanguageMenuOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [languageMenuOpen]);

  function changeLanguage(nextLanguage: SupportedLanguage) {
    void i18n.changeLanguage(nextLanguage);
    setLanguageMenuOpen(false);
  }

  function closeUiChangeModal() {
    setUiChangeModalOpen(false);
    accessibilityToggleRef.current?.focus();
  }

  function confirmUiChange() {
    setElderFriendlyUi((current) => !current);
    setUiChangeModalOpen(false);
    accessibilityToggleRef.current?.focus();
  }

  function keepFocusInUiModal(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;
    const first = modalCancelRef.current;
    const last = modalConfirmRef.current;
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  if (loggedIn && isAdmin) {
    const adminEmail = getAuthSession()?.email ?? "admin@sanjae.kr";
    return (
      <div className="header-stack admin-header-stack">
        <header className="admin-site-header">
          <button type="button" className="admin-brand-button" onClick={() => onNavigate("admin")}>
            <span className="admin-brand-mark" aria-hidden="true">A</span>
            <span className="admin-brand-copy">
              <strong>{ui("산재원샷 Admin")}</strong>
              <small>{ui("운영·검수 콘솔")}</small>
            </span>
          </button>
          <nav className="admin-header-actions" aria-label={ui("관리자 메뉴")}>
            <span className="admin-role-badge">{ui("관리자")}</span>
            <span className="admin-header-email">{adminEmail}</span>
            <button type="button" className="admin-logout-button" onClick={onLogout}>{ui("로그아웃")}</button>
          </nav>
          <button type="button" className="admin-mobile-menu" aria-label={ui("관리자 메뉴")} onClick={() => onNavigate("admin")}>
            <Menu size={18} />
          </button>
        </header>
      </div>
    );
  }

  return (
    <div className="header-stack">
      <div className="gov-strip">
        <FlagIcon code="ko" />
        {t("common.notice")}
      </div>
      <header className="site-header">
        <button type="button" className="brand-button" onClick={() => onNavigate(loggedIn ? "dashboard" : "login")}>
          <Brand />
        </button>
        <nav className="header-actions" aria-label={t("common.mainMenu")}>
          <button
            type="button"
            ref={accessibilityToggleRef}
            className={`accessibility-toggle${elderFriendlyUi ? " active" : ""}`}
            aria-label={t(elderFriendlyUi ? "common.largeTextDisable" : "common.largeTextEnable")}
            aria-pressed={elderFriendlyUi}
            title={t(elderFriendlyUi ? "common.largeTextDisable" : "common.largeTextEnable")}
            onClick={() => setUiChangeModalOpen(true)}
          >
            <ALargeSmall size={23} aria-hidden="true" />
          </button>
          <div className="language-menu" ref={languageMenuRef}>
            <button
              type="button"
              className="language-trigger"
              aria-label={`${t("common.language")}: ${getLocalizedLanguageLabel(language, i18n.resolvedLanguage)}`}
              aria-haspopup="listbox"
              aria-expanded={languageMenuOpen}
              onClick={() => setLanguageMenuOpen((current) => !current)}
            >
              <FlagIcon code={language} />
            </button>
            {languageMenuOpen && (
              <div className="language-options" role="listbox" aria-label={t("common.language")}>
                {sortedLanguageOptions.map(({ code, label }) => {
                  const selected = language === code;
                  return (
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={selected ? "selected" : ""}
                      key={code}
                      onClick={() => changeLanguage(code)}
                    >
                      <FlagIcon code={code} />
                      <span>{label}</span>
                      {selected && <Check size={16} aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {loggedIn && (
            <>
              {!isAdmin && (
                <div
                  className={`session-timer${sessionCountdownActive ? " counting" : ""}`}
                  role="status"
                  aria-label={t(
                    sessionCountdownActive ? "common.sessionRemaining" : "common.sessionPaused",
                    { time: formatSessionTime(sessionRemainingMs) },
                  )}
                  title={t(
                    sessionCountdownActive ? "common.sessionRemaining" : "common.sessionPaused",
                    { time: formatSessionTime(sessionRemainingMs) },
                  )}
                >
                  <Clock3 size={18} aria-hidden="true" />
                  <strong>{formatSessionTime(sessionRemainingMs)}</strong>
                </div>
              )}
              {isAdmin && <button type="button" className="text-button admin-link" onClick={() => onNavigate("admin")}><ShieldCheck size={17} /> {ui("관리자 검수")}</button>}
              {!isAdmin && <button type="button" className="text-button" onClick={() => onNavigate("mypage")}><UserRound size={17} /> {t("common.myPage")}</button>}
              <button type="button" className="outline-small" onClick={onLogout}>{t("common.logout")}</button>
            </>
          )}
          <button type="button" className="menu-button" aria-label={t("common.menu")}><Menu size={22} /></button>
        </nav>
      </header>
      {uiChangeModalOpen && (
        <div className="ui-confirm-backdrop" onMouseDown={closeUiChangeModal}>
          <div
            className="ui-confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="ui-change-title"
            aria-describedby="ui-change-description"
            onKeyDown={keepFocusInUiModal}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <span className="ui-confirm-icon" aria-hidden="true"><ALargeSmall size={27} /></span>
            <h2 id="ui-change-title">{t("common.uiChangeTitle")}</h2>
            <p id="ui-change-description">
              {t(elderFriendlyUi ? "common.uiChangeToDefault" : "common.uiChangeToSenior")}
            </p>
            <div className="ui-confirm-actions">
              <button
                type="button"
                ref={modalCancelRef}
                className="outline-button"
                onClick={closeUiChangeModal}
              >
                {t("common.uiChangeCancel")}
              </button>
              <button
                type="button"
                ref={modalConfirmRef}
                className="primary-button"
                onClick={confirmUiChange}
              >
                {t("common.uiChangeConfirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
