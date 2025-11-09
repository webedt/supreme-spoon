# Development server with HMR
# Using standard node image instead of alpine to avoid QEMU architecture issues
FROM --platform=linux/amd64 node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start Vite dev server with HMR
CMD ["npm", "run", "dev"]
