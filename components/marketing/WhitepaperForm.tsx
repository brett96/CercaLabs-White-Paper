"use client";

import { useRef, useState } from "react";
import { getUtmFromSearch, getVisitorCookies } from "@/lib/cookies";
import { useTrackEvent } from "@/components/analytics/AnalyticsProvider";

const ROLES = [
  ["rcm_director", "RCM Director"],
  ["cfo", "CFO / VP Finance"],
  ["vp_operations", "VP Operations"],
  ["healthcare_it", "Healthcare IT Manager"],
  ["billing_manager", "Billing Manager"],
  ["health_plan", "Health Plan — Program Director"],
  ["consultant", "Consultant"],
  ["other", "Other"],
] as const;

export function WhitepaperForm() {
  const track = useTrackEvent();
  const started = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);

  function markInvalid(el: HTMLInputElement | HTMLSelectElement) {
    el.style.borderColor = "#E05252";
    el.style.boxShadow = "0 0 0 3px rgba(224,82,82,0.1)";
  }

  function clearInvalid(el: HTMLInputElement | HTMLSelectElement) {
    el.style.borderColor = "";
    el.style.boxShadow = "";
  }

  function onFormStart() {
    if (!started.current) {
      started.current = true;
      track("form_start", { form: "whitepaper" });
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const required = form.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
      "[required]"
    );
    let valid = true;
    required.forEach((field) => {
      if (!field.value.trim()) {
        markInvalid(field);
        valid = false;
      } else {
        clearInvalid(field);
      }
    });
    if (!valid) return;

    const utm =
      typeof window !== "undefined"
        ? getUtmFromSearch(window.location.search)
        : {};
    const { visitorId, sessionId } = getVisitorCookies();

    setSubmitting(true);
    try {
      const res = await fetch("/api/whitepaper-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: String(fd.get("first_name") ?? "").trim(),
          last_name: String(fd.get("last_name") ?? "").trim(),
          email: String(fd.get("email") ?? "").trim(),
          organization: String(fd.get("organization") ?? "").trim(),
          role: String(fd.get("role") ?? "").trim(),
          consent_email: fd.get("consent_email") === "on",
          do_not_sell: fd.get("consent_dns") === "on",
          source: document.referrer || "direct",
          visitorId: visitorId ?? undefined,
          sessionId: sessionId ?? undefined,
          ...utm,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      track("form_submit", { form: "whitepaper" });
      setHidden(true);
      const success = document.getElementById("success-state");
      if (success) success.style.display = "block";
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (hidden) return null;

  return (
    <form id="download-form" noValidate onSubmit={onSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="first_name">
            First name <span style={{ color: "#E05252" }}>*</span>
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            placeholder="Jeff"
            autoComplete="given-name"
            required
            onFocus={onFormStart}
            onInput={(e) => clearInvalid(e.currentTarget)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="last_name">
            Last name <span style={{ color: "#E05252" }}>*</span>
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            placeholder="Afana"
            autoComplete="family-name"
            required
            onFocus={onFormStart}
            onInput={(e) => clearInvalid(e.currentTarget)}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="email">
          Work email <span style={{ color: "#E05252" }}>*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="you@yourorganization.com"
          autoComplete="email"
          required
          onFocus={onFormStart}
          onInput={(e) => clearInvalid(e.currentTarget)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="organization">
          Organization <span style={{ color: "#E05252" }}>*</span>
        </label>
        <input
          type="text"
          id="organization"
          name="organization"
          placeholder="Lab, health system, or physician group"
          required
          onFocus={onFormStart}
          onInput={(e) => clearInvalid(e.currentTarget)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="role">
          Your role <span style={{ color: "#E05252" }}>*</span>
        </label>
        <select
          id="role"
          name="role"
          required
          defaultValue=""
          onFocus={onFormStart}
          onChange={(e) => clearInvalid(e.currentTarget)}
        >
          <option value="" disabled>
            Select your role
          </option>
          {ROLES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="ccpa-section">
        <div className="ccpa-notice">
          <strong>Notice at Collection (CCPA):</strong> CercaLabs collects your
          name, work email, organization, and role to deliver this guide and send
          occasional relevant content. We do not sell or share your personal
          information with third parties for marketing purposes. To request
          access, correction, or deletion of your data, email{" "}
          <a href="mailto:info@cercalabs.com">info@cercalabs.com</a>. See our
          full{" "}
          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>
          .
        </div>

        <div className="checkbox-row">
          <input type="checkbox" id="consent_email" name="consent_email" />
          <label className="checkbox-label" htmlFor="consent_email">
            Yes, I&apos;d like to receive occasional emails from CercaLabs about
            RCM automation insights and resources. I can unsubscribe at any time.
          </label>
        </div>

        <div className="checkbox-row">
          <input type="checkbox" id="consent_dns" name="consent_dns" />
          <label className="checkbox-label" htmlFor="consent_dns">
            Do not sell or share my personal information. (
            <a href="/do-not-sell" target="_blank" rel="noopener noreferrer">
              Your CCPA rights
            </a>
            )
          </label>
        </div>
      </div>

      <p className="required-note">
        * Required fields. Your information is kept confidential.
      </p>

      {error ? (
        <p
          className="required-note"
          style={{ color: "#E05252", marginBottom: "0.75rem" }}
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn-submit" disabled={submitting}>
        {submitting ? "Submitting…" : "Download the Free Guide"}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>
    </form>
  );
}
