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
FROM nginx:1.21.1-alpine as run
LABEL maintainer="mail@alexanderwolz.de"

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/out/ /usr/share/nginx/html

ENV REGISTRY_HOST=http://localhost:5000
ENV TOKEN_SECRET=PleaseReplaceMeAsSoonAsPossible

RUN echo "mainFileName=\"\$(ls /usr/share/nginx/html/main*.js)\" && \
          envsubst '\${REGISTRY_HOST} \${TOKEN_SECRET}' < \${mainFileName} > main.tmp && \
          mv main.tmp  \${mainFileName} && nginx -g 'daemon off;'" > run.sh
CMD [ "sh", "run.sh" ]
