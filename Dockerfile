# Development server with HMR
FROM node:20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# V8 flags to work around QEMU emulation issues while keeping WebAssembly
# --no-opt disables optimizing compiler, --no-turbo-fan disables turbofan JIT
ENV NODE_OPTIONS="--no-opt"

# Expose Vite dev server port
EXPOSE 5173

# Start Vite dev server with HMR
CMD ["npm", "run", "dev"]
