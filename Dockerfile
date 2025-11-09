# Development server with HMR
# Use ARM64 architecture to match Dokploy server and avoid QEMU emulation
FROM --platform=linux/arm64 node:20

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
