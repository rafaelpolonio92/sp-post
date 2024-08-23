# Use the official NestJS Docker image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./

RUN npm install --production

# Copy app source
COPY . .

# Build the app
RUN npm run build

# Expose the app's port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start:prod"]
