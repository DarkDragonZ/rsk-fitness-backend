FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# install build tools neede for native addons and typesript build
RUN apk add --no-cache python3 make g++ git

# copy pkg metadata, intalling dependencies
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN npm prune --production


# stage 2: Runtime
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

# small runtie tools for used it for a entrypoint
RUN apk add --no-cache netcat-openbsd

# non root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# coy only production artifacts
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chown -R appuser:appgroup /usr/src/app
RUN chmod +x ./docker-entrypoint.sh

USER appuser

ENV NODE_ENV=production
ENV PORT=3500
EXPOSE 3500

CMD [ "./docker-entrypoint.sh" ]