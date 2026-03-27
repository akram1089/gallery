# 🚀 Docker Full-Stack Demo App — React + Node.js + PostgreSQL + VPS Deployment

A production-ready, Dockerized full-stack application with automatic setup and Free SSL support.

## 📋 Overview

This application provides:
- **Frontend**: React.js (Vite) with dark glassmorphism UI — login, register, image upload with descriptions
- **Backend**: Node.js Express REST API with JWT authentication and multer file handling
- **Database**: PostgreSQL with user management and uploads tracking
- **Reverse Proxy**: Nginx routing and SSL termination via Let's Encrypt
- **Deployment**: Docker Compose orchestration on any Linux VPS
- **Domain**: Free domain support via Freenom or No-IP with automatic SSL

---

## 🛠️ Quick Start (Local Development)

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- Git

### 1. Clone and Setup

```bash
git clone https://github.com/yourusername/demo-app.git
cd demo-app
cp .env.example .env
```

### 2. Configure Environment

Edit `.env`:
```bash
nano .env
```

Make sure these are set:
```env
POSTGRES_USER=appuser
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=appdb
JWT_SECRET=your_super_secret_jwt_key_change_this
VITE_API_URL=http://localhost/api
```

### 3. Start the Application

```bash
docker-compose up -d --build
```

### 4. Verify Services

- **Frontend**: http://localhost
- **Backend API**: http://localhost/api/health
- **PostgreSQL**: localhost:5432

### 5. Default Demo User

After startup, you can:
- **Register** a new account on the Login page
- **Upload** images with descriptions
- **View** your private gallery

---

## 📁 Project Structure

```
demo-app/
├── docker-compose.yml              # Development config
├── docker-compose.prod.yml         # Production overrides (SSL, etc.)
├── .env.example                    # Environment template
├── deploy.sh                        # VPS setup automation script
│
├── nginx/
│   ├── nginx.conf                  # Development reverse proxy config
│   ├── nginx-prod.conf             # Production config with HTTPS
│   └── certbot/                    # SSL certificate volume
│
├── backend/
│   ├── Dockerfile                  # Backend container image
│   ├── package.json
│   └── src/
│       ├── index.js                # Express server entrypoint
│       ├── routes/
│       │   ├── auth.js             # POST /register, /login
│       │   └── uploads.js          # POST/GET /uploads, DELETE /uploads/:id
│       ├── middleware/
│       │   └── auth.js             # JWT verification
│       ├── db/
│       │   ├── pool.js             # PostgreSQL connection pool
│       │   └── init.sql            # Database schema (users, uploads tables)
│       └── uploads/                # Uploaded images (Docker volume)
│
├── frontend/
│   ├── Dockerfile                  # Development Dockerfile
│   ├── Dockerfile.prod             # Production build + nginx
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css               # Dark glassmorphism theme
│       ├── api/
│       │   └── client.js           # Axios instance with JWT handling
│       ├── pages/
│       │   ├── Login.jsx           # Register/Login form (tabbed)
│       │   └── Dashboard.jsx       # Upload form + image gallery
│       └── components/
│           └── ImageCard.jsx       # Image card component
│
└── README.md                        # This file
```

---

## 🌍 VPS Deployment (Hostinger / DigitalOcean / Contabo / Hetzner)

### Requirements
- Linux VPS with Ubuntu 22.04+ (Hostinger, DigitalOcean $6/mo, Contabo ~$3/mo, Hetzner ~$5/mo)
- Minimum 2GB RAM, 20GB storage
- SSH access
- Root or sudoer user

### Step 1: Provision VPS

**Hostinger**:
1. Go to https://www.hostinger.com/vps (starting ~$3.99/mo)
2. Select Server (Ubuntu 22.04)
3. Complete checkout, receive IP address

**Alternative**: DigitalOcean ($6/mo), Contabo (~$3/mo), Hetzner (~$5/mo)

### Step 2: SSH into VPS

```bash
ssh root@your.vps.ip.address
# or
ssh user@your.vps.ip.address
```

### Step 3: Run Automated Setup Script

```bash
# Download the setup script
curl -fsSL https://raw.githubusercontent.com/yourusername/demo-app/main/deploy.sh -o deploy.sh

# Make it executable
chmod +x deploy.sh

# Run the script (will install Docker, Docker Compose, and start the app)
./deploy.sh
```

The script will:
1. ✅ Update system packages
2. ✅ Install Docker & Docker Compose
3. ✅ Install Git
4. ✅ Clone / pull the repository
5. ✅ Setup `.env` file
6. ✅ Start containers with `docker-compose up -d`

### Step 4: Configure Environment on VPS

After the script completes:

```bash
cd ~/demo-app
nano .env
```

