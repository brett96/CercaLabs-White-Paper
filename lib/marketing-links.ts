/** Main CercaLabs marketing site (Home / Services). */
export function getMainSiteUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_MAIN_SITE_URL?.trim() ||
    "https://cercalabs.com";
  return base.replace(/\/$/, "");
}

export const CONTACT_EMAIL = "info@cercalabs.com";

export function mainSiteServicesUrl(): string {
  return `${getMainSiteUrl()}/services`;
}

export function mainSiteHomeUrl(): string {
  return getMainSiteUrl();
}

export function contactMailto(): string {
  return `mailto:${CONTACT_EMAIL}`;
}
