FROM node:alpine
RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
    bash \
    tzdata \
    git \
    openssh-client

WORKDIR /app
COPY package.json /app/

RUN yarn install
RUN npm install -g nodemon ts-node
CMD ["yarn", "start"]