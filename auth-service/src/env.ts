import "dotenv/config";

function envOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

export const ENV = {
  port: parseInt(process.env.PORT || "3101", 10),
  databaseUrl: envOrThrow("DATABASE_URL"),
  jwtSecret: envOrThrow("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "30d",
  corsOrigins: (process.env.CORS_ORIGINS || "").split(",").filter(Boolean),
  cookieDomain: process.env.COOKIE_DOMAIN || ".orasage.com",
  isProduction: process.env.NODE_ENV === "production",
};
