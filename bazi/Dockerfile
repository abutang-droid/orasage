FROM node:22-alpine AS builder

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建前端和后端
RUN pnpm run build

# ────────────────────────────────────────────
# 生产阶段
FROM node:22-alpine AS runner

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

WORKDIR /app

# 只复制生产所需文件
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/client/public ./client/public

# 安装全部依赖（esbuild --packages=external 导致 dev 包也会被引用）
RUN pnpm install --frozen-lockfile

# 环境变量
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.js"]
