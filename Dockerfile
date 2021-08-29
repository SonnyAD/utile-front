FROM node:14-buster-slim AS builder

WORKDIR /app

ADD package.json package-lock.json ./

RUN npm ci

COPY . .

RUN node node_modules/esbuild/install.js
RUN npm run build


ENV PORT=2000
ENV HOST=0.0.0.0
ENV VITE_VERSION=0.0.0

CMD ["node", "./build"]