# Multi-stage Dockerfile for LLM Code Deployment Server

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Stage 2: Production
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install git (required for gh CLI fallback)
RUN apk add --no-cache git

# Copy dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY . .

# Create directories for logs
RUN mkdir -p generated-repos

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run as non-root user
USER node

# Start server
CMD ["node", "src/index.js"]
