import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getWhitepaperSignedDownloadUrl,
  isFirebaseConfigured,
  uploadWhitepaperPdf,
} from "@/lib/firebase/admin";
import {
  getWhitepaperPdfMeta,
  saveWhitepaperPdfMeta,
} from "@/lib/whitepaper-pdf";

const MAX_BYTES = 25 * 1024 * 1024;

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const meta = await getWhitepaperPdfMeta();
  return NextResponse.json({
    ok: true,
    configured: isFirebaseConfigured(),
    pdf: meta,
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!isFirebaseConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, and FIREBASE_STORAGE_BUCKET.",
      },
      { status: 503 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid form data." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "Choose a PDF file to upload." },
      { status: 400 }
    );
  }

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json(
      { ok: false, error: "Only PDF files are allowed." },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "PDF must be 25 MB or smaller." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const displayName = file.name || "whitepaper.pdf";

  try {
    const storagePath = await uploadWhitepaperPdf(buffer, displayName);
    await saveWhitepaperPdfMeta(storagePath, displayName);
    const meta = await getWhitepaperPdfMeta();
    return NextResponse.json({ ok: true, pdf: meta });
  } catch (e) {
    console.error("[admin/whitepaper-pdf] upload", e);
    return NextResponse.json(
      { ok: false, error: "Upload failed. Check Firebase credentials and bucket rules." },
      { status: 500 }
    );
  }
}

/** Optional: verify admin can read current file */
export async function HEAD() {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse(null, { status: 401 });
  }
  const meta = await getWhitepaperPdfMeta();
  if (!meta || !isFirebaseConfigured()) {
    return new NextResponse(null, { status: 404 });
  }
  try {
    await getWhitepaperSignedDownloadUrl(meta.storagePath, meta.displayName);
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
