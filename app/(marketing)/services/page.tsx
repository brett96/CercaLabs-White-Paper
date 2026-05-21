import type { Metadata } from "next";
import { ServicesPageContent } from "@/components/marketing/ServicesPageContent";

export const metadata: Metadata = {
  title: "Services | CercaLabs",
  description:
    "RCM workflow automation and AI strategy for specialty and genomics labs.",
};

export default function ServicesPage() {
  return <ServicesPageContent />;
}
