# Use a Node.js base image
FROM node:lts-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) first
# This allows Docker to cache the dependency installation step
COPY package*.json ./

# Install project dependencies
# Use 'npm install' if you use npm, or 'yarn install' if you use yarn
RUN npm install

# Expose the port that the Vite development server typically listens on
# Vite often uses 5173 or 3000 by default, check your vite.config.js if unsure
EXPOSE 5173

# Command to run the development server
# You might need to add '--host 0.0.0.0' to your dev script or to the CMD
# so that the server listens on all network interfaces inside the container,
# allowing it to be accessed from outside.
# Assuming your package.json has a "dev" script like "vite" or "vue-cli-service serve"
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Important: We will NOT copy the source code here directly.
# Instead, we will use Docker volumes in docker-compose.yml
# to mount the local source code into the container for live reloading.
