FROM node:22-alpine

WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY server.js ./

ENV NODE_ENV=production
ENV PORT=3111
EXPOSE 3111

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3111/health || exit 1

CMD ["npm", "start"]
