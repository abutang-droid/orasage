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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: ENV.isProduction ? ENV.corsOrigins : true, credentials: true }));
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(pagesRouter);
app.use("/auth", authRouter);
app.use("/internal", internalOnly, internalRouter);
app.use(healthRouter);

app.listen(ENV.port, () => {
  console.log(`[auth] server running on http://0.0.0.0:${ENV.port}`);
  console.log(`[auth] cookie domain: ${ENV.cookieDomain}`);
});
