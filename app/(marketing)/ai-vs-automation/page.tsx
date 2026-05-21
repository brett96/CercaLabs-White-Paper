import type { Metadata } from "next";
import { loadMarketingHtml, splitAtMount } from "@/lib/marketing-html";
import { MarketingHtml } from "@/components/marketing/MarketingHtml";
import { WhitepaperForm } from "@/components/marketing/WhitepaperForm";

export const metadata: Metadata = {
  title: "AI vs. Automation RCM Guide | CercaLabs",
  description:
    "A practical guide for RCM teams on where generative AI helps, where workflow automation does the real work, and how to start building results.",
  robots: { index: false, follow: false },
};

export default function AiVsAutomationPage() {
  const html = loadMarketingHtml("landing-body.html");
  const { before, after } = splitAtMount(html, "whitepaper-form-mount");

  return (
    <>
      <MarketingHtml html={before} />
      <WhitepaperForm />
      <MarketingHtml html={after} />
    </>
  );
}
