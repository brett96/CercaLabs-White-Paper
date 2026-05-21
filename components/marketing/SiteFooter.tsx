import Link from "next/link";
import { appHomePath, contactMailto } from "@/lib/marketing-links";

export function SiteFooter() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-logo">CercaLabs</div>
        <div className="footer-copy">© 2026 CercaLabs. All rights reserved.</div>
        <div className="footer-links">
          <Link href={appHomePath()}>Home</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/do-not-sell">Do Not Sell My Info</Link>
          <a href={contactMailto()}>Contact</a>
        </div>
      </div>
    </footer>
  );
}
