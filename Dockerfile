# Multi-stage build supporting development mode with HMR
FROM node:20

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy workspace package files
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/
COPY reverse-proxy/package*.json ./reverse-proxy/

# Install all dependencies (including dev dependencies for HMR)
RUN npm install

# Copy all source code
COPY frontend ./frontend
COPY backend ./backend
COPY reverse-proxy ./reverse-proxy

# Expose ports
EXPOSE 3000
EXPOSE 3001
EXPOSE 5173

# Start all three services in development mode
CMD ["npm", "run", "dev"]
