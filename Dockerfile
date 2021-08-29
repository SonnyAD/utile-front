FROM node:14-buster-slim AS builder

WORKDIR /app

ADD package.json package-lock.json ./

RUN npm ci

COPY . .

RUN node node_modules/esbuild/install.js
RUN npm run build

FROM node:14-buster-slim AS runtime

WORKDIR /app

COPY --from=builder /app/build /app/build

ENV PORT=3000
ENV HOST=0.0.0.0

CMD ["node", "./build"]