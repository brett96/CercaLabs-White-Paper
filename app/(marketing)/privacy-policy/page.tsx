import type { Metadata } from "next";
import { loadMarketingHtml } from "@/lib/marketing-html";
import { MarketingHtml } from "@/components/marketing/MarketingHtml";

export const metadata: Metadata = {
  title: "Privacy Policy | CercaLabs",
  description: "How CercaLabs collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  const html = loadMarketingHtml("privacy-policy-body.html");
  return <MarketingHtml html={html} />;
}
