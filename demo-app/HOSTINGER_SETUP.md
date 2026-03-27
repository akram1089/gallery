# 🚀 Hostinger VPS Setup Quick Guide

Complete guide for deploying the Docker Full-Stack App on **Hostinger VPS**.

## 📋 Prerequisites

- Hostinger VPS account (starting at ₹99/month ≈ $1.20/month or $2.99/month USD for higher specs)
- Domain (free via Freenom or No-IP)
- SSH client (built-in on Mac/Linux, use PuTTY/Termius on Windows)

---

## 🏗️ Step 1: Provision Hostinger VPS

### 1.1 Buy VPS

1. Log in to [Hostinger.com](https://www.hostinger.com/)
2. Click **VPS** → **Choose Plan**
3. Select **Ubuntu 22.04** (Recommended)
4. Choose plan:
   - **Starter**: 2GB RAM / 50GB SSD (Best for this app) — ~$3.99/mo
   - Higher plans available for scaling
5. Complete checkout, receive email with IP address and password

### 1.2 System Information (You'll Receive)
```
IP Address:         123.45.67.89
Root Password:      Your_Random_Password_123
SSH Port:           22 (standard)
Hostname:           mail123.hostinger-cloud.com
```

---

## 🔑 Step 2: Initial SSH Connection

### On Mac/Linux Terminal:
```bash
ssh root@123.45.67.89
# When prompted for password, paste the password you received
# (Note: Password won't show as you type, that's normal)
```

### On Windows:
Use **Termius** (free) or **PuTTY**:
1. Open Termius
2. Click **New Host**
3. **Name**: Hostinger
4. **Address**: 123.45.67.89
5. **Username**: root
6. **Password**: Your_Random_Password_123
7. **Port**: 22
8. Click **Save** → **Connect**

---

## 🛠️ Step 3: Initial Server Setup

### 3.1 Update System
```bash
apt update
apt upgrade -y
```

### 3.2 Create Non-Root User (Recommended)
```bash
# Create user 'appuser'
adduser appuser
# Follow prompts (you can leave fields blank except password)

# Give sudo privileges
usermod -aG sudo appuser

# Switch to new user
su - appuser
```

### 3.3 Disable Root Login (Security)
```bash
sudo nano /etc/ssh/sshd_config
```

Find and change:
```
PermitRootLogin yes
```

To:
```
PermitRootLogin no
```

Save: `Ctrl+X` → `Y` → `Enter`

Restart SSH:
```bash
sudo systemctl restart sshd
```

---

## 🐳 Step 4: Install Docker & Docker Compose

### 4.1 One-Click Setup Script

```bash
# Download and run setup script
curl -fsSL https://raw.githubusercontent.com/yourusername/demo-app/main/deploy.sh -o deploy.sh
chmod +x deploy.sh
./deploy.sh
```

The script handles:
- ✅ Docker installation
- ✅ Docker Compose installation
- ✅ Application setup
- ✅ Container startup

### 4.2 Manual Setup (If preferred)

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
rm get-docker.sh

# Add current user to docker group
sudo usermod -aG docker $USER

# Log out and back in for changes to take effect
exit
ssh appuser@123.45.67.89

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

---

## 📥 Step 5: Clone Application

```bash
# Install Git
sudo apt install -y git

# Clone repository
cd ~
git clone https://github.com/yourusername/demo-app.git
cd demo-app

# Or if using SSH key:
git clone git@github.com:yourusername/demo-app.git
cd demo-app
```

---

## ⚙️ Step 6: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

Update these values:
```env
POSTGRES_USER=appuser
POSTGRES_PASSWORD=your_secure_password_here_min_16_chars
POSTGRES_DB=appdb
JWT_SECRET=generate_a_very_long_random_string_here_at_least_32_chars
NODE_ENV=development
VITE_API_URL=http://localhost/api
```

**Generate secure secrets:**
```bash
openssl rand -base64 32
```

Save file: `Ctrl+X` → `Y` → `Enter`

---

## 🚀 Step 7: Start the Application

### Development Mode
```bash
docker-compose up -d --build

# View logs
docker-compose logs -f
```

### Verify Services
```bash
# Check running containers
docker ps

# Test API
curl http://localhost/api/health

# Output should show:
# {"status":"ok","timestamp":"2026-03-27T..."}
```

---

## 🌐 Step 8: Point Domain to VPS IP

### Option A: Freenom (.tk domain - Free)

1. Go to [freenom.com](https://www.freenom.com)
2. Search `mycoolapp.tk`
3. Add to cart → Checkout (FREE)
4. Go to **My Domains** → Select domain
5. **Manage** → **Manage Freenom DNS**
6. Add A Record:
   - **Type**: A
   - **Name**: @ (root)
   - **TTL**: 3600
   - **Target**: 123.45.67.89

   Also add www:
   - **Type**: A
   - **Name**: www
   - **TTL**: 3600
   - **Target**: 123.45.67.89

7. Wait 5-15 minutes for DNS propagation

### Option B: No-IP (Free Dynamic DNS)

1. Go to [noip.com](https://www.noip.com)
2. Sign up (free account)
3. **Dynamic DNS** → **Create Hostname**
4. Hostname: `mycoolapp.ddns.net`
5. IPv4: `123.45.67.89`
6. Confirm via email

---

## 🔒 Step 9: Setup SSL Certificate (HTTPS)

### 9.1 Verify DNS First

```bash
# Wait until this returns your VPS IP
nslookup mycoolapp.tk
# or
nslookup mycoolapp.ddns.net
```

### 9.2 Create SSL Directories

```bash
mkdir -p ~/demo-app/nginx/certbot/{conf,www}
```

### 9.3 Stop dev stack and start production stack

```bash
# From ~/demo-app directory
docker-compose down

# Start prod stack
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 9.4 Request Certificate

```bash
docker run --rm \
  -v ~/demo-app/nginx/certbot/conf:/etc/letsencrypt \
  -v ~/demo-app/nginx/certbot/www:/var/www/certbot \
  certbot/certbot \
  certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email \
  -d mycoolapp.tk \
  -d www.mycoolapp.tk
```

Replace:
- `your-email@example.com` with your real email
- `mycoolapp.tk` with your actual domain

### 9.5 Update Nginx Config

```bash
nano ~/demo-app/nginx/nginx-prod.conf
```

Find and replace:
```nginx
# BEFORE:
ssl_certificate /etc/letsencrypt/live/DOMAIN/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/DOMAIN/privkey.pem;

# AFTER:
ssl_certificate /etc/letsencrypt/live/mycoolapp.tk/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/mycoolapp.tk/privkey.pem;
```

### 9.6 Restart Nginx

```bash
docker-compose restart nginx
```

---

## ✅ Step 10: Verify Everything Works

### Local Access
```bash
# Access from VPS:
curl http://123.45.67.89/api/health
curl https://123.45.67.89/api/health
```

### Remote Access (From Your Local Machine)
```bash
# Browser
https://mycoolapp.tk

# Or command line
curl https://mycoolapp.tk/api/health
```

Should see:
- ✅ Website loads
- ✅🔒 Padlock icon (SSL working)
- ✅ Can register new account
- ✅ Can login
- ✅ Can upload images

---

## 🔧 Useful Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f nginx
```

### Database Access
```bash
# Connect to PostgreSQL
docker exec -it demo_postgres psql -U appuser -d appdb

# Inside psql:
\dt                    # List tables
SELECT * FROM users;   # View users
\q                     # Exit
```

### Stop Services
```bash
docker-compose down       # Keep data
docker-compose down -v    # Delete everything (WARNING!)
```

### Restart Services
```bash
docker-compose restart
docker-compose restart backend
docker-compose restart postgres
```

### View Disk Usage
```bash
df -h                  # Disk space
du -sh ~/demo-app      # App size
```

---

## 🔐 Hostinger-Specific Security Tips

### 1. Enable VPS Firewall
```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 2. Set Up Automatic Backups
Hostinger offers automatic backups in the control panel:
1. Log in to Hostinger
2. Go to your VPS
3. **Backups** tab
4. Enable automatic backups (daily/weekly)

### 3. Backup Database Manually
```bash
# Create backup
docker exec demo_postgres pg_dump -U appuser appdb > backup_$(date +%Y%m%d).sql

# List backups
ls -lh backup_*.sql

# Restore from backup
docker exec -i demo_postgres psql -U appuser appdb < backup_20260327.sql
```

### 4. Monitor Resource Usage
```bash
# CPU, Memory, Disk
htop

# Network
iftop
```

---

## 🐛 Troubleshooting

### Can't Connect to VPS
```bash
# Check IP address
ping 123.45.67.89

# Try with -v (verbose)
ssh -v root@123.45.67.89

# Check Hostinger firewall in control panel
```

### Port 80/443 Already in Use
```bash
# See what's using the port
sudo netstat -tlnp | grep :80

# Kill the process
sudo kill -9 <PID>
```

### Certificate Not Working
```bash
# Check certificate
docker exec demo_certbot certbot certificates

# Try manual renewal
docker exec demo_certbot certbot renew --force-renewal

# Check nginx config (errors usually logged here)
docker-compose logs nginx
```

### Out of Disk Space
```bash
# Check usage
df -h

# Clean Docker (removes unused images/containers)
docker system prune -a

# Check app size
du -sh ~/demo-app/*

# Uploads might be large
du -sh ~/demo-app/backend/uploads
```

---

## 📊 Performance Tips

1. **Allocate swap** (useful for smaller plans):
   ```bash
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

2. **Enable caching** in nginx (add to `nginx.conf`):
   ```nginx
   proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=cache:10m;
   proxy_cache cache;
   ```

3. **Limit upload size** (already set to 10MB in code)

4. **Database indexing** (already done in `init.sql`)

---

## 🎯 Next Steps

After deployment:
- ✅ Test image upload functionality
- ✅ Invite friends to register and test
- ✅ Monitor logs for any errors
- ✅ Setup automated backups
- ✅ Plan for scaling if needed

---

## 📞 Support

- **Hostinger Docs**: https://support.hostinger.com/en/articles/4651151-how-to-connect-to-your-vps
- **Docker Docs**: https://docs.docker.com/
- **Let's Encrypt**: https://letsencrypt.org/getting-started/

---

**Congratulations! Your app is now live on the internet! 🎉**
