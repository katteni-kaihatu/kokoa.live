# Frontend Dockerfile
FROM node:18-alpine

WORKDIR /app

ARG BACKEND_API_ORIGIN
ENV BACKEND_API_ORIGIN=${BACKEND_API_ORIGIN}

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

RUN npm run build

CMD ["npm", "run", "start"]
