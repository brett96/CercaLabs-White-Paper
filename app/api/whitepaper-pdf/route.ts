import { NextResponse } from "next/server";
import {
  getWhitepaperSignedDownloadUrl,
  isFirebaseConfigured,
} from "@/lib/firebase/admin";
import { DEFAULT_WHITEPAPER_PDF_PATH } from "@/lib/default-whitepaper-pdf";
import { getWhitepaperPdfMeta } from "@/lib/whitepaper-pdf";

function redirectToDefaultPdf(request: Request) {
  const url = new URL(DEFAULT_WHITEPAPER_PDF_PATH, request.url);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  if (isFirebaseConfigured()) {
    const meta = await getWhitepaperPdfMeta();
    if (meta) {
      try {
        const url = await getWhitepaperSignedDownloadUrl(
          meta.storagePath,
          meta.displayName
        );
        return NextResponse.redirect(url);
      } catch (e) {
        console.error("[whitepaper-pdf] Firebase fallback to bundled PDF", e);
      }
    }
  }

  return redirectToDefaultPdf(request);
}

/** HEAD for health checks — bundled PDF is always available when deployed */
export async function HEAD(request: Request) {
  return redirectToDefaultPdf(request);
}
