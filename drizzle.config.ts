import { defineConfig } from "drizzle-kit";
import { resolvePostgresConnectionString } from "./src/lib/db/connection-string";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: resolvePostgresConnectionString(),
  },
});
