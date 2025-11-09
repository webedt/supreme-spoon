# Development server with HMR
# Build for ARM64 to run natively on ARM64 servers (cross-compiled on x86_64 build machine)
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
