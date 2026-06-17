# syntax=docker/dockerfile:1

# DEVELOPMENT STAGE
# Node 24 matches the engine requirement in web/package.json ("node": ">=24.15.0")
FROM node:24-alpine AS development

WORKDIR /app

# Copy dependency manifests first to leverage Docker layer caching.
# A change in source files won't invalidate the npm install layer.
COPY package.json package-lock.json ./

RUN npm ci

# Copy the rest of the application source.
COPY . .

# Vite dev server listens on 5173 by default.
EXPOSE 5173

# Start the Vite dev server and bind it to 0.0.0.0 so it is reachable
# from outside the container (required when running behind Docker).
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# PROD STAGE
# Uncomment and extend this section when you are ready for a production image.
#
# FROM node:24-alpine AS build
# WORKDIR /app
# COPY package.json package-lock.json ./
# RUN npm ci
# COPY . .
# RUN npm run build
#
# FROM nginx:alpine AS production
# COPY --from=build /app/dist /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]
