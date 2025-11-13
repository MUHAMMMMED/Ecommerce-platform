# Use a specific Node version image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Clean npm cache before installing dependencies and install dependencies
RUN npm cache clean --force && npm install
# Increase memory allocation (adjust as needed)

ENV NODE_OPTIONS="--max_old_space_size=8192"
# Add missing babel plugin for compatibility issues
RUN npm install --save-dev @babel/plugin-proposal-private-property-in-object

# Copy the rest of the project files
COPY . .

# # Copy the .env file from the shared volume
# COPY /app/shared_env/.env .env


# # Copy the .env file to the correct location
# COPY frontend/src/components/PixelsLibraries/.env .env
# Build the React app
RUN npm run build --verbose

# Install a static server to serve the React app
RUN npm install -g serve

# Expose the port that the app will run on
EXPOSE 3000

# Command to run the server
CMD ["serve", "-s", "build", "-l", "3000"]