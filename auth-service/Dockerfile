FROM node:22-alpine AS builder

WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
EXPOSE 3101
CMD ["node", "dist/index.js"]
