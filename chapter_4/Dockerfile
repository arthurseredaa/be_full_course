# Use official node image
FROM node:24-alpine

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json from local project to docker environment
COPY package*.json .

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port that the app runs on
EXPOSE 3001

# Define the command to run the application
CMD ["node", "./src/server.js"]