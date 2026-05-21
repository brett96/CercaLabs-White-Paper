import admin from "firebase-admin";

function getPrivateKey(): string | undefined {
  const raw = process.env.FIREBASE_PRIVATE_KEY;
  if (!raw) return undefined;
  return raw.replace(/\\n/g, "\n");
}

export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID?.trim() &&
      process.env.FIREBASE_CLIENT_EMAIL?.trim() &&
      getPrivateKey() &&
      process.env.FIREBASE_STORAGE_BUCKET?.trim()
  );
}

function ensureApp(): admin.app.App | null {
  if (!isFirebaseConfigured()) return null;
  if (admin.apps.length > 0) {
    return admin.app();
  }
  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID!.trim(),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!.trim(),
      privateKey: getPrivateKey()!,
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET!.trim(),
  });
}

export function getFirebaseBucket() {
  const app = ensureApp();
  if (!app) return null;
  return admin.storage().bucket();
}

export async function uploadWhitepaperPdf(
  buffer: Buffer,
  displayName: string
): Promise<string> {
  const bucket = getFirebaseBucket();
  if (!bucket) {
    throw new Error("Firebase Storage is not configured.");
  }
  const safeName = displayName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  const storagePath = `whitepapers/ai-vs-automation/${Date.now()}-${safeName}`;
  const file = bucket.file(storagePath);
  await file.save(buffer, {
    contentType: "application/pdf",
    metadata: {
      cacheControl: "private, max-age=3600",
    },
    resumable: false,
  });
  return storagePath;
}

export async function getWhitepaperSignedDownloadUrl(
  storagePath: string,
  displayName: string
): Promise<string> {
  const bucket = getFirebaseBucket();
  if (!bucket) {
    throw new Error("Firebase Storage is not configured.");
  }
  const file = bucket.file(storagePath);
  const [exists] = await file.exists();
  if (!exists) {
    throw new Error("PDF file not found in storage.");
  }
  const [url] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + 60 * 60 * 1000,
    responseDisposition: `attachment; filename="${displayName.replace(/"/g, "")}"`,
    responseType: "application/pdf",
  });
  return url;
}
