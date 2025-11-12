FROM node:lts-alpine AS build
WORKDIR /app

# 1. Copy and install dependencies first for layer caching
COPY package*.json ./
RUN npm install --silent

# 2. Copy all application source code
COPY . .

# 3. Build the Angular application for production
RUN npm run build -- --configuration=production --base-href=/


RUN ls -R /app/dist
# ===========================

# --- Stage 2: Production Stage (Uses a tiny Nginx image to serve static files) ---
FROM nginx:alpine

COPY --from=build /app/dist/browser /usr/share/nginx/html

# Nginx runs on port 80 by default
EXPOSE 80

# Command to run Nginx when the container starts
CMD ["nginx", "-g", "daemon off;"]
