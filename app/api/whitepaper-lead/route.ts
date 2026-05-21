import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { events, whitepaperLeads } from "@/lib/db/schema";
import { sendWhitepaperLeadNotification } from "@/lib/email";

const schema = z.object({
  first_name: z.string().trim().min(1).max(120),
  last_name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  organization: z.string().trim().min(1).max(255),
  role: z.string().trim().min(1).max(64),
  consent_email: z.boolean(),
  do_not_sell: z.boolean(),
  source: z.string().max(255).optional(),
  visitorId: z.string().max(64).optional(),
  sessionId: z.string().max(64).optional(),
  utm_source: z.string().max(255).optional(),
  utm_medium: z.string().max(255).optional(),
  utm_campaign: z.string().max(255).optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Please check your entries.";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  const data = parsed.data;
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    null;
  const userAgent = h.get("user-agent");
  const referrer = h.get("referer");

  const db = getDb();
  if (!db) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "We couldn't save your submission right now. Please try again or email info@cercalabs.com.",
      },
      { status: 503 }
    );
  }

  try {
    const [lead] = await db
      .insert(whitepaperLeads)
      .values({
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        organization: data.organization,
        role: data.role,
        consentEmail: data.consent_email,
        doNotSell: data.do_not_sell,
        source: data.source ?? "direct",
        referrer: referrer ?? undefined,
        utmSource: data.utm_source,
        utmMedium: data.utm_medium,
        utmCampaign: data.utm_campaign,
        visitorId: data.visitorId,
        ip: ip ?? undefined,
        userAgent: userAgent ?? undefined,
      })
      .returning();

    if (!lead) {
      return NextResponse.json(
        { ok: false, error: "Could not save submission." },
        { status: 500 }
      );
    }

    const vid = (data.visitorId ?? "anon").slice(0, 64);
    const sid = (data.sessionId ?? vid).slice(0, 64);
    try {
      await db.insert(events).values({
        visitorId: vid,
        sessionId: sid,
        eventType: "form_submit",
        path: "/ai-vs-automation",
        referrer: referrer ?? null,
        utmSource: data.utm_source,
        utmMedium: data.utm_medium,
        utmCampaign: data.utm_campaign,
        properties: {
          leadId: lead.id,
          role: data.role,
          consent_email: data.consent_email,
          do_not_sell: data.do_not_sell,
        },
      });
    } catch (eventErr) {
      console.error("[whitepaper-lead] event insert", eventErr);
    }

    try {
      await sendWhitepaperLeadNotification(lead);
    } catch (emailErr) {
      console.error("[whitepaper-lead] email", emailErr);
    }

    return NextResponse.json({ ok: true, leadId: lead.id });
  } catch (err) {
    console.error("[whitepaper-lead]", err);
    return NextResponse.json(
      { ok: false, error: "Could not save submission." },
      { status: 500 }
    );
  }
}
