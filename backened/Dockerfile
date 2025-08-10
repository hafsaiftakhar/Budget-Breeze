# Use official Node image as the build environment
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

y

RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]
