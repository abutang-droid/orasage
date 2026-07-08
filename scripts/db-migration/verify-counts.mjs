import mysql from "mysql2/promise";
import postgres from "postgres";

const checks = [
  {
    name: "bazi.users",
    mysqlUrl: process.env.MYSQL_BAZI_URL,
    pgUrl: process.env.PG_BAZI_URL,
    mysqlTable: "users",
    pgTable: "users",
  },
  {
    name: "bazi.bazi_records",
    mysqlUrl: process.env.MYSQL_BAZI_URL,
    pgUrl: process.env.PG_BAZI_URL,
    mysqlTable: "bazi_records",
    pgTable: "bazi_records",
  },
  {
    name: "bazi.purchases",
    mysqlUrl: process.env.MYSQL_BAZI_URL,
    pgUrl: process.env.PG_BAZI_URL,
    mysqlTable: "purchases",
    pgTable: "purchases",
  },
  {
    name: "bazi.bazi_reports",
    mysqlUrl: process.env.MYSQL_BAZI_URL,
    pgUrl: process.env.PG_BAZI_URL,
    mysqlTable: "bazi_reports",
    pgTable: "bazi_reports",
  },
  {
    name: "tarot.User",
    mysqlUrl: process.env.MYSQL_TAROT_URL,
    pgUrl: process.env.PG_TAROT_URL,
    mysqlTable: "User",
    pgTable: "User",
  },
  {
    name: "tarot.ReadingRecord",
    mysqlUrl: process.env.MYSQL_TAROT_URL,
    pgUrl: process.env.PG_TAROT_URL,
    mysqlTable: "ReadingRecord",
    pgTable: "ReadingRecord",
  },
  {
    name: "tarot.ThreeCardReading",
    mysqlUrl: process.env.MYSQL_TAROT_URL,
    pgUrl: process.env.PG_TAROT_URL,
    mysqlTable: "ThreeCardReading",
    pgTable: "ThreeCardReading",
  },
  {
    name: "tarot.MeritLog",
    mysqlUrl: process.env.MYSQL_TAROT_URL,
    pgUrl: process.env.PG_TAROT_URL,
    mysqlTable: "MeritLog",
    pgTable: "MeritLog",
  },
];

let failed = 0;

for (const check of checks) {
  if (!check.mysqlUrl || !check.pgUrl) {
    console.error(`[verify] Missing URLs for ${check.name}`);
    failed += 1;
    continue;
  }

  const mysqlConn = await mysql.createConnection(check.mysqlUrl);
  const pg = postgres(check.pgUrl, { max: 1 });

  try {
    const [[mysqlRow]] = await mysqlConn.query(
      `SELECT COUNT(*) AS c FROM \`${check.mysqlTable}\``,
    );
    const [pgRow] = await pg.unsafe(
      `SELECT COUNT(*)::int AS c FROM "${check.pgTable}"`,
    );
    const mysqlCount = Number(mysqlRow.c);
    const pgCount = Number(pgRow.c);
    const ok = mysqlCount === pgCount;
    console.log(
      `[verify] ${check.name}: mysql=${mysqlCount} pg=${pgCount} ${ok ? "OK" : "MISMATCH"}`,
    );
    if (!ok) failed += 1;
  } finally {
    await mysqlConn.end();
    await pg.end({ timeout: 5 });
  }
}

if (failed > 0) {
  console.error(`[verify] ${failed} check(s) failed`);
  process.exit(1);
}

console.log("[verify] All row counts match.");
