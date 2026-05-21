import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import "@/styles/cercalabs.css";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        fontFamily: "var(--font-body), 'Nunito Sans', sans-serif",
      }}
    >
      <AnalyticsProvider>
        <SiteNav />
        {children}
        <SiteFooter />
      </AnalyticsProvider>
    </div>
  );
}
