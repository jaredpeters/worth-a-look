FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server.mjs ./
COPY public ./public
COPY site ./site
USER node
CMD ["node", "server.mjs"]
