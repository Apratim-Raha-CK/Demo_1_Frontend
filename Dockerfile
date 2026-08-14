FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 1. Catch the variable from Cloud Build's --build-arg
ARG VITE_BACKEND_URL
# 2. Make it available as an environment variable for the build command
ENV VITE_BACKEND_URL=$_VITE_BACKEND_URL

# Stage 2: Serve the application using Nginx
FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Document the new Cloud Run port requirement
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]