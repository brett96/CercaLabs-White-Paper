import { loadMarketingHtml, splitAtMount } from "@/lib/marketing-html";
import { MarketingHtml } from "@/components/marketing/MarketingHtml";
import { WhitepaperForm } from "@/components/marketing/WhitepaperForm";

export function WhitepaperLanding() {
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
