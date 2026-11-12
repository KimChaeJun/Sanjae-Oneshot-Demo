export interface WritableFileLike {
  write(data: Blob): Promise<void>;
  close(): Promise<void>;
}

export interface FileHandleLike {
  createWritable(): Promise<WritableFileLike>;
}

export interface DirectoryHandleLike {
  getFileHandle(name: string, options: { create: boolean }): Promise<FileHandleLike>;
}

export interface DirectoryPickerWindow {
  showDirectoryPicker?: (options: { mode: "readwrite" }) => Promise<DirectoryHandleLike>;
  showSaveFilePicker?: (options: {
    suggestedName: string;
    types: Array<{
      description: string;
      accept: Record<string, string[]>;
    }>;
  }) => Promise<FileHandleLike>;
}

export interface PackageDestinationSelection {
  cancelled: boolean;
  directory: DirectoryHandleLike | null;
  file: FileHandleLike | null;
}

export async function selectPackageDestination(
  pickerWindow: DirectoryPickerWindow,
  fileName: string,
): Promise<PackageDestinationSelection> {
  try {
    if (pickerWindow.showDirectoryPicker) {
      return {
        cancelled: false,
        directory: await pickerWindow.showDirectoryPicker({ mode: "readwrite" }),
        file: null,
      };
    }
    if (pickerWindow.showSaveFilePicker) {
      return {
        cancelled: false,
        directory: null,
        file: await pickerWindow.showSaveFilePicker({
          suggestedName: fileName,
          types: [{
            description: "ZIP archive",
            accept: { "application/zip": [".zip"] },
          }],
        }),
      };
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { cancelled: true, directory: null, file: null };
    }
    throw error;
  }
  return { cancelled: false, directory: null, file: null };
}
