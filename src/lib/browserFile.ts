export interface BrowserFile {
  url: string;
  fileName: string;
  mimeType: string;
  blob: Blob;
}

/** The view owns this URL and must revoke it on replacement or unmount. */
export function prepareBrowserFile(blob: Blob, fileName: string): BrowserFile {
  return { url: URL.createObjectURL(blob), fileName, mimeType: blob.type, blob };
}

/** Best effort only; always retain a visible user-clickable download link. */
export function startBrowserDownload(file: BrowserFile, root: Document = document): void {
  const anchor = root.createElement("a");
  anchor.href = file.url;
  anchor.download = file.fileName;
  root.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
