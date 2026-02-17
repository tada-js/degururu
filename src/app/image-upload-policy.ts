export const UPLOAD_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

export const UPLOAD_IMAGE_MAX_BYTES = 2 * 1024 * 1024;

export const UPLOAD_IMAGE_ACCEPT = UPLOAD_IMAGE_MIME_TYPES.join(",");

type UploadValidation =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

const ALLOWED_UPLOAD_IMAGE_MIME_SET = new Set<string>(UPLOAD_IMAGE_MIME_TYPES);

function normalizeMimeType(value: unknown): string {
  return String(value || "").trim().toLowerCase();
}

export function isAllowedUploadImageMimeType(value: unknown): boolean {
  const mime = normalizeMimeType(value);
  return ALLOWED_UPLOAD_IMAGE_MIME_SET.has(mime);
}

export function getDataUrlMimeType(dataUrl: unknown): string {
  const value = String(dataUrl || "");
  const match = /^data:([^;,]+)[;,]/i.exec(value);
  return normalizeMimeType(match?.[1] || "");
}

export function validateUploadImageFile(file: File): UploadValidation {
  if (!(file instanceof File)) return { ok: false, message: "파일을 다시 선택해 주세요." };

  if (!isAllowedUploadImageMimeType(file.type)) {
    return { ok: false, message: "PNG/JPG/WEBP/GIF/AVIF 이미지 파일만 업로드할 수 있어요." };
  }

  if (!Number.isFinite(file.size) || file.size <= 0) {
    return { ok: false, message: "파일이 비어 있습니다. 다른 파일을 선택해 주세요." };
  }

  if (file.size > UPLOAD_IMAGE_MAX_BYTES) {
    return { ok: false, message: "이미지 파일은 최대 2MB까지 업로드할 수 있어요." };
  }

  return { ok: true };
}
