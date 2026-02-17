import test from "node:test";
import assert from "node:assert/strict";
import {
  UPLOAD_IMAGE_MAX_BYTES,
  getDataUrlMimeType,
  isAllowedUploadImageMimeType,
  validateUploadImageFile,
} from "../src/app/image-upload-policy.ts";

test("upload image policy allows expected mime types", () => {
  assert.equal(isAllowedUploadImageMimeType("image/png"), true);
  assert.equal(isAllowedUploadImageMimeType("image/jpeg"), true);
  assert.equal(isAllowedUploadImageMimeType("image/webp"), true);
  assert.equal(isAllowedUploadImageMimeType("image/gif"), true);
  assert.equal(isAllowedUploadImageMimeType("image/avif"), true);
  assert.equal(isAllowedUploadImageMimeType("image/svg+xml"), false);
});

test("upload image policy rejects oversized file", () => {
  if (typeof File !== "function") return;
  const overLimit = new Uint8Array(UPLOAD_IMAGE_MAX_BYTES + 1);
  const file = new File([overLimit], "huge.png", { type: "image/png" });
  const result = validateUploadImageFile(file);
  assert.equal(result.ok, false);
});

test("upload image policy parses data url mime type", () => {
  const mime = getDataUrlMimeType("data:image/webp;base64,AAAA");
  assert.equal(mime, "image/webp");
});
