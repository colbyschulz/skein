FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY shared/package.json shared/
COPY apps/web/package.json apps/web/
COPY apps/server/package.json apps/server/
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/apps/server/dist/index.js apps/server/dist/index.js
COPY --from=build /app/apps/web/dist apps/web/dist
EXPOSE 8080
ENV PORT=8080 NODE_ENV=production
CMD ["node", "apps/server/dist/index.js"]
