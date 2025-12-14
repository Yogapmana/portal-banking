FROM node:20-alpine

# Install system dependencies (curl for healthcheck)
RUN apk add --no-cache curl

# Set working directory
WORKDIR /usr/src/app

# Install PM2 globally
RUN npm install pm2 -g

# Copy package files
COPY package*.json ./

# Install only production dependencies (PM2 doesn't need nodemon)
RUN npm ci --only=production

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy application code
COPY . .

# Change ownership of all files to node user
RUN chown -R node:node /usr/src/app

# Switch to non-root user
USER node

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start application with PM2
CMD ["pm2-runtime", "src/index.js", "-i", "max"]