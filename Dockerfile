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

# Copy startup script
COPY start-services.sh ./start-services.sh
RUN chmod +x ./start-services.sh

# Set default environment variables
ENV PORT=3000
ENV BACKEND_URL=http://localhost:3001
ENV FRONTEND_URL=http://localhost:5173

# Expose ports
EXPOSE 3000
EXPOSE 3001
EXPOSE 5173

# Start all three services in development mode
CMD ["./start-services.sh"]
