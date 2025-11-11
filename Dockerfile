# Multi-stage build supporting both development and production
ARG NODE_ENV=production

# Build stage (only for production)
FROM node:20 AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build the Vite frontend
RUN npm run build

# Final stage
FROM node:20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies based on NODE_ENV
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

# Install all dependencies for dev, only production deps for prod
RUN if [ "$NODE_ENV" = "production" ]; then \
      npm install --production; \
    else \
      npm install; \
    fi

# Copy server code
COPY server ./server

# Copy built frontend from builder (only for production)
COPY --from=builder /app/dist ./dist

# For development, we'll need the source files
COPY vite.config.ts tsconfig.json ./
COPY src ./src
COPY index.html ./

# Expose unified server port (always 3000)
EXPOSE 3000

# For development with HMR, also expose Vite port internally
EXPOSE 5173

# Start based on environment
CMD if [ "$NODE_ENV" = "production" ]; then \
      npm start; \
    else \
      npm run dev; \
    fi
