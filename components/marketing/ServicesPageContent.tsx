import Link from "next/link";

export function ServicesPageContent() {
  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-eyebrow">What we do</div>
          <h1 className="page-title">RCM Automation Services</h1>
          <p className="page-sub">
            CercaLabs helps specialty and genomics labs automate revenue cycle
            workflows on the platforms you already use — without replacing your
            core systems.
          </p>
        </div>
      </div>

      <div className="content">
        <div className="section">
          <h2 className="section-title">Workflow automation</h2>
          <p>
            We design and implement automation for high-volume RCM tasks: claim
            appeals, document retrieval, eligibility checks, and operational
            reporting — built on Telcor, Waystar, UiPath, ABBYY, and your
            existing stack.
          </p>
        </div>

        <div className="section">
          <h2 className="section-title">AI strategy &amp; compliance</h2>
          <p>
            We help teams draw the line between generative AI and deterministic
            workflow automation, including HIPAA-aware use cases and policies
            when AI tools are restricted in your organization.
          </p>
        </div>

        <div className="section">
          <h2 className="section-title">Implementation &amp; scale</h2>
          <p>
            From workflow audits through phased rollouts, we focus on measurable
            outcomes: backlog reduction, faster appeal packages, and sustainable
            operations your team can run day to day.
          </p>
        </div>

        <div
          className="contact-box"
          style={{ marginTop: "0.5rem" }}
        >
          <div className="contact-box-title">Get the free RCM guide</div>
          <p>
            Download our practical guide on where AI helps vs. where automation
            does the real work in revenue cycle operations.
          </p>
          <p style={{ marginTop: "1rem" }}>
            <Link
              href="/ai-vs-automation"
              style={{
                color: "#7DCFC4",
                fontWeight: 700,
                textDecoration: "underline",
              }}
            >
              Download the free guide →
            </Link>
          </p>
          <p style={{ marginTop: "1rem" }}>
            Questions? Email{" "}
            <a href="mailto:info@cercalabs.com">info@cercalabs.com</a>
          </p>
        </div>
      </div>

      <div className="dns-banner">
        <p className="dns-banner-text">
          <Link href="/privacy-policy">Privacy Policy</Link> &nbsp;·&nbsp;{" "}
          <Link href="/do-not-sell">Do Not Sell My Info</Link> &nbsp;·&nbsp;{" "}
          <a href="mailto:info@cercalabs.com">info@cercalabs.com</a>
        </p>
      </div>
    </>
  );
}
