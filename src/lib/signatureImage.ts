export const SIGNATURE_WIDTH = 960;
export const SIGNATURE_HEIGHT = 280;
export const MAX_SIGNATURE_FILE_BYTES = 5 * 1024 * 1024;

export function supportedSignatureFile(file: { type: string; size: number }): boolean {
  return ["image/png", "image/jpeg", "image/webp"].includes(file.type)
    && file.size > 0 && file.size <= MAX_SIGNATURE_FILE_BYTES;
}

// Remove white paper, preserve ink and existing transparency. Return actual ink count.
export function removeSignaturePaper(pixels: Uint8ClampedArray): number {
  let ink = 0;
  for (let index = 0; index < pixels.length; index += 4) {
    const lightestInkChannel = Math.min(pixels[index], pixels[index + 1], pixels[index + 2]);
    const alpha = Math.round(pixels[index + 3] * Math.min(1, Math.max(0, (248 - lightestInkChannel) / 40)));
    pixels[index + 3] = alpha;
    if (alpha > 32 && lightestInkChannel < 200) ink++;
  }
  return ink;
}

export async function readSignaturePhoto(file: File): Promise<string> {
  if (!supportedSignatureFile(file)) throw new Error("format");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("decode"));
      image.src = url;
    });
    if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 24_000_000) throw new Error("dimensions");
    const canvas = document.createElement("canvas");
    canvas.width = SIGNATURE_WIDTH;
    canvas.height = SIGNATURE_HEIGHT;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("canvas");
    const scale = Math.min(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    if (removeSignaturePaper(pixels.data) < 24) throw new Error("blank");
    context.putImageData(pixels, 0, 0);
    const value = canvas.toDataURL("image/png");
    if (value.length > 400_000) throw new Error("large");
    return value;
  } finally {
    URL.revokeObjectURL(url);
  }
}