Set your domain and email:
```env
DOMAIN=yourdomain.tk
EMAIL=your-email@example.com
JWT_SECRET=generate-a-long-random-string-here
POSTGRES_PASSWORD=your-secure-db-password
```

Save and exit: `Ctrl+X` → `Y` → `Enter`

### Step 5: Verify Local Setup Works

```bash
# Check containers are running
docker ps

# View logs
docker-compose logs -f

# Test API
curl http://localhost/api/health
# Should return: {"status":"ok","timestamp":"2026-03-27T..."}
```

---

## 🌐 Domain Setup

You have **two options** for a free domain:

### Option A: Freenom (.tk / .ml / .ga / .cf)

**Freenom domains are free but have some caveats:**
- Availability is inconsistent (often "out of stock")
- Free domains can be suspended if unused for 3+ months
- Best for testing/demo purposes

**Steps**:

1. Go to https://www.freenom.com
2. Search for your desired domain (e.g., `myappdemo.tk`)
3. If available, add to cart and checkout (FREE)
4. Register with email
5. Go to **My Domains** → Click your domain
6. Click **Manage Domain** → **Manage Freenom DNS**
7. Set custom nameservers or add A record:
   - **Type**: A
   - **Name**: @ (or leave blank)
   - **TTL**: 3600
   - **Target**: Your VPS public IP (e.g., `123.45.67.89`)

   Also add records for `www`:
   - **Type**: A
   - **Name**: www
   - **TTL**: 3600
   - **Target**: Your VPS IP

8. Wait 5-15 minutes for DNS to propagate
9. Test: `nslookup myappdemo.tk` should return your VPS IP

### Option B: No-IP (Free Dynamic DNS)

**Better for long-term use, automatic IP detection:**

**Steps**:

1. Go to https://www.noip.com
2. Click **Sign Up** → Create free account
3. After login, go to **Dynamic DNS** → **Create Hostname**
4. Choose hostname (e.g., `myappdemo.ddns.net`)
5. Set **IPv4 Address** to your VPS IP (e.g., `123.45.67.89`)
6. Click **Create**
7. Confirm via email
8. Test: `nslockup myappdemo.ddns.net` should return your VPS IP

**Automatic IP Updates** (Optional):
If your VPS IP changes, No-IP can auto-detect it. Download the No-IP DUC (Dynamic Update Client) on the VPS:

```bash
cd /tmp
wget http://www.no-ip.com/client/linux/noip-duc-linux.tar.gz
tar xf noip-duc-linux.tar.gz
cd noip-2.1.9-1
sudo make install
sudo /usr/local/bin/noip2 -C
# Follow prompts with your No-IP credentials
```

---

## 🔒 SSL Setup via Let's Encrypt (Certbot)

Once your domain is pointing to your VPS and working locally, set up HTTPS:

### Step 1: Prepare Environment

Update `.env` on VPS:
```env
DOMAIN=yourdomain.tk
EMAIL=your-email@example.com
```

### Step 2: Create SSL Directories

```bash
cd ~/demo-app
mkdir -p nginx/certbot/{conf,www}
```

### Step 3: Start Production Stack

```bash
# Stop development stack if running
docker-compose down

# Start production stack with SSL
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Step 4: Obtain Certificate

Run Certbot to request a Let's Encrypt certificate:

```bash
docker run --rm \
  -v ~/demo-app/nginx/certbot/conf:/etc/letsencrypt \
  -v ~/demo-app/nginx/certbot/www:/var/www/certbot \
  certbot/certbot \
  certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email YOUR_EMAIL@example.com \
  --agree-tos \
  --no-eff-email \
  -d yourdomain.tk \
  -d www.yourdomain.tk
```

Replace:
- `YOUR_EMAIL@example.com` with your actual email
- `yourdomain.tk` with your actual domain

### Step 5: Update Nginx Config

Edit `nginx/nginx-prod.conf`:

Find this line:
```nginx
ssl_certificate /etc/letsencrypt/live/DOMAIN/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/DOMAIN/privkey.pem;
```

Replace `DOMAIN` with your actual domain:
```nginx
ssl_certificate /etc/letsencrypt/live/yourdomain.tk/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.tk/privkey.pem;
```

### Step 6: Restart Nginx

```bash
docker-compose restart nginx
```

### Step 7: Verify SSL

```bash
curl https://yourdomain.tk/api/health
# Should work without certificate warnings
```

Or open https://yourdomain.tk in your browser — you should see a 🔒 padlock!

### 🔄 Auto-renewal

Certbot in the `docker-compose.prod.yml` container automatically renews certificates every 12 hours. No manual action needed!

---

## 📝 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  username   VARCHAR(50)  UNIQUE NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Uploads Table (Private Gallery)
```sql
CREATE TABLE uploads (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename    VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  description TEXT,
  file_size   INTEGER,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

**Privacy**: Users can ONLY see their own uploads. `GET /api/uploads` returns only uploads where `user_id = current_user.id`.

---

## 🔌 API Endpoints

### Authentication

**Register**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123"
}

# Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Login**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}

# Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

### Uploads (All require `Authorization: Bearer <token>`)

**Upload Image**
```bash
POST /api/uploads
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image-file>
description: "My vacation photo"

# Response:
{
  "upload": {
    "id": 42,
    "user_id": 1,
    "filename": "1711622400000-123456789.jpg",
    "original_name": "vacation.jpg",
    "description": "My vacation photo",
    "file_size": 2048576,
    "created_at": "2026-03-27T12:30:00Z"
  }
}
```

**Get My Uploads**
```bash
GET /api/uploads
Authorization: Bearer <token>

# Response:
{
  "uploads": [
    { id: 42, filename: "...", description: "...", ... },
    ...
  ]
}
```

**Delete Upload**
```bash
DELETE /api/uploads/42
Authorization: Bearer <token>

# Response:
{ "message": "Deleted successfully" }
```

---

## 🔐 Security Considerations

✅ **Implemented**:
- JWT token-based authentication
- Bcrypt password hashing (salt=12)
- CORS enabled (origins configurable)
- Private user galleries (SQL filtering)
- SSL/TLS via Let's Encrypt
- File type validation (images only)
- File size limits (10 MB max)
- SQL injection prevention (parameterized queries)

⚠️ **For Production**:
- Change all default secrets in `.env`
- Use strong POSTGRES_PASSWORD
- Enable firewall rules (only allow port 80/443 inbound)
- Regularly update Docker images
- Monitor disk space for uploads
- Setup automated backups of `postgres_data` volume
- Consider adding rate limiting to API endpoints

---

## 🛠️ Common Commands

### View Logs
```bash
# All containers
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f frontend
```

### Stop / Start
```bash
# Stop all
docker-compose down

# Start dev
docker-compose up -d

# Start prod with SSL
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Database Access
```bash
# Connect to PostgreSQL
docker exec -it demo_postgres psql -U appuser -d appdb

# List users
SELECT * FROM users;

# List uploads
SELECT * FROM uploads;
```

### Clear Data (⚠️ WARNING)
```bash
# Delete all data (keeps images)
docker-compose down

# Delete everything including volumes (PERMANENT)
docker-compose down -v
```

### Rebuild Containers
```bash
docker-compose up -d --build
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 80
lsof -i :80

# Kill it
kill -9 <PID>
```

### Can't Connect to Database
```bash
# Check postgres is running
docker ps | grep postgres

# View postgres logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres
```

### SSL Certificate Issues
```bash
# Check certificate expiry
docker exec demo_certbot certbot certificates

# Force renewal
docker run --rm \
  -v ~/demo-app/nginx/certbot/conf:/etc/letsencrypt \
  -v ~/demo-app/nginx/certbot/www:/var/www/certbot \
  certbot/certbot renew
```

### Frontend Not Loading
```bash
# Check frontend logs
docker-compose logs frontend

# Verify VITE_API_URL is correct
cat ~/.env | grep VITE_API_URL
```

---

## 📚 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Web Server | Nginx | 1.25 |
| Frontend | React | 18.2 |
| Build Tool | Vite | 5.2 |
| Backend | Node.js | 20-alpine |
| Framework | Express | 4.18 |
| Database | PostgreSQL | 16-alpine |
| Auth | JWT | - |
| SSL | Let's Encrypt + Certbot | Latest |
| Orchestration | Docker Compose | 3.8 |

---

## 🤝 Contributing

Contributions welcome! Create a branch, make changes, and submit a pull request.

## 📄 License

MIT License — feel free to use this for personal or commercial projects.

## ❓ FAQ

**Q: Can I run this on Windows?**
A: Yes, use [Docker Desktop](https://www.docker.com/products/docker-desktop/) for Windows. WSL 2 backend recommended.

**Q: How do I backup my database?**
A: `docker exec demo_postgres pg_dump -U appuser appdb > backup.sql`

**Q: Can users see each other's images?**
A: No, gallery is private per user. Backend filters by `user_id`.

**Q: How much does this cost?**
A: VPS ($3-6/mo) + Domain (Free) = minimal cost! Only pay for server.

**Q: Can I use a paid domain?**
A: Yes! Just point your domain's DNS A record to your VPS IP.

---

## 📞 Support

- **Docs**: See comments in source files
- **Issues**: Open GitHub issue
- **Email**: your-email@example.com

---

**Happy deploying! 🚀**
