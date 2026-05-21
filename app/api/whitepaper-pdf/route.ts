import { NextResponse } from "next/server";
import { getWhitepaperSignedDownloadUrl, isFirebaseConfigured } from "@/lib/firebase/admin";
import { getWhitepaperPdfMeta } from "@/lib/whitepaper-pdf";

export async function GET() {
  if (!isFirebaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "PDF download is not configured yet." },
      { status: 503 }
    );
  }

  const meta = await getWhitepaperPdfMeta();
  if (!meta) {
    return NextResponse.json(
      { ok: false, error: "No white paper PDF has been uploaded yet." },
      { status: 404 }
    );
  }

  try {
    const url = await getWhitepaperSignedDownloadUrl(
      meta.storagePath,
      meta.displayName
    );
    return NextResponse.redirect(url);
  } catch (e) {
    console.error("[whitepaper-pdf]", e);
    return NextResponse.json(
      { ok: false, error: "Could not generate download link." },
      { status: 500 }
    );
  }
}
