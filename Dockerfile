# Stage 1: Build
FROM node:18.17.0-alpine AS builder

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend .
COPY shared /app/shared
RUN npm run build

# Stage 2: Production
FROM node:18.17.0-alpine AS production

WORKDIR /app/backend

ENV NODE_ENV=production

COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /app/backend/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
