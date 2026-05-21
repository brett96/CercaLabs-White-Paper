import { redirect } from "next/navigation";
import { mainSiteServicesUrl } from "@/lib/marketing-links";

/** Resolves /services on this host (e.g. Vercel) to the real services page. */
export default function ServicesRedirectPage() {
  redirect(mainSiteServicesUrl());
}
