# Backend Dockerfile
FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

CMD ["npm", "run", "dev"]
