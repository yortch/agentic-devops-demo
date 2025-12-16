#!/bin/sh
set -e

# Generate runtime config from environment variables
cat > /usr/share/nginx/html/config.js << EOF
window.APP_CONFIG = {
  API_BASE_URL: '${VITE_API_BASE_URL:-http://localhost:8080/api}'
};
EOF

# Start nginx
exec nginx -g 'daemon off;'
