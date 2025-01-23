FROM nginx:alpine AS run

WORKDIR /app

# Install bash, OpenSSL, Node.js, and ts-node
RUN apk add --no-cache bash openssl nodejs npm

COPY scripts scripts
COPY nginx.conf /etc/nginx/nginx.conf
COPY run.sh ./run.sh

# Expose ports for Nginx and Express server
EXPOSE 3000
EXPOSE 443

# Start Geth, Nginx, and the Express server using ts-node
CMD ["bash", "./run.sh"]
