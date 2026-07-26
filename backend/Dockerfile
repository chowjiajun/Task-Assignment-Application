FROM node:24-alpine3.24

# Set working directory
WORKDIR /app

# Install dependencies and clean install
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code, .dockerignore skips sensitive files and not needed folders
COPY . .

# Build the application
RUN npm run build

# Adds a non-root user to run the application
RUN addgroup --system --gid 1001 appuser && \
    adduser --system --uid 1001 appuser && \
    chown -R appuser:appuser /app

# Switch to the non-root user
USER appuser

# Expose the port the app runs on
EXPOSE 8080

# Run migrations, then start the application
CMD ["sh", "-c", "npm run migrate && node dist/app.js"]
