"use client";

import { useState } from "react";

export function DnsForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);

  function markInvalid(el: HTMLInputElement) {
    el.style.borderColor = "#E05252";
    el.style.boxShadow = "0 0 0 3px rgba(224,82,82,0.1)";
  }

  function clearInvalid(el: HTMLInputElement) {
    el.style.borderColor = "";
    el.style.boxShadow = "";
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const checkboxes = form.querySelectorAll<HTMLInputElement>(
      'input[type="checkbox"]'
    );
    const anyChecked = Array.from(checkboxes).some((cb) => cb.checked);
    if (!anyChecked) {
      setError("Please select at least one request type.");
      return;
    }

    const required = form.querySelectorAll<HTMLInputElement>("[required]");
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

    const fd = new FormData(form);
    setSubmitting(true);
    try {
      const res = await fetch("/api/privacy-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_types: {
            do_not_sell: fd.get("request_dns") === "on",
            delete: fd.get("request_delete") === "on",
            know: fd.get("request_know") === "on",
            correct: fd.get("request_correct") === "on",
            limit: fd.get("request_limit") === "on",
          },
          first_name: String(fd.get("first_name") ?? "").trim(),
          last_name: String(fd.get("last_name") ?? "").trim(),
          email: String(fd.get("email") ?? "").trim(),
          relationship: String(fd.get("relationship") ?? "") || undefined,
          notes: String(fd.get("notes") ?? "").trim() || undefined,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
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
    <form id="dns-form" noValidate onSubmit={onSubmit}>
      <div className="form-group">
        <label>
          Request type <span style={{ color: "#E05252" }}>*</span>
        </label>
        <div className="request-types">
          <label className="request-type-item">
            <input type="checkbox" name="request_dns" id="request_dns" />
            <div className="request-type-label">
              <strong>Do Not Sell or Share My Personal Information</strong>
              <span>
                Opt out of any sale or sharing of your personal information with
                third parties.
              </span>
            </div>
          </label>
          <label className="request-type-item">
            <input type="checkbox" name="request_delete" id="request_delete" />
            <div className="request-type-label">
              <strong>Delete My Personal Information</strong>
              <span>
                Request deletion of the personal information CercaLabs has
                collected about you.
              </span>
            </div>
          </label>
          <label className="request-type-item">
            <input type="checkbox" name="request_know" id="request_know" />
            <div className="request-type-label">
              <strong>Know What Information You Have About Me</strong>
              <span>
                Request details about the categories and specific pieces of
                personal information we&apos;ve collected.
              </span>
            </div>
          </label>
          <label className="request-type-item">
            <input
              type="checkbox"
              name="request_correct"
              id="request_correct"
            />
            <div className="request-type-label">
              <strong>Correct Inaccurate Information</strong>
              <span>
                Request correction of inaccurate personal information we maintain
                about you.
              </span>
            </div>
          </label>
          <label className="request-type-item">
            <input type="checkbox" name="request_limit" id="request_limit" />
            <div className="request-type-label">
              <strong>Limit Use of My Sensitive Personal Information</strong>
              <span>
                Restrict our use of sensitive personal information to only
                what&apos;s needed to provide the requested service.
              </span>
            </div>
          </label>
        </div>
      </div>

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
            onInput={(e) => clearInvalid(e.currentTarget)}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="email">
          Email address used when interacting with CercaLabs{" "}
          <span style={{ color: "#E05252" }}>*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="you@email.com"
          autoComplete="email"
          required
          onInput={(e) => clearInvalid(e.currentTarget)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="relationship">Your relationship to CercaLabs</label>
        <select id="relationship" name="relationship" defaultValue="">
          <option value="" disabled>
            Select one
          </option>
          <option value="downloaded_resource">Downloaded a resource or guide</option>
          <option value="newsletter">Newsletter subscriber</option>
          <option value="client">Current or past client</option>
          <option value="prospect">Prospective client</option>
          <option value="website_visitor">Website visitor only</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="notes">Additional details (optional)</label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Any additional context about your request..."
        />
      </div>

      <p className="required-note">
        * Required fields. We will verify your identity before processing your
        request.
      </p>

      {error ? (
        <p
          className="required-note"
          style={{ color: "#E05252", marginBottom: "1rem" }}
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn-submit" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit Privacy Request"}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </form>
  );
}
