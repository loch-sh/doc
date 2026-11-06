FROM mirror.gcr.io/library/node:24-alpine AS build
WORKDIR /app
ARG DOCS_URL=https://docs.loch.sh
ARG DOCS_BASE_URL=/
ENV DOCS_URL=$DOCS_URL DOCS_BASE_URL=$DOCS_BASE_URL
RUN npm install -g corepack && corepack enable
COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable
COPY . .
RUN yarn build

FROM mirror.gcr.io/library/nginx:alpine
COPY docker/default.conf /etc/nginx/conf.d/default.conf
COPY docker/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/build /usr/share/nginx/html
