FROM node:22-alpine AS base

WORKDIR /app

COPY package.json package-lock.json ./


FROM base AS dependencies

RUN npm ci


FROM dependencies AS development

COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]


FROM dependencies AS builder

ARG VITE_API_BASE_URL=/api
ARG VITE_IMAGE_BASE_URL=/storage
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_IMAGE_BASE_URL=${VITE_IMAGE_BASE_URL}

COPY . .
RUN npm run build


FROM nginx:1.27-alpine AS production

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]