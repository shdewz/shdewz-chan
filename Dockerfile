FROM oven/bun:latest AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json bun.lockb* ./
RUN bun install --production --frozen-lockfile
COPY --from=deps /app/node_modules ./node_modules
COPY . .
CMD ["sh", "-c", "bun run migrate && bun start"]
