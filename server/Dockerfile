# Runs via tsx (same as `npm start` locally), not a tsc-compiled dist/ —
# avoids a real asset-path bug: bestPractices.md (llm/promptBuilder.ts) and
# public/ (index.ts's static serve) are read relative to source files at
# runtime, and a separate compile step would need to remember to carry both
# over. tsx is a devDependency but still needed at runtime for that reason,
# so there's nothing to gain from a multi-stage prod-only node_modules here.
#
# node:*-bookworm-slim (glibc, Debian) rather than alpine (musl) — matches
# the platform better-sqlite3 ships prebuilt binaries for, so this image
# shouldn't need a C++ toolchain to install it. If `npm ci` ever fails
# needing to compile it from source, add:
#   RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
# before `npm ci` below.
FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY src ./src
COPY public ./public

ENV NODE_ENV=production
EXPOSE 8787

CMD ["npx", "tsx", "src/index.ts"]
