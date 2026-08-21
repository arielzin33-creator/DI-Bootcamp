/**
 * Creates (or recreates) every table, index and trigger from db/schema.sql.
 *
 * The brief suggests exactly this: "you might want to create a script that will
 * initialize the tables for you. You can then quickly destroy the database on Render
 * and then create a new one and quickly setup your tables if need be."
 *
 * Run with:  npm run db:init
 *
 * WARNING: schema.sql starts with DROP TABLE ... CASCADE, so this deletes all existing
 * data. It refuses to run against a production database unless you pass --force.
 */
import fs from "node:fs";
import path from "node:path";
import { config } from "../config/env";
import { pool } from "../db/pool";

async function main(): Promise<void> {
  const force = process.argv.includes("--force");

  if (config.isProduction && !force) {
    console.error(
      "[db:init] Refusing to run against a production database (this DROPs every table).\n" +
        "          Re-run with --force if you are certain.",
    );
    process.exit(1);
  }

  const schemaPath = path.resolve(__dirname, "../db/schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");

  console.log(`[db:init] Applying ${schemaPath} ...`);
  // node-postgres sends this as a single multi-statement query, so the whole schema
  // succeeds or fails together.
  await pool.query(sql);
  console.log("[db:init] Done. Tables users, stories, contributors, comments are ready.");
}

main()
  .catch((error: unknown) => {
    console.error("[db:init] Failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => {
    void pool.end();
  });
