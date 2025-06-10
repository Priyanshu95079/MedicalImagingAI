#!/bin/bash

# Update system packages
yum update -y

# Install required packages
yum install -y nginx python3 python3-pip git

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

# Create web directory
mkdir -p /var/www/html

# Set up Python environment
python3 -m pip install --upgrade pip
python3 -m pip install virtualenv

# Create and activate virtual environment
python3 -m virtualenv /opt/medical-imaging-env
source /opt/medical-imaging-env/bin/activate

# Install Python dependencies
pip install -r /var/www/html/requirements.txt

# Configure Nginx
cat > /etc/nginx/conf.d/medical-imaging.conf << 'EOL'
server {
    listen 80;
    server_name _;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable CORS
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
}
EOL

# Restart Nginx to apply changes
systemctl restart nginx

# Set proper permissions
chown -R nginx:nginx /var/www/html
chmod -R 755 /var/www/html 