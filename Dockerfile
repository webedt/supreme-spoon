# Production build with backend server
FROM node:20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Expose backend API port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start backend server (serves API and static frontend files)
CMD ["npm", "run", "start"]
