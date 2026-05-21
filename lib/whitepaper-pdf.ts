import { getSiteSetting, setSiteSetting } from "@/lib/site-settings";

export const SETTING_PDF_PATH = "whitepaper_pdf_storage_path";
export const SETTING_PDF_FILENAME = "whitepaper_pdf_display_name";
export const SETTING_PDF_UPDATED = "whitepaper_pdf_updated_at";

export async function getWhitepaperPdfMeta() {
  const [storagePath, displayName, updatedAt] = await Promise.all([
    getSiteSetting(SETTING_PDF_PATH),
    getSiteSetting(SETTING_PDF_FILENAME),
    getSiteSetting(SETTING_PDF_UPDATED),
  ]);
  if (!storagePath) return null;
  return {
    storagePath,
    displayName: displayName ?? "CercaLabs-RCM-Guide.pdf",
    updatedAt: updatedAt ?? null,
  };
}

export async function saveWhitepaperPdfMeta(storagePath: string, displayName: string) {
  await setSiteSetting(SETTING_PDF_PATH, storagePath);
  await setSiteSetting(SETTING_PDF_FILENAME, displayName);
  await setSiteSetting(SETTING_PDF_UPDATED, new Date().toISOString());
}
