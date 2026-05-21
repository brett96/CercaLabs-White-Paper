import nodemailer from "nodemailer";
import type { PrivacyRequest, WhitepaperLead } from "@/lib/db/schema";
import { setSiteSetting } from "@/lib/site-settings";

let transporter: nodemailer.Transporter | null = null;

function getTransport() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  if (!user || !pass) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
    });
  }
  return transporter;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function roleLabel(role: string) {
  const labels: Record<string, string> = {
    rcm_director: "RCM Director",
    cfo: "CFO / VP Finance",
    vp_operations: "VP Operations",
    healthcare_it: "Healthcare IT Manager",
    billing_manager: "Billing Manager",
    health_plan: "Health Plan — Program Director",
    consultant: "Consultant",
    other: "Other",
  };
  return labels[role] ?? role;
}

export async function sendWhitepaperLeadNotification(lead: WhitepaperLead) {
  const to = process.env.LEAD_NOTIFICATION_EMAIL;
  const fromUser = process.env.GMAIL_USER;
  if (!to || !fromUser) {
    await setSiteSetting(
      "last_email_error",
      "Missing LEAD_NOTIFICATION_EMAIL or GMAIL_USER"
    );
    return;
  }
  const transport = getTransport();
  if (!transport) {
    await setSiteSetting(
      "last_email_error",
      "Missing GMAIL_USER or GMAIL_APP_PASSWORD"
    );
    return;
  }

  const rows: [string, string][] = [
    ["Name", `${lead.firstName} ${lead.lastName}`],
    ["Email", lead.email],
    ["Organization", lead.organization],
    ["Role", roleLabel(lead.role)],
    ["Email opt-in", lead.consentEmail ? "Yes" : "No"],
    ["Do not sell", lead.doNotSell ? "Yes" : "No"],
    ["Source", lead.source ?? "—"],
    ["Referrer", lead.referrer ?? "—"],
    [
      "UTM",
      [lead.utmSource, lead.utmMedium, lead.utmCampaign]
        .filter(Boolean)
        .join(" / ") || "—",
    ],
    ["Visitor ID", lead.visitorId ?? "—"],
  ];

  const table = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px;border:1px solid #D8E8E4;font-weight:700;color:#1C3A2E">${k}</td><td style="padding:8px;border:1px solid #D8E8E4;color:#2D5248">${escapeHtml(v)}</td></tr>`
    )
    .join("");

  try {
    await transport.sendMail({
      from: `"CercaLabs White Paper" <${fromUser}>`,
      to,
      replyTo: lead.email,
      subject: `New white paper download: ${lead.firstName} ${lead.lastName} — ${lead.organization}`,
      html: `<!DOCTYPE html><html><body style="font-family:Nunito Sans,Arial,sans-serif;color:#1E3D30"><h2 style="color:#1C3A2E">New AI vs. Automation guide download</h2><table style="border-collapse:collapse;width:100%;max-width:560px">${table}</table></body></html>`,
    });
    await setSiteSetting("last_email_error", "");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("sendWhitepaperLeadNotification", e);
    await setSiteSetting("last_email_error", msg);
  }
}

export async function sendPrivacyRequestNotification(req: PrivacyRequest) {
  const to = process.env.LEAD_NOTIFICATION_EMAIL;
  const fromUser = process.env.GMAIL_USER;
  if (!to || !fromUser) {
    await setSiteSetting(
      "last_email_error",
      "Missing LEAD_NOTIFICATION_EMAIL or GMAIL_USER"
    );
    return;
  }
  const transport = getTransport();
  if (!transport) {
    await setSiteSetting(
      "last_email_error",
      "Missing GMAIL_USER or GMAIL_APP_PASSWORD"
    );
    return;
  }

  const types = req.requestTypes;
  const selected = [
    types.do_not_sell && "Do Not Sell or Share",
    types.delete && "Delete",
    types.know && "Know",
    types.correct && "Correct",
    types.limit && "Limit Use",
  ].filter(Boolean);

  try {
    await transport.sendMail({
      from: `"CercaLabs Privacy" <${fromUser}>`,
      to,
      replyTo: req.email,
      subject: `Privacy request: ${req.firstName} ${req.lastName}`,
      html:
        `<!DOCTYPE html><html><body style="font-family:Nunito Sans,Arial,sans-serif">` +
        `<h2>Privacy request submitted</h2>` +
        `<p><strong>Name:</strong> ${escapeHtml(req.firstName)} ${escapeHtml(req.lastName)}</p>` +
        `<p><strong>Email:</strong> ${escapeHtml(req.email)}</p>` +
        `<p><strong>Request types:</strong> ${escapeHtml(selected.join(", ") || "—")}</p>` +
        `<p><strong>Relationship:</strong> ${escapeHtml(req.relationship ?? "—")}</p>` +
        `<p><strong>Notes:</strong> ${escapeHtml(req.notes ?? "—")}</p>` +
        `</body></html>`,
    });
    await setSiteSetting("last_email_error", "");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("sendPrivacyRequestNotification", e);
    await setSiteSetting("last_email_error", msg);
  }
}
