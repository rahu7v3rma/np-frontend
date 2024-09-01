FROM node:20-alpine AS builder

ARG BACKEND_BASE_URL
ARG GROW_PROD
ARG SENTRY_AUTH_TOKEN
ARG SENTRY_DSN

# https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine
RUN apk add --no-cache libc6-compat

WORKDIR /src

# install dependencies
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN NEXT_PUBLIC_BACKEND_BASE_URL=$BACKEND_BASE_URL \
    NEXT_PUBLIC_GROW_PROD=$GROW_PROD \
    SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN \
    NEXT_PUBLIC_SENTRY_DSN=$SENTRY_DSN \
    npm run build


FROM node:20-alpine

ARG TARGET_ARCH=amd64

# create non-root user for running the app
RUN addgroup --gid 10001 nonroot && \
    adduser --uid 10000 --ingroup nonroot --home /home/nonroot --disabled-password --gecos "" nonroot

# add tini and use it as the entrypoint
ADD https://github.com/krallin/tini/releases/download/v0.19.0/tini-static-$TARGET_ARCH /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]

WORKDIR /src

ENV NODE_ENV=production \
    PORT=8080 \
    NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_BACKEND_BASE_URL=$BACKEND_BASE_URL \
    NEXT_PUBLIC_GROW_PROD=$GROW_PROD \
    SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN \
    NEXT_PUBLIC_SENTRY_DSN=$SENTRY_DSN

COPY --from=builder /src/public ./public

# set the correct permission for prerender cache
RUN mkdir .next
RUN chown nonroot:nonroot .next

# automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nonroot:nonroot /src/.next/standalone ./
COPY --from=builder --chown=nonroot:nonroot /src/.next/static ./.next/static

USER nonroot

EXPOSE 8080

# server.js is created by next build from the standalone output
CMD HOSTNAME="0.0.0.0" node server.js
