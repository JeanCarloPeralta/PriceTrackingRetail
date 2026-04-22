FROM ghcr.io/puppeteer/puppeteer:21.5.2

USER root

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev for Vite)
RUN npm install

# Copy source code
COPY . .

# Ensure permissions for the puppeteer user
RUN chown -R pptruser:pptruser /app

# Switch to non-root user
USER pptruser

# Expose port (if we run the dashboard here)
EXPOSE 5173

# Default logic is handled by docker-compose commands, 
# but we can set a default CMD to run the dev server or valid check
CMD ["npm", "run", "dev", "--", "--host"]
