import type { Metadata } from "next";
import { loadMarketingHtml, splitAtMount } from "@/lib/marketing-html";
import { MarketingHtml } from "@/components/marketing/MarketingHtml";
import { DnsForm } from "@/components/marketing/DnsForm";

export const metadata: Metadata = {
  title: "Do Not Sell or Share My Personal Information | CercaLabs",
  description:
    "Submit a CCPA privacy request to opt out of sale or sharing of your personal information.",
};

export default function DoNotSellPage() {
  const html = loadMarketingHtml("do-not-sell-body.html");
  const { before, after } = splitAtMount(html, "dns-form-mount");

  return (
    <>
      <MarketingHtml html={before} />
      <DnsForm />
      <MarketingHtml html={after} />
    </>
  );
}
