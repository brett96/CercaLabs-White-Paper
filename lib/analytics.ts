import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { events, whitepaperLeads } from "@/lib/db/schema";

export async function distinctVisitors(db: Db, days: number) {
  const since = new Date(Date.now() - days * 86400000);
  const [row] = await db
    .select({ n: sql<number>`count(distinct ${events.visitorId})` })
    .from(events)
    .where(
      and(eq(events.eventType, "pageview"), gte(events.occurredAt, since))
    );
  return Number(row?.n ?? 0);
}

export async function distinctVisitorsToday(db: Db) {
  const [row] = await db
    .select({ n: sql<number>`count(distinct ${events.visitorId})` })
    .from(events)
    .where(
      and(
        eq(events.eventType, "pageview"),
        gte(events.occurredAt, sql`date_trunc('day', now() at time zone 'America/Los_Angeles')`)
      )
    );
  return Number(row?.n ?? 0);
}

export async function whitepaperLeadsCountSince(db: Db, days: number) {
  const since = new Date(Date.now() - days * 86400000);
  const [row] = await db
    .select({ n: count() })
    .from(whitepaperLeads)
    .where(gte(whitepaperLeads.createdAt, since));
  return Number(row?.n ?? 0);
}

export async function recentWhitepaperLeads(db: Db, limit = 10) {
  return db
    .select()
    .from(whitepaperLeads)
    .orderBy(desc(whitepaperLeads.createdAt))
    .limit(limit);
}

export async function funnelCounts(db: Db, days: number) {
  const since = new Date(Date.now() - days * 86400000);
  const types = ["pageview", "form_start", "form_submit"] as const;
  const out: Record<string, number> = {};
  for (const t of types) {
    const [row] = await db
      .select({ n: count() })
      .from(events)
      .where(
        and(eq(events.eventType, t), gte(events.occurredAt, since))
      );
    out[t] = Number(row?.n ?? 0);
  }
  return {
    pageview: out.pageview ?? 0,
    form_start: out.form_start ?? 0,
    form_submit: out.form_submit ?? 0,
  };
}

export async function pageviewsByDay(db: Db, days: number) {
  const since = new Date(Date.now() - days * 86400000);
  const rows = await db
    .select({
      day: sql<string>`date_trunc('day', ${events.occurredAt})::date::text`,
      n: count(),
    })
    .from(events)
    .where(
      and(eq(events.eventType, "pageview"), gte(events.occurredAt, since))
    )
    .groupBy(sql`date_trunc('day', ${events.occurredAt})`)
    .orderBy(sql`date_trunc('day', ${events.occurredAt})`);
  return rows.map((r) => ({ day: r.day, views: Number(r.n) }));
}

export async function topReferrers(db: Db, days: number, limit = 8) {
  const since = new Date(Date.now() - days * 86400000);
  return db
    .select({
      referrer: events.referrer,
      n: count(),
    })
    .from(events)
    .where(
      and(eq(events.eventType, "pageview"), gte(events.occurredAt, since))
    )
    .groupBy(events.referrer)
    .orderBy(desc(count()))
    .limit(limit);
}

export async function topPaths(db: Db, days: number, limit = 10) {
  const since = new Date(Date.now() - days * 86400000);
  return db
    .select({
      path: events.path,
      n: count(),
    })
    .from(events)
    .where(
      and(eq(events.eventType, "pageview"), gte(events.occurredAt, since))
    )
    .groupBy(events.path)
    .orderBy(desc(count()))
    .limit(limit);
}
