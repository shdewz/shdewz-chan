# shdewz-chan

## Setup

```bash
cp .env.example .env.local              # production
cp .env.example .env.development.local  # development
# Edit the relevant file to add your DISCORD_TOKEN and other values
```

## Running

### Development

Starts Postgres + app with hot reload, bind-mounting the repo into the container:

```bash
docker compose -f docker-compose.dev.yml up --build
# or
bun run dev
```

### Production

Builds and runs with production dependencies only:

```bash
docker compose up --build
# or
bun run start
```

### Without Docker

```bash
bun install
bun src/index.ts
```