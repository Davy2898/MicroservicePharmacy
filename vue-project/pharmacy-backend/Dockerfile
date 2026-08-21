# Use Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port (default from .env or 5000)
EXPOSE 5000

# Start the service
CMD ["npm", "start"]