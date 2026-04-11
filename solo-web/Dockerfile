# Multi-stage Dockerfile for Angular app

# Stage 1: Build the app
FROM node:alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app for production
RUN npm run build -- --configuration production

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Copy built app from build stage
COPY --from=build /app/dist/solo-web/browser /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]