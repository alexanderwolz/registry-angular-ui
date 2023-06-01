# Stage 1 - dependencies
FROM --platform=$BUILDPLATFORM node:20.2.0-alpine3.17 as build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --silent

COPY . .

ARG STAGE=production
RUN npm run build -- --output-path=./dist/out --configuration $STAGE
RUN echo RELEASE_$(grep '"version":' package.json | cut -d\" -f4)_$(date -u +%Y-%m-%dT%H:%M:%SUTC)_$STAGE > ./dist/out/version


# Stage 3 - run
FROM nginx:1.25.0-alpine3.17-slim as run
LABEL maintainer="mail@alexanderwolz.de"

ENV REGISTRY_HOST=http://localhost:5000
ENV TOKEN_SECRET=PleaseReplaceMeAsSoonAsPossible
ENV CHECK_PULL_ACCESS=false

RUN apk update && apk add bash

COPY --chown=nginx:nginx nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/out/ /usr/share/nginx/html

RUN chown -R nginx:nginx /usr/share/nginx \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && chown -R nginx:nginx /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid

WORKDIR /usr/share/nginx

USER nginx

RUN echo "mainFileName=\"\$(ls html/main*.js)\" \
    && envsubst '\${REGISTRY_HOST} \${TOKEN_SECRET} \${CHECK_PULL_ACCESS}' < \${mainFileName} > main.tmp \
    && mv main.tmp  \${mainFileName} \
    && nginx -g 'daemon off;'" > run.sh

EXPOSE 8080

CMD [ "bash", "run.sh" ]
