# Dockerfile for Nginx Reverse Proxy
FROM nginx:alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443
