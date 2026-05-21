import { defineConfig } from "drizzle-kit";
import { getResolvedDatabaseUrl } from "./lib/db/url";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: getResolvedDatabaseUrl() || "postgresql://localhost:5432/cercalabs",
  },
});
