export const CONTACT_EMAIL = "info@cercalabs.com";

/** In-app home (stays on this deployment). */
export function appHomePath(): string {
  return "/";
}

export function appServicesPath(): string {
  return "/services";
}

export function appFreeGuidePath(): string {
  return "/ai-vs-automation";
}

export function contactMailto(): string {
  return `mailto:${CONTACT_EMAIL}`;
}
