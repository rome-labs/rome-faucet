#! /bin/bash
set -e


if [ "$NGINX_RUN" = "true" ]; then
  echo "Starting nginx"
  nginx -g 'daemon off;' &
else
  echo "NGINX_RUN is not set to true. Skipping nginx start."
fi


# ********************
# Start Server
# ********************


echo "Starting faucet server"
cd ./scripts
npm install
npm run server
