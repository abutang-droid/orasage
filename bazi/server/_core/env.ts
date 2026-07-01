// JWT_SECRET 缺失时，会话签名密钥会退化成空字符串，等同于任何人都能自行
// 伪造有效的登录会话 cookie。生产环境下必须显式配置，直接失败退出而不是
// 静默用空密钥启动。
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("Missing required env var: JWT_SECRET");
}

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? process.env.VITE_AI_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? process.env.VITE_AI_API_KEY ?? "",
  deepseekApiKey: process.env.DEEPSEEK_API_KEY ?? "",
  wordpressUrl: process.env.WORDPRESS_URL ?? "",
  wpWooKey: process.env.WP_WOO_KEY ?? "",
  wpWooSecret: process.env.WP_WOO_SECRET ?? "",
};
