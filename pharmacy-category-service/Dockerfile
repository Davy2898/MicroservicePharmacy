# Use Node.js LTS image
FROM node:22-alpine

ENV NODE_ENV=production

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Expose service port
EXPOSE 5001

# Container-level health check (busybox wget is available in alpine)
HEALTHCHECK --interval=15s --timeout=10s --start-period=20s --retries=5 \
  CMD wget -q -O - http://127.0.0.1:5001/health || exit 1

USER node

CMD ["node", "server.js"]
