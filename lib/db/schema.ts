import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }),
  role: varchar("role", { length: 32 }).notNull().default("admin"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const whitepaperLeads = pgTable("whitepaper_leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  firstName: varchar("first_name", { length: 120 }).notNull(),
  lastName: varchar("last_name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  organization: varchar("organization", { length: 255 }).notNull(),
  role: varchar("role", { length: 64 }).notNull(),
  consentEmail: boolean("consent_email").notNull().default(false),
  doNotSell: boolean("do_not_sell").notNull().default(false),
  source: varchar("source", { length: 255 }),
  referrer: text("referrer"),
  utmSource: varchar("utm_source", { length: 255 }),
  utmMedium: varchar("utm_medium", { length: 255 }),
  utmCampaign: varchar("utm_campaign", { length: 255 }),
  visitorId: varchar("visitor_id", { length: 64 }),
  ip: varchar("ip", { length: 64 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const privacyRequests = pgTable("privacy_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  firstName: varchar("first_name", { length: 120 }).notNull(),
  lastName: varchar("last_name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  relationship: varchar("relationship", { length: 64 }),
  notes: text("notes"),
  requestTypes: jsonb("request_types")
    .$type<{
      do_not_sell: boolean;
      delete: boolean;
      know: boolean;
      correct: boolean;
      limit: boolean;
    }>()
    .notNull(),
  ip: varchar("ip", { length: 64 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  visitorId: varchar("visitor_id", { length: 64 }).notNull(),
  sessionId: varchar("session_id", { length: 64 }).notNull(),
  eventType: varchar("event_type", { length: 32 }).notNull(),
  path: text("path"),
  referrer: text("referrer"),
  utmSource: varchar("utm_source", { length: 255 }),
  utmMedium: varchar("utm_medium", { length: 255 }),
  utmCampaign: varchar("utm_campaign", { length: 255 }),
  country: varchar("country", { length: 8 }),
  region: varchar("region", { length: 128 }),
  city: varchar("city", { length: 128 }),
  deviceType: varchar("device_type", { length: 64 }),
  browser: varchar("browser", { length: 64 }),
  os: varchar("os", { length: 64 }),
  ip: varchar("ip", { length: 64 }),
  userAgent: text("user_agent"),
  properties: jsonb("properties").$type<Record<string, unknown>>(),
  occurredAt: timestamp("occurred_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 128 }).primaryKey(),
  value: text("value"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof users.$inferSelect;
export type WhitepaperLead = typeof whitepaperLeads.$inferSelect;
export type PrivacyRequest = typeof privacyRequests.$inferSelect;
export type EventRow = typeof events.$inferSelect;
