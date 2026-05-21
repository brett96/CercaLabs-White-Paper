import Link from "next/link";
import { contactMailto, mainSiteHomeUrl } from "@/lib/marketing-links";

export function SiteFooter() {
  const home = mainSiteHomeUrl();

  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-logo">CercaLabs</div>
        <div className="footer-copy">© 2026 CercaLabs. All rights reserved.</div>
        <div className="footer-links">
          <a href={home}>Home</a>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/do-not-sell">Do Not Sell My Info</Link>
          <a href={contactMailto()}>Contact</a>
        </div>
      </div>
    </footer>
  );
}
