# Railway build context is the full repo — paths are prefixed with backend/
FROM node:20-alpine AS build
WORKDIR /app

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --include=dev

COPY backend/prisma ./prisma
COPY backend/tsconfig.json backend/nest-cli.json ./
COPY backend/src ./src

RUN npx prisma generate && npm run build

FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY backend/prisma ./prisma

EXPOSE 4000

CMD ["node", "dist/src/main.js"]
