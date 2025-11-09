# Development server with HMR
# Using node:20 (Debian bookworm) for better compatibility
FROM node:20

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
