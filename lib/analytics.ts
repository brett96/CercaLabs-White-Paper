import {
  and,
  count,
  countDistinct,
  desc,
  eq,
  gte,
  isNotNull,
  max,
  sql,
} from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { events, whitepaperLeads } from "@/lib/db/schema";
import type { TrafficRangeId } from "@/lib/analytics-range";
import { sinceForRange } from "@/lib/analytics-range";

function sinceDays(days: number) {
  return new Date(Date.now() - days * 86400000);
}

function pageviewSince(since: Date) {
  return and(eq(events.eventType, "pageview"), gte(events.occurredAt, since));
}

export async function distinctVisitorsSince(db: Db, since: Date) {
  const [row] = await db
    .select({ n: countDistinct(events.visitorId) })
    .from(events)
    .where(pageviewSince(since));
  return Number(row?.n ?? 0);
}

export async function pageviewCountSince(db: Db, since: Date) {
  const [row] = await db
    .select({ n: count() })
    .from(events)
    .where(pageviewSince(since));
  return Number(row?.n ?? 0);
}

export async function distinctVisitors(db: Db, days: number) {
  return distinctVisitorsSince(db, sinceDays(days));
}

export async function distinctVisitorsToday(db: Db) {
  const [row] = await db
    .select({ n: sql<number>`count(distinct ${events.visitorId})` })
    .from(events)
    .where(
      and(
        eq(events.eventType, "pageview"),
        gte(
          events.occurredAt,
          sql`date_trunc('day', now() at time zone 'America/Los_Angeles')`
        )
      )
    );
  return Number(row?.n ?? 0);
}

export async function whitepaperLeadsCountSince(db: Db, days: number) {
  const since = sinceDays(days);
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
  const since = sinceDays(days);
  const types = ["pageview", "form_start", "form_submit"] as const;
  const out: Record<string, number> = {};
  for (const t of types) {
    const [row] = await db
      .select({ n: count() })
      .from(events)
      .where(and(eq(events.eventType, t), gte(events.occurredAt, since)));
    out[t] = Number(row?.n ?? 0);
  }
  return {
    pageview: out.pageview ?? 0,
    form_start: out.form_start ?? 0,
    form_submit: out.form_submit ?? 0,
  };
}

export async function pageviewsByDay(db: Db, days: number) {
  const since = sinceDays(days);
  const rows = await db
    .select({
      day: sql<string>`date_trunc('day', ${events.occurredAt})::date::text`,
      n: count(),
    })
    .from(events)
    .where(pageviewSince(since))
    .groupBy(sql`date_trunc('day', ${events.occurredAt})`)
    .orderBy(sql`date_trunc('day', ${events.occurredAt})`);
  return rows.map((r) => ({ day: r.day, views: Number(r.n) }));
}

export async function topReferrersSince(
  db: Db,
  since: Date,
  limit = 12
) {
  const c = count();
  return db
    .select({ referrer: events.referrer, n: c })
    .from(events)
    .where(pageviewSince(since))
    .groupBy(events.referrer)
    .orderBy(desc(c))
    .limit(limit);
}

export async function topPathsSince(db: Db, since: Date, limit = 12) {
  const c = count();
  return db
    .select({ path: events.path, n: c })
    .from(events)
    .where(pageviewSince(since))
    .groupBy(events.path)
    .orderBy(desc(c))
    .limit(limit);
}

export async function topReferrers(db: Db, days: number, limit = 8) {
  return topReferrersSince(db, sinceDays(days), limit);
}

export async function topPaths(db: Db, days: number, limit = 10) {
  return topPathsSince(db, sinceDays(days), limit);
}

export async function topCountriesSince(db: Db, since: Date, limit = 15) {
  const c = count();
  return db
    .select({ country: events.country, n: c })
    .from(events)
    .where(and(pageviewSince(since), isNotNull(events.country)))
    .groupBy(events.country)
    .orderBy(desc(c))
    .limit(limit);
}

export async function topCitiesSince(db: Db, since: Date, limit = 15) {
  const c = count();
  return db
    .select({
      city: events.city,
      region: events.region,
      country: events.country,
      n: c,
    })
    .from(events)
    .where(and(pageviewSince(since), isNotNull(events.city)))
    .groupBy(events.city, events.region, events.country)
    .orderBy(desc(c))
    .limit(limit);
}

export async function topIpsSince(db: Db, since: Date, limit = 25) {
  const c = count();
  return db
    .select({
      ip: events.ip,
      city: events.city,
      region: events.region,
      country: events.country,
      visits: c,
      lastSeen: max(events.occurredAt),
    })
    .from(events)
    .where(and(pageviewSince(since), isNotNull(events.ip)))
    .groupBy(events.ip, events.city, events.region, events.country)
    .orderBy(desc(c))
    .limit(limit);
}

export async function browserBreakdownSince(db: Db, since: Date, limit = 12) {
  const c = count();
  return db
    .select({ browser: events.browser, n: c })
    .from(events)
    .where(and(pageviewSince(since), isNotNull(events.browser)))
    .groupBy(events.browser)
    .orderBy(desc(c))
    .limit(limit);
}

export async function deviceBreakdownSince(db: Db, since: Date, limit = 12) {
  const c = count();
  return db
    .select({ deviceType: events.deviceType, n: c })
    .from(events)
    .where(pageviewSince(since))
    .groupBy(events.deviceType)
    .orderBy(desc(c))
    .limit(limit);
}

export async function recentVisitsSince(db: Db, since: Date, limit = 50) {
  return db
    .select({
      occurredAt: events.occurredAt,
      visitorId: events.visitorId,
      ip: events.ip,
      city: events.city,
      region: events.region,
      country: events.country,
      path: events.path,
      referrer: events.referrer,
      deviceType: events.deviceType,
      browser: events.browser,
      os: events.os,
    })
    .from(events)
    .where(pageviewSince(since))
    .orderBy(desc(events.occurredAt))
    .limit(limit);
}

/** Load all traffic breakdowns for a preset range (max 30 days). */
export async function trafficAnalyticsForRange(
  db: Db,
  range: TrafficRangeId
) {
  const since = sinceForRange(range);
  const [
    visitors,
    pageviews,
    countries,
    cities,
    ips,
    browsers,
    devices,
    paths,
    referrers,
    visits,
  ] = await Promise.all([
    distinctVisitorsSince(db, since),
    pageviewCountSince(db, since),
    topCountriesSince(db, since, 15),
    topCitiesSince(db, since, 15),
    topIpsSince(db, since, 25),
    browserBreakdownSince(db, since, 12),
    deviceBreakdownSince(db, since, 12),
    topPathsSince(db, since, 12),
    topReferrersSince(db, since, 12),
    recentVisitsSince(db, since, 50),
  ]);

  return {
    since,
    visitors,
    pageviews,
    countries,
    cities,
    ips,
    browsers,
    devices,
    paths,
    referrers,
    visits,
  };
}
