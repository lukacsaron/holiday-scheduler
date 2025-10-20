# Multi-stage build for Holiday Scheduler

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy frontend package files
COPY package*.json ./
RUN npm ci

# Copy frontend source
COPY . .

# Build frontend
RUN npm run build

# Stage 2: Setup backend and serve
FROM node:20-alpine

WORKDIR /app

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# Copy backend package files
COPY server/package*.json ./server/
WORKDIR /app/server

# Temporarily add better-sqlite3 back for Docker builds
RUN npm install express cors better-sqlite3 --production

# Copy backend source
COPY server/ ./

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/dist /app/dist

# Create data directory for SQLite database
RUN mkdir -p /app/server/data

# Expose port
EXPOSE 3001

# Set environment to production
ENV NODE_ENV=production

# Start the server
CMD ["node", "index.js"]
