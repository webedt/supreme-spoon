# Development server with HMR
FROM node:20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Disable V8 JIT compilation to avoid QEMU memory permission issues
ENV NODE_OPTIONS="--jitless"

# Expose Vite dev server port
EXPOSE 5173

# Start Vite dev server with HMR
CMD ["npm", "run", "dev"]
