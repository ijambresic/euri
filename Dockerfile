# ---- Base Stage ----
# Use a base Node.js image. It's a good practice to use a specific version.
FROM node:24-alpine AS base

# Set the working directory in the container
WORKDIR /app


# ---- Dependencies Stage ----
# This stage is for installing npm dependencies. It's a separate stage
# to leverage Docker's layer caching. Dependencies are only re-installed
# when package.json or package-lock.json changes.
FROM base AS dependencies

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install all dependencies, including devDependencies needed for the build
RUN npm install


# ---- Build Stage ----
# This stage builds the entire application, including client-side scripts
# and copies the necessary view templates.
FROM dependencies AS build

# Copy all the source code
COPY . .

# Run all build steps defined in package.json in a single layer
RUN npm run build && npm run build-client && npm run copy-ejs


# ---- Production Stage ----
# This is the final, lean production image.
FROM base AS production

COPY package.json package-lock.json ./
# Install only production dependencies
RUN npm install --omit=dev

# Copy the final built application assets from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public

# Remove the unnecessary TypeScript source folder from the production image
RUN rm -rf ./public/ts

# Set the MongoDB connection URI from an environment variable.
# You MUST provide this when you run the container.
ENV MONGO_URI="mongodb+srv://<user>:<password>@<host>/<dbname>?retryWrites=true&w=majority"

# Expose the port your app runs on, which is 3000
EXPOSE 3000

# The command to start your application
CMD ["node", "dist/app.js"]