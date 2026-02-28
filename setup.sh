#!/bin/bash
# AllianzaAI — VPS Setup Script
# Ubuntu 24.04 | Nginx + SSL + GitHub Auto-Deploy
# Usage: bash setup.sh

set -e

REPO="https://github.com/frenzyivy/Allianza-AI.git"
SITE_DIR="/var/www/allianzaai"
DOMAIN="allianzaai.com"
ADMIN_DOMAIN="admin.allianzaai.com"

echo "=== 1. Updating system ==="
apt update && apt upgrade -y

echo "=== 2. Installing Nginx, Git, Certbot ==="
apt install -y nginx git certbot python3-certbot-nginx

echo "=== 3. Cloning site from GitHub ==="
rm -rf $SITE_DIR
git clone $REPO $SITE_DIR

echo "=== 4. Setting permissions ==="
chown -R www-data:www-data $SITE_DIR
chmod -R 755 $SITE_DIR

echo "=== 5. Writing Nginx config ==="
cat > /etc/nginx/sites-available/allianzaai << 'EOF'
# ── Main Site ────────────────────────────────────────
server {
    listen 80;
    server_name allianzaai.com www.allianzaai.com;
    root /var/www/allianzaai;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # Cache static assets
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/html text/css application/javascript;
}

# ── Admin Subdomain ──────────────────────────────────
server {
    listen 80;
    server_name admin.allianzaai.com;
    root /var/www/allianzaai;
    index dashboard.html;

    location / {
        try_files $uri /dashboard.html;
    }

    location ~* \.(css|js)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/html text/css application/javascript;
}
EOF

echo "=== 6. Enabling site ==="
ln -sf /etc/nginx/sites-available/allianzaai /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "=== 7. Getting SSL certificates ==="
certbot --nginx -d allianzaai.com -d www.allianzaai.com -d admin.allianzaai.com \
  --non-interactive --agree-tos -m your-email@gmail.com --redirect

echo "=== 8. Creating auto-deploy script ==="
cat > /usr/local/bin/deploy-allianzaai << 'DEPLOY'
#!/bin/bash
cd /var/www/allianzaai
git pull origin main
chown -R www-data:www-data /var/www/allianzaai
echo "Deployed at $(date)"
DEPLOY
chmod +x /usr/local/bin/deploy-allianzaai

echo ""
echo "✅ Setup complete!"
echo "   Main site:      https://allianzaai.com"
echo "   Admin dashboard: https://admin.allianzaai.com"
echo "   To redeploy after git push, run: deploy-allianzaai"
