# Multi-stage build for React frontend
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files and install dependencies (cached layer)
COPY frontend/package*.json ./
RUN npm ci

# Copy source code and build
COPY frontend/ ./
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static files
RUN rm -rf ./*

# Copy built files from build stage
COPY --from=build /app/dist .

# Copy custom nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script that injects runtime config
COPY frontend/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Use entrypoint to inject runtime API URL before starting nginx
ENTRYPOINT ["/docker-entrypoint.sh"]
