# Base images are pinned to an exact version for reproducible builds.

# Stage 1 - build
FROM --platform=$BUILDPLATFORM node:26.13.1-alpine3.24 AS build

WORKDIR /app

# the npm download cache survives dependency changes between builds
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund --silent

# only copy what the build needs, so unrelated changes (docs, examples, workflows) keep the cache
COPY angular.json tsconfig*.json ./
COPY src ./src

# the Angular build cache makes rebuilds after small code changes faster
ARG STAGE=production
RUN --mount=type=cache,target=/app/.angular/cache \
    npm run build -- --configuration $STAGE \
    && echo RELEASE_$(grep '"version":' package.json | cut -d\" -f4)_$(date -u +%Y-%m-%dT%H:%M:%SUTC)_$STAGE > ./dist/registry-fronted/version


# Stage 2 - run
FROM nginx:1.31.9-alpine-slim AS run
LABEL maintainer="mail@alexanderwolz.de"

ENV REGISTRY_HOST=http://localhost:5000
ENV TOKEN_SECRET=PleaseReplaceMeAsSoonAsPossible
ENV CHECK_PULL_ACCESS=false

RUN apk upgrade --no-cache

COPY --chown=nginx:nginx nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx --from=build /app/dist/registry-fronted/ /usr/share/nginx/html

RUN chown nginx:nginx /usr/share/nginx /usr/share/nginx/html \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && chown -R nginx:nginx /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid

WORKDIR /usr/share/nginx

USER nginx

RUN echo "for file in html/*.js; do \
    envsubst '\${REGISTRY_HOST} \${TOKEN_SECRET} \${CHECK_PULL_ACCESS}' < \${file} > file.tmp \
    && mv file.tmp \${file}; done \
    && nginx -g 'daemon off;'" > run.sh

CMD [ "sh", "run.sh" ]
