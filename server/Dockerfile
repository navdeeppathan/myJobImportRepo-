# server/Dockerfile
FROM node:18-alpine
WORKDIR /app

# install deps
COPY package*.json ./
RUN npm ci --production

# copy source
COPY . .

# make sure app uses process.env.PORT
ENV NODE_ENV=production
EXPOSE 10000

# default command (can be overridden in Render by Start Command)
CMD ["npm","run","start"]
