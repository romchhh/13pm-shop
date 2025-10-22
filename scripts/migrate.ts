#!/usr/bin/env ts-node

import { Pool } from "pg";
import fs from "node:fs";
import path from "node:path";

type Migration = { id: string; description: string; sql: string };

function loadEnvUrl(): string {
  const envPath = path.join(process.cwd(), ".env");
  if (!process.env.DATABASE_URL && fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    const match = content.match(/DATABASE_URL=(.*)/);
    if (match) process.env.DATABASE_URL = match[1].replace(/['"]/g, "");
  }
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }
  return process.env.DATABASE_URL;
}

// Define this single migration
const migrations: Migration[] = [
  {
    id: "2025-10-22_add_priority_to_categories",
    description: "Add 'priority' column to categories table",
    sql: `
      ALTER TABLE categories
      ADD COLUMN IF NOT EXISTS priority INT DEFAULT 0;
    `,
  },
];

async function ensureMigrationsTable(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id TEXT PRIMARY KEY,
      executed_at TIMESTAMP NOT NULL DEFAULT NOW(),
      description TEXT
    );
  `);
}

async function hasRun(pool: Pool, id: string): Promise<boolean> {
  const res = await pool.query("SELECT 1 FROM _migrations WHERE id = $1", [id]);
  return (res.rowCount ?? 0) > 0;
}

async function recordRun(pool: Pool, id: string, description: string) {
  await pool.query(
    "INSERT INTO _migrations (id, description) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING",
    [id, description]
  );
}

async function main() {
  const dbUrl = loadEnvUrl();
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: dbUrl.includes("sslmode=require") ? { rejectUnauthorized: false } : false,
  });

  await ensureMigrationsTable(pool);

  for (const m of migrations) {
    const done = await hasRun(pool, m.id);
    if (done) {
      console.log(`✓ Skipping ${m.id} (already applied)`);
      continue;
    }
    console.log(`→ Running migration ${m.id}: ${m.description}`);
    await pool.query(m.sql);
    await recordRun(pool, m.id, m.description);
    console.log(`✓ Completed ${m.id}`);
  }

  await pool.end();
  console.log("Migration complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
