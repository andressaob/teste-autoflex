# Build Stage
FROM node:18-alpine as build
WORKDIR /app

# Copy package files first to leverage cache
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .
RUN npm run build

# Production Stage
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
