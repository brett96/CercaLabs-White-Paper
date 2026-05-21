import { execSync } from "node:child_process";
import { getResolvedDatabaseUrl } from "../lib/db/url";

const url = getResolvedDatabaseUrl();
if (!url) {
  console.log(
    "[postbuild] Skipping drizzle push and seed: no database URL in env"
  );
  process.exit(0);
}

if (!process.env.DATABASE_URL?.trim()) {
  process.env.DATABASE_URL = url;
}

console.log("[postbuild] drizzle-kit push");
execSync("npx drizzle-kit push --force", {
  stdio: "inherit",
  env: process.env,
});

console.log("[postbuild] seed admin (idempotent)");
execSync("npx tsx scripts/seed-admin.ts", {
  stdio: "inherit",
  env: process.env,
});
