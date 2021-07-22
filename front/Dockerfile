FROM google/dart AS builder

WORKDIR /app

RUN pub global activate webdev

ADD pubspec.* /app/

RUN pub get

ADD . /app

RUN pub get

RUN webdev build --output web:build

FROM nginx:stable-alpine AS runtime

COPY --from=builder /app/build /usr/share/nginx/html
