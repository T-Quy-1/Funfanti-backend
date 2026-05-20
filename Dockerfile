# Stage 1: Base
FROM node:20-alpine AS base

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate 
# Generate Prisma client during build time to avoid issues in production with missing generated files

# Stage 2: Development
FROM base AS development
COPY . .
# We use command in docker-compose for dev mode (when we start the container)
CMD ["npm", "run", "start:dev"]

# Stage 3: Build for Production
FROM base AS builder
COPY . .
RUN npm run build

# Stage 4: Production Run
FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
