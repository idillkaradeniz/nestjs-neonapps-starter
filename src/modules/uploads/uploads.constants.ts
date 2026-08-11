// Business rule (Day 14): what counts as an acceptable upload. Enforced
// at the gate (multer config below) — never in a downstream processor.
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
