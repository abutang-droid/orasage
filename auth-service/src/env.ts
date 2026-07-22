import "dotenv/config";

function envOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

export const ENV = {
  port: parseInt(process.env.PORT || "3101", 10),
  // 裸机/systemd 部署默认只监听 127.0.0.1（由 Nginx 反代）；
  // 容器化部署（docker-compose）需设置 HOST=0.0.0.0，
  // 因为容器内绑定 127.0.0.1 会导致 Docker 端口映射无法访问容器，
  // 此时改由 docker-compose 的 `127.0.0.1:PORT:PORT` 端口映射负责限制对外暴露。
  host: process.env.HOST || "127.0.0.1",
  databaseUrl: envOrThrow("DATABASE_URL"),
  jwtSecret: envOrThrow("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "30d",
  corsOrigins: (process.env.CORS_ORIGINS || "").split(",").filter(Boolean),
  cookieDomain:
    process.env.COOKIE_DOMAIN ||
    process.env.JWT_COOKIE_DOMAIN ||
    ".orasage.com",
  isProduction: process.env.NODE_ENV === "production",
  deepseekApiKey: process.env.DEEPSEEK_API_KEY ?? "",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? process.env.VITE_AI_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? process.env.VITE_AI_API_KEY ?? "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
};
