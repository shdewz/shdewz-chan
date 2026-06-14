# shdewz-chan

To install dependencies:

```bash
bun install
```

To run:

```bash
bun src/index.ts
```

Docker
------

### Development

Start Postgres + app with development dependencies (bind-mounts the repo into the container):

```bash
cp .env.example .env.dev
# Edit .env.dev to add your dev DISCORD_TOKEN
docker compose -f docker-compose.dev.yml up --build
```

This uses `Dockerfile.dev` (includes dev dependencies), runs migrations, and starts the bot. The `DATABASE_URL` is set to the Postgres service. Use a separate dev Discord bot token to avoid conflicts with production.

### Production

Build and run with production dependencies only:

```bash
docker compose up --build
```

Set `DISCORD_TOKEN` and other required env vars in your `.env` file or secrets manager before deploying.

