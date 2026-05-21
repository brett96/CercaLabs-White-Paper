import type { Metadata } from "next";
import { WhitepaperLanding } from "@/components/marketing/WhitepaperLanding";

export const metadata: Metadata = {
  title: "AI vs. Automation RCM Guide | CercaLabs",
  description:
    "A practical guide for RCM teams on where generative AI helps, where workflow automation does the real work, and how to start building results.",
  robots: { index: false, follow: false },
};

export default function HomePage() {
  return <WhitepaperLanding />;
}
