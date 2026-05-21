import type { Metadata } from "next";
import { Nunito, Nunito_Sans } from "next/font/google";
import { AppProviders } from "@/components/AppProviders";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-display",
  display: "swap",
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CercaLabs",
  description: "RCM automation and workflow strategy for specialty and genomics labs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} ${nunitoSans.variable}`}>
      <body>
        <AppProviders>{children}</AppProviders>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
