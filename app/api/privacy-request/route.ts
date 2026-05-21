import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { privacyRequests } from "@/lib/db/schema";
import { sendPrivacyRequestNotification } from "@/lib/email";

const schema = z.object({
  request_types: z.object({
    do_not_sell: z.boolean(),
    delete: z.boolean(),
    know: z.boolean(),
    correct: z.boolean(),
    limit: z.boolean(),
  }),
  first_name: z.string().trim().min(1).max(120),
  last_name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  relationship: z.string().max(64).optional(),
  notes: z.string().max(4000).optional(),
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
    return NextResponse.json(
      { ok: false, error: "Please check your entries." },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const hasType = Object.values(data.request_types).some(Boolean);
  if (!hasType) {
    return NextResponse.json(
      { ok: false, error: "Please select at least one request type." },
      { status: 400 }
    );
  }

  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    null;
  const userAgent = h.get("user-agent");

  const db = getDb();
  if (!db) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "We couldn't save your request right now. Please email info@cercalabs.com.",
      },
      { status: 503 }
    );
  }

  try {
    const [row] = await db
      .insert(privacyRequests)
      .values({
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        relationship: data.relationship || null,
        notes: data.notes || null,
        requestTypes: data.request_types,
        ip: ip ?? undefined,
        userAgent: userAgent ?? undefined,
      })
      .returning();

    if (!row) {
      return NextResponse.json(
        { ok: false, error: "Could not save request." },
        { status: 500 }
      );
    }

    try {
      await sendPrivacyRequestNotification(row);
    } catch (emailErr) {
      console.error("[privacy-request] email", emailErr);
    }

    return NextResponse.json({ ok: true, requestId: row.id });
  } catch (err) {
    console.error("[privacy-request]", err);
    return NextResponse.json(
      { ok: false, error: "Could not save request." },
      { status: 500 }
    );
  }
}
