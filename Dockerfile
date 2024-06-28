FROM node:18-alpine

WORKDIR /app

ADD package.json package-lock.json ./

RUN npm ci

COPY . .

#RUN node node_modules/esbuild/install.js
RUN npm run build

ENV PORT=2000
ENV HOST=0.0.0.0
ENV PUBLIC_VERSION=4.0.0

CMD ["node", "./build"]