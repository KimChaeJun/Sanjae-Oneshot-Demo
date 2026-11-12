import { ui } from "../lib/uiTranslation";
import { Eraser, PenLine, ImageUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { readSignaturePhoto } from "../lib/signatureImage";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ChangeEvent,
} from "react";

interface SignaturePadProps {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  hint: string;
  clearLabel: string;
  onProcessingChange?: (processing: boolean) => void;
}

interface CanvasPoint {
  x: number;
  y: number;
}

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 280;

function canvasPoint(
  event: ReactPointerEvent<HTMLCanvasElement>,
): CanvasPoint {
  const canvas = event.currentTarget;
  const bounds = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - bounds.left) * (canvas.width / bounds.width),
    y: (event.clientY - bounds.top) * (canvas.height / bounds.height),
  };
}

function signatureContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.strokeStyle = "#17243a";
  context.fillStyle = "#17243a";
  context.lineWidth = 6;
  context.lineCap = "round";
  context.lineJoin = "round";
  return context;
}

export function SignaturePad({
  value,
  onChange,
  ariaLabel,
  hint,
  clearLabel,
  onProcessingChange,
}: SignaturePadProps) {
  useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadVersion = useRef(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const uploadLabel = ui("서명 사진 업로드");
  const drawingRef = useRef(false);
  const lastPointRef = useRef<CanvasPoint | null>(null);
  const [hasInk, setHasInk] = useState(Boolean(value));

  useEffect(() => () => { uploadVersion.current++; }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = signatureContext(canvas);
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(Boolean(value));
    if (!value) return;

    const image = new Image();
    let active = true;
    image.onload = () => {
      if (!active) return;
      const scale = Math.min(
        canvas.width / image.naturalWidth,
        canvas.height / image.naturalHeight,
      );
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        image,
        (canvas.width - width) / 2,
        (canvas.height - height) / 2,
        width,
        height,
      );
    };
    image.src = value;
    return () => { active = false; };
  }, [value]);

  async function uploadPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const version = ++uploadVersion.current;
    setUploading(true);
    onProcessingChange?.(true);
    setUploadError(false);
    try {
      const signature = await readSignaturePhoto(file);
      if (version === uploadVersion.current) onChange(signature);
    } catch {
      if (version === uploadVersion.current) setUploadError(true);
    } finally {
      if (version === uploadVersion.current) { setUploading(false); onProcessingChange?.(false); }
    }
  }

  function startDrawing(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (uploading) return;
    if (event.button !== 0 && event.pointerType === "mouse") return;
    const canvas = event.currentTarget;
    const context = signatureContext(canvas);
    if (!context) return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    const point = canvasPoint(event);
    drawingRef.current = true;
    lastPointRef.current = point;
    context.beginPath();
    context.arc(point.x, point.y, context.lineWidth / 2, 0, Math.PI * 2);
    context.fill();
    setHasInk(true);
  }

  function continueDrawing(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current || !lastPointRef.current) return;
    const context = signatureContext(event.currentTarget);
    if (!context) return;
    event.preventDefault();
    const point = canvasPoint(event);
    context.beginPath();
    context.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    context.lineTo(point.x, point.y);
    context.stroke();
    lastPointRef.current = point;
  }

  function finishDrawing(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    event.preventDefault();
    drawingRef.current = false;
    lastPointRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    onChange(event.currentTarget.toDataURL("image/png"));
  }

  function clearSignature() {
    uploadVersion.current++;
    setUploading(false);
    onProcessingChange?.(false);
    setUploadError(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = signatureContext(canvas);
    context?.clearRect(0, 0, canvas.width, canvas.height);
    drawingRef.current = false;
    lastPointRef.current = null;
    setHasInk(false);
    onChange("");
  }

  return (
    <div className="signature-pad">
      <div className="signature-pad-toolbar">
        <span><PenLine size={17} /> {hint}</span>
        <div className="signature-pad-buttons">
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden aria-label={uploadLabel} onChange={(event) => void uploadPhoto(event)} />
        <button type="button" className="outline-small" disabled={uploading} onClick={() => fileRef.current?.click()}><ImageUp size={15} /> {uploading ? ui("처리 중…") : uploadLabel}</button>
        <button
          type="button"
          className="outline-small"
          onClick={clearSignature}
          disabled={!hasInk && !uploading}
        >
          <Eraser size={15} /> {clearLabel}
        </button>
        </div>
      </div>
      {uploadError && <p className="signature-upload-error" role="alert">{ui("밝은 배경에 서명이 선명한 PNG·JPG·WebP(5MB 이하)를 선택해주세요. 빈 이미지와 손상된 파일은 사용할 수 없습니다.")}</p>}
      <div className="signature-pad-surface">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          aria-label={ariaLabel}
          onPointerDown={startDrawing}
          onPointerMove={continueDrawing}
          onPointerUp={finishDrawing}
          onPointerCancel={finishDrawing}
        />
        {!hasInk && <span className="signature-pad-placeholder">{hint}</span>}
      </div>
    </div>
  );
}
