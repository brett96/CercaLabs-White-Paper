/** Main CercaLabs marketing site (Home / Services). */
export function getMainSiteUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_MAIN_SITE_URL?.trim() ||
    "https://cercalabs.com";
  return base.replace(/\/$/, "");
}

export const CONTACT_EMAIL = "info@cercalabs.com";

/**
 * Services page URL. Do not derive from MAIN_SITE_URL when that points at this
 * white-paper deployment (e.g. cercalabs-whitepaper.vercel.app/services 404s).
 */
export function mainSiteServicesUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SERVICES_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }
  return "https://cercalabs.com/services";
}

export function mainSiteHomeUrl(): string {
  return getMainSiteUrl();
}

export function contactMailto(): string {
  return `mailto:${CONTACT_EMAIL}`;
}
