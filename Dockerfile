FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json /app

RUN npm install

FROM node:20-alpine AS builder

ARG DATABASE_URL
ARG AWS_R
ARG AWS_AK
ARG AWS_SAK
ARG AWS_ST

ENV AWS_REGION=$AWS_R
ENV AWS_ACCESSKEY=$AWS_AK
ENV AWS_SECRETACCESSKEY=$AWS_SAK
ENV AWS_SESSIONTOKEN=$AWS_ST
ENV DATABASE_URL=$DATABASE_URL
ENV SERCET_KEY="supersecret"
WORKDIR /app

COPY . .

COPY --from=deps /app/node_modules /app/node_modules

RUN npx prisma db push

RUN npm run build

FROM node:20-alpine AS runner

ARG DATABASE_URL
ARG AWS_R
ARG AWS_AK
ARG AWS_SAK
ARG AWS_ST

ENV AWS_REGION=$AWS_R
ENV AWS_ACCESSKEY=$AWS_AK
ENV AWS_SECRETACCESSKEY=$AWS_SAK
ENV AWS_SESSIONTOKEN=$AWS_ST
ENV DATABASE_URL=$DATABASE_URL
ENV SERCET_KEY="supersecret"

WORKDIR /app

COPY --from=builder /app/dist /app/dist

COPY --from=builder /app/node_modules /app/node_modules

COPY --from=builder /app/prisma /app/prisma

COPY --from=builder /app/package.json /app/package.json

CMD [ "npm", "run", "start"]
