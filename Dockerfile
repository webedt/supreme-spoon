# Development build with hot reloading
FROM node:20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy source code
COPY . .

# Expose backend API port and Vite dev server port
EXPOSE 3000
EXPOSE 5173

# Set environment to development
ENV NODE_ENV=development

# Start in dev mode with hot reloading (both backend and frontend)
CMD ["npm", "run", "dev"]
