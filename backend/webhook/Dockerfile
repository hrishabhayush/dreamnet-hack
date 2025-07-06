# ------------ Build & Run (ts-node) ------------
FROM node:20-alpine
WORKDIR /app

# Install deps for webhook (will also satisfy smart-response)
COPY backend/webhook/package*.json ./backend/webhook/
WORKDIR /app/backend/webhook
RUN npm install --production && npm install ts-node typescript --save-exact \
    && mv node_modules /app/node_modules

# Copy entire repository so ts-node can import TypeScript from smart-response
WORKDIR /app
COPY . .

# Default env
ENV PORT=4000
EXPOSE 4000

# Start directly with ts-node (no precompile) so cross-folder imports work
WORKDIR /app/backend/webhook
CMD ["npx", "ts-node", "src/server.ts"] 