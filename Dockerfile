FROM node:18-alpine AS prod_builder
# https://github.com/parcel-bundler/parcel/issues/6880 
# The parcel bundler has to build some native code if you have 'special'
# cpus like apple silicon.
RUN apk add --update python3 make g++
ADD . /app
WORKDIR /app
RUN yarn install
RUN yarn nx run-many --target=build

FROM node:18-alpine AS prod_node_modules
RUN apk add --update python3 make g++
ADD . /app
WORKDIR /app
RUN yarn install --production

FROM node:18-alpine AS princess_prod
ENV DOCKER=True
COPY --from=prod_node_modules /app/node_modules /app/node_modules
COPY --from=prod_builder /app/dist/libs /app/libs/
COPY --from=prod_builder /app/dist/apps/princess /app/princess/
EXPOSE 3000
CMD node /app/princess/main.js

FROM node:18-alpine AS rick_prod
ENV DOCKER=True
COPY --from=prod_node_modules /app/node_modules /app/node_modules
COPY --from=prod_builder /app/dist/libs /app/libs/
COPY --from=prod_builder /app/dist/apps/rick /app/rick/
EXPOSE 3333
CMD node /app/rick/main.js

FROM node:18-alpine AS morty_prod
ENV DOCKER=True
COPY --from=prod_node_modules /app/node_modules /app/node_modules
COPY --from=prod_builder /app/dist/libs /app/libs/
COPY --from=prod_builder /app/dist/apps/morty /app/morty/
EXPOSE 3333
CMD node /app/morty/main.js

FROM node:18-alpine AS kafo_prod
ENV DOCKER=True
COPY --from=prod_node_modules /app/node_modules /app/node_modules
COPY --from=prod_builder /app/dist/libs /app/libs/
COPY --from=prod_builder /app/dist/apps/kafo /app/kafo/
EXPOSE 3333
CMD node /app/kafo/main.js

FROM node:18-alpine AS gandalf_prod
ENV DOCKER=True
COPY --from=prod_node_modules /app/node_modules /app/node_modules
COPY --from=prod_builder /app/dist/libs /app/libs/
COPY --from=prod_builder /app/dist/apps/gandalf /app/gandalf/
EXPOSE 3333
CMD node /app/gandalf/main.js

FROM node:18-alpine AS fluffy_prod
ENV DOCKER=True
COPY --from=prod_node_modules /app/node_modules /app/node_modules
COPY --from=prod_builder /app/dist/libs /app/libs/
COPY --from=prod_builder /app/dist/apps/fluffy /app/fluffy/
EXPOSE 3333
CMD node /app/fluffy/main.js

FROM node:18-alpine AS anton_prod
ENV DOCKER=True
COPY --from=prod_node_modules /app/node_modules /app/node_modules
COPY --from=prod_builder /app/dist/libs /app/libs/
COPY --from=prod_builder /app/dist/apps/anton /app/anton/
EXPOSE 3333
CMD node /app/anton/main.js

FROM node:18-alpine AS bristle_prod
ENV DOCKER=True
COPY --from=prod_node_modules /app/node_modules /app/node_modules
COPY --from=prod_builder /app/dist/libs /app/libs/
COPY --from=prod_builder /app/dist/apps/bristle /app/bristle/
EXPOSE 3333
CMD node /app/bristle/main.js

FROM node:18-alpine AS magic_prod
ENV DOCKER=True
COPY --from=prod_node_modules /app/node_modules /app/node_modules
COPY --from=prod_builder /app/dist/libs /app/libs/
COPY --from=prod_builder /app/dist/apps/magic /app/magic/
EXPOSE 3333
CMD node /app/magic/main.js