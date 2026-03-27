#!/bin/bash

# Docker Full-Stack App Deployment Script
# This script automates VPS setup and deployment

set -e

echo "🚀 Starting Docker Full-Stack App Setup..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${YELLOW}⚠️  Running as root. It's recommended to run this as a regular user with sudo.${NC}"
fi

# Step 2: Update system packages
echo -e "${GREEN}[1/7] Updating system packages...${NC}"
sudo apt-get update
sudo apt-get upgrade -y

# Step 3: Install Docker
echo -e "${GREEN}[2/7] Installing Docker...${NC}"
if command -v docker &> /dev/null; then
    echo "  Docker is already installed."
else
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
    sudo usermod -aG docker $USER
    echo "  Please log out and log back in for docker group changes to take effect."
fi

# Step 4: Install Docker Compose
echo -e "${GREEN}[3/7] Installing Docker Compose...${NC}"
if command -v docker-compose &> /dev/null; then
    echo "  Docker Compose is already installed."
else
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Step 5: Install Git
echo -e "${GREEN}[4/7] Installing Git...${NC}"
sudo apt-get install -y git

# Step 6: Setup the application
echo -e "${GREEN}[5/7] Setting up application...${NC}"

# Create app directory
APP_DIR="/home/$USER/demo-app"
if [ -d "$APP_DIR" ]; then
    echo "  App directory already exists at $APP_DIR"
    read -p "  Do you want to pull latest changes? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd "$APP_DIR"
        git pull origin main
    fi
else
    echo "  Cloning repository..."
    git clone https://github.com/yourusername/demo-app.git "$APP_DIR"
    cd "$APP_DIR"
fi

# Step 7: Configure environment variables
echo -e "${GREEN}[6/7] Setting up environment variables...${NC}"
if [ ! -f "$APP_DIR/.env" ]; then
    cp "$APP_DIR/.env.example" "$APP_DIR/.env"
    echo -e "${YELLOW}  ⚠️  Created .env file. Please edit it with your settings:${NC}"
    echo -e "${YELLOW}     nano $APP_DIR/.env${NC}"
    echo ""
    read -p "  Press Enter after you've configured .env... "
else
    echo "  .env file already exists."
fi

# Step 8: Build and start containers
echo -e "${GREEN}[7/7] Starting Docker containers...${NC}"
cd "$APP_DIR"
docker-compose -f docker-compose.yml up -d

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "  1. Edit .env file with your configuration"
echo "  2. For production with SSL:"
echo "     docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d"
echo "  3. Initialize SSL certificate (after DNS is configured):"
echo "     docker run --rm -it -v $(pwd)/nginx/certbot/conf:/etc/letsencrypt -v $(pwd)/nginx/certbot/www:/var/www/certbot certbot/certbot certonly --webroot -w /var/www/certbot -d yourdomain.tk --email your-email@example.com --agree-tos --no-eff-email"
echo ""
echo "🌍 Access your app:"
echo "  Local: http://localhost"
echo "  Production: https://yourdomain.tk (after SSL is setup)"
echo ""
echo "📚 View logs:  docker-compose logs -f"
echo "🛑 Stop app:   docker-compose down"
