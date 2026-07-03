import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { ENV } from "./env.ts";
import { authRouter } from "./routes/auth.ts";
import { healthRouter } from "./routes/health.ts";
import { pagesRouter, internalOnly } from "./routes/pages.ts";
import { internalRouter } from "./routes/account.ts";
import { productsRouter } from "./routes/products.ts";
import { adminApiRouter } from "./routes/admin-api.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: ENV.isProduction ? ENV.corsOrigins : true, credentials: true }));
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(pagesRouter);
app.use("/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/admin", adminApiRouter);
app.use("/internal", internalOnly, internalRouter);
app.use(healthRouter);

// 裸机部署默认只监听 127.0.0.1：对外统一由 Nginx 反代 auth.orasage.com，
// 避免绕过反代直接从公网访问（尤其是 /internal/* 内网接口）。
// 容器化部署需设置 HOST=0.0.0.0（见 env.ts 注释）。
app.listen(ENV.port, ENV.host, () => {
  console.log(`[auth] server running on http://${ENV.host}:${ENV.port}`);
  console.log(`[auth] cookie domain: ${ENV.cookieDomain}`);
});
