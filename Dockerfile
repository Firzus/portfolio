# Node version: keep in sync with .node-version.
FROM node:26.13.0-slim AS build
WORKDIR /app
# pnpm version: keep in sync with "packageManager" in package.json.
RUN npm install --global pnpm@12.16.1
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY project.inlang/settings.json project.inlang/paraglide.config.js project.inlang/
COPY messages messages
# Installing also runs `prepare`, which compiles the Paraglide messages.
RUN pnpm install --frozen-lockfile
COPY . .
# Fails when a translation is missing or empty.
RUN pnpm run build

FROM node:26.13.0-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# Nitro bundles the server and the packages it needs into .output.
COPY --from=build --chown=node:node /app/.output ./.output
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:' + process.env.PORT + '/').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]
CMD ["node", ".output/server/index.mjs"]
