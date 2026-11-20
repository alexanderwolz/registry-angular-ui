# Stage 1 - dependencies
FROM --platform=$BUILDPLATFORM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --silent

COPY . .

ARG STAGE=production
RUN npm run build -- --configuration $STAGE
RUN echo RELEASE_$(grep '"version":' package.json | cut -d\" -f4)_$(date -u +%Y-%m-%dT%H:%M:%SUTC)_$STAGE > ./dist/registry-fronted/version


# Stage 2 - run
FROM nginx:stable-alpine-slim AS run
LABEL maintainer="mail@alexanderwolz.de"

ENV REGISTRY_HOST=http://localhost:5000
ENV TOKEN_SECRET=PleaseReplaceMeAsSoonAsPossible
ENV CHECK_PULL_ACCESS=false

RUN apk update && apk add bash

COPY --chown=nginx:nginx nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/registry-fronted/ /usr/share/nginx/html

RUN chown -R nginx:nginx /usr/share/nginx \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && chown -R nginx:nginx /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid

WORKDIR /usr/share/nginx

USER nginx

# the application build may spread the environment placeholders over several chunks
RUN echo "for file in html/*.js; do \
    envsubst '\${REGISTRY_HOST} \${TOKEN_SECRET} \${CHECK_PULL_ACCESS}' < \${file} > file.tmp \
    && mv file.tmp \${file}; done \
    && nginx -g 'daemon off;'" > run.sh

CMD [ "bash", "run.sh" ]
