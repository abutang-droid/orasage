import mysql from "mysql2/promise";
import postgres from "postgres";

const MYSQL_URL = process.env.MYSQL_URL;
const PG_URL = process.env.PG_URL;

if (!MYSQL_URL || !PG_URL) {
  console.error("Set MYSQL_URL and PG_URL");
  process.exit(1);
}

const TABLES = ["users", "bazi_records", "purchases", "bazi_reports"];

const SERIAL_TABLES = ["users", "bazi_records", "purchases", "bazi_reports"];

function normalizeValue(value) {
  if (value === undefined) return null;
  if (value instanceof Date) return value;
  if (Buffer.isBuffer(value)) return value;
  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value);
  }
  return value;
}

function rowToColumns(row) {
  const cols = Object.keys(row);
  const vals = cols.map((c) => normalizeValue(row[c]));
  return { cols, vals };
}

async function main() {
  const mysqlConn = await mysql.createConnection(MYSQL_URL);
  const sql = postgres(PG_URL, { max: 1 });

  try {
    for (const table of TABLES) {
      const [rows] = await mysqlConn.query(`SELECT * FROM \`${table}\``);
      const list = rows;
      if (list.length === 0) {
        console.log(`[bazi] ${table}: 0 rows (skip)`);
        continue;
      }

      const { cols } = rowToColumns(list[0]);
      const quotedCols = cols.map((c) => `"${c}"`).join(", ");

      for (const row of list) {
        const { vals } = rowToColumns(row);
        await sql.unsafe(
          `INSERT INTO "${table}" (${quotedCols}) VALUES (${vals.map((_, i) => `$${i + 1}`).join(", ")}) ON CONFLICT DO NOTHING`,
          vals,
        );
      }

      console.log(`[bazi] ${table}: imported ${list.length} rows`);
    }

    for (const table of SERIAL_TABLES) {
      await sql.unsafe(
        `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 1))`,
      );
      console.log(`[bazi] Reset serial for ${table}`);
    }

    await sql`SET session_replication_role = 'origin'`;
    console.log("[bazi] Import complete.");
  } finally {
    await mysqlConn.end();
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
