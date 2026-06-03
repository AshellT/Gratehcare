# Railway build context is the full repo — paths are prefixed with backend/
FROM node:20-alpine AS build
WORKDIR /app

COPY backend/package.json backend/package-lock.json ./
COPY backend/prisma ./prisma
RUN npm ci --include=dev
COPY backend/tsconfig.json backend/nest-cli.json ./
COPY backend/src ./src

RUN npx prisma generate && npm run build

FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY backend/package.json backend/package-lock.json ./
COPY backend/prisma ./prisma
# Generated client comes from build stage; skip postinstall (prisma generate) here
RUN apk add --no-cache --virtual .build-deps python3 make g++ \
  && npm ci --omit=dev --ignore-scripts \
  && apk del .build-deps

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY backend/scripts/docker-start.sh ./scripts/docker-start.sh
RUN chmod +x ./scripts/docker-start.sh

EXPOSE 4000

CMD ["sh", "scripts/docker-start.sh"]
