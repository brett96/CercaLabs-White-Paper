import { GoogleAnalytics as NextGoogleAnalytics } from "@next/third-parties/google";

export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  if (!id) return null;
  return <NextGoogleAnalytics gaId={id} />;
}
