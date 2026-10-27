# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Production server

Configure the variables listed in `.env.example`, then build and start from the repository root:

```bash
pnpm build
pnpm start
```

`pnpm start` loads a local `.env` when present and also supports environment variables injected by the deployment platform. It requires Node.js 20.19+ (or a supported newer version). Restart the running process after changing private credentials. If the public Turnstile Site Key changes, rebuild before restarting because calendar pages are prerendered.

For PM2, Docker, or another process manager, inject the same environment variables into the server process, or run the new start command from the project root. `node .output/server/index.mjs` alone does not load `.env`.
