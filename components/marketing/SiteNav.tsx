import Link from "next/link";
import {
  contactMailto,
  mainSiteHomeUrl,
  mainSiteServicesUrl,
} from "@/lib/marketing-links";

const LOGO_SVG = (
  <svg
    className="nav-logo-mark"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    width={40}
    height={40}
  >
    <circle cx="20" cy="20" r="18" fill="#FFF4E6" />
    <circle cx="20" cy="20" r="12" fill="none" stroke="#E8820C" strokeWidth="2" />
    <circle cx="20" cy="20" r="6" fill="#E8820C" opacity="0.7" />
    <circle cx="20" cy="9" r="2.5" fill="#E8820C" />
    <circle cx="29.5" cy="14.5" r="2.5" fill="#E8820C" />
    <circle cx="29.5" cy="25.5" r="2.5" fill="#E8820C" />
    <circle cx="20" cy="31" r="2.5" fill="#E8820C" />
    <circle cx="10.5" cy="25.5" r="2.5" fill="#E8820C" />
    <circle cx="10.5" cy="14.5" r="2.5" fill="#E8820C" />
  </svg>
);

export function SiteNav() {
  const home = mainSiteHomeUrl();
  const services = mainSiteServicesUrl();

  return (
    <nav>
      <a href={home} className="nav-logo">
        {LOGO_SVG}
        <span className="nav-logo-text">CercaLabs</span>
      </a>
      <ul className="nav-links">
        <li>
          <a href={home}>Home</a>
        </li>
        <li>
          <a href={services} target="_blank" rel="noopener noreferrer">
            Services
          </a>
        </li>
        <li>
          <a href={contactMailto()}>Contact</a>
        </li>
        <li>
          <Link href="/ai-vs-automation">Free Guide</Link>
        </li>
      </ul>
    </nav>
  );
}
