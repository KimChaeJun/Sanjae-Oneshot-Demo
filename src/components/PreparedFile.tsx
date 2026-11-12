import { useEffect, useRef, useState } from "react";
import { ui } from "../lib/uiTranslation";
import type { BrowserFile } from "../lib/browserFile";


export function usePreparedFile() {
  const [file, setFile] = useState<BrowserFile | null>(null);
  useEffect(() => () => { if (file) URL.revokeObjectURL(file.url); }, [file]);
  return [file, setFile] as const;
}

export function PreparedDownload({ file }: { file: BrowserFile | null }) {
  if (!file) return null;
  return <div className="prepared-download" role="status">
    <p>{ui("파일이 준비되었습니다. 다운로드가 시작되지 않으면 아래 링크를 눌러주세요.")}</p>
    <a className="outline-button" href={file.url} download={file.fileName}>{ui("ZIP 파일 저장")}</a>
  </div>;
}

export function DocumentPreview({ file, onClose }: { file: BrowserFile | null; onClose: () => void }) {
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    if (file) {
      panel.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      panel.current?.focus({ preventScroll: true });
    }
  }, [file]);
  if (!file) return null;
  return <section ref={panel} className="document-preview panel" tabIndex={-1} aria-label={ui("문서 미리보기")}>
    <div className="document-preview-toolbar">
      <h2>{file.fileName}</h2>
      <a className="outline-button" href={file.url} download={file.fileName}>{ui("문서 파일 저장")}</a>
      <button className="outline-button" type="button" onClick={onClose}>{ui("미리보기 닫기")}</button>
    </div>
    {file.mimeType.startsWith("image/")
      ? <img src={file.url} alt={file.fileName} />
      : <p>화면 체험용 예시 문서입니다.</p>}
  </section>;
}
