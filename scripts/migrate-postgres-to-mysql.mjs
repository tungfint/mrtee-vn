import { execFileSync } from "node:child_process";

import "dotenv/config";
import mariadb from "mariadb";

const psql = "C:\\Program Files\\PostgreSQL\\17\\bin\\psql.exe";
const pgEnv = {
  ...process.env,
  PGPASSWORD: process.env.PG_MIGRATE_PASSWORD ?? "postgres",
};

const pgArgs = [
  "-h",
  process.env.PG_MIGRATE_HOST ?? "localhost",
  "-p",
  process.env.PG_MIGRATE_PORT ?? "5432",
  "-U",
  process.env.PG_MIGRATE_USER ?? "postgres",
  "-d",
  process.env.PG_MIGRATE_DATABASE ?? "mrtee_vn",
  "-t",
  "-A",
];

const tables = [
  ["User", "user"],
  ["Class", "class"],
  ["StudentProfile", "studentprofile"],
  ["Team", "team"],
  ["StudentYearRecord", "studentyearrecord"],
  ["TeamMember", "teammember"],
  ["Post", "post"],
  ["MemoryPost", "memorypost"],
  ["MediaAsset", "mediaasset"],
  ["MusicPlaylist", "musicplaylist"],
  ["Album", "album"],
  ["AlbumItem", "albumitem"],
  ["MusicTrack", "musictrack"],
  ["Account", "account"],
  ["Session", "session"],
  ["VerificationToken", "verificationtoken"],
];

const dateFields = new Set([
  "createdAt",
  "dob",
  "emailVerified",
  "expires",
  "publishedAt",
  "updatedAt",
]);

function readPgTable(table) {
  const sql = `SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) FROM (SELECT * FROM "${table}") t;`;
  const output = execFileSync(psql, [...pgArgs, "-c", sql], {
    encoding: "utf8",
    env: pgEnv,
    maxBuffer: 1024 * 1024 * 100,
  }).trim();

  return JSON.parse(output || "[]");
}

function normalizeRow(row) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => {
      if (value === null || value === undefined) {
        return [key, null];
      }

      if (key === "galleryImages") {
        return [key, JSON.stringify(Array.isArray(value) ? value : [])];
      }

      if (dateFields.has(key)) {
        return [key, new Date(value)];
      }

      return [key, value];
    }),
  );
}

async function main() {
  const url = new URL(process.env.DATABASE_URL);
  const db = await mariadb.createConnection({
    database: url.pathname.replace(/^\//, ""),
    host: url.hostname,
    password: decodeURIComponent(url.password),
    port: Number(url.port || "3306"),
    user: decodeURIComponent(url.username),
  });

  try {
    await db.query("SET FOREIGN_KEY_CHECKS = 0");

    for (const [, mysqlTable] of [...tables].reverse()) {
      await db.query(`DELETE FROM \`${mysqlTable}\``);
    }

    for (const [pgTable, mysqlTable] of tables) {
      const rows = readPgTable(pgTable).map(normalizeRow);

      if (!rows.length) {
        console.log(`${pgTable}: 0 rows`);
        continue;
      }

      const columns = Object.keys(rows[0]);
      const placeholders = columns.map(() => "?").join(", ");
      const sql = `INSERT INTO \`${mysqlTable}\` (${columns
        .map((column) => `\`${column}\``)
        .join(", ")}) VALUES (${placeholders})`;

      for (const row of rows) {
        await db.query(sql, columns.map((column) => row[column] ?? null));
      }

      console.log(`${pgTable}: ${rows.length} rows`);
    }
  } finally {
    await db.query("SET FOREIGN_KEY_CHECKS = 1");
    await db.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
