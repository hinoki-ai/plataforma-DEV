# Plataforma Astral Dashboard - Deployment Guide

## Overview

This guide covers the deployment process for the Plataforma Astral educational management dashboard. The application is built with Next.js 14, uses PostgreSQL as the database, and supports multiple deployment platforms.

## Prerequisites

### System Requirements

- **Node.js**: 18.17.0 or higher
- **PostgreSQL**: 13.0 or higher
- **Redis**: 6.0 or higher (optional, for session storage)
- **Memory**: Minimum 512MB RAM, recommended 1GB+
- **Storage**: Minimum 1GB free space

### Environment Setup

Create the following environment files:

#### `.env.local` (Development)

```env
# Database
CONVEX_URL="[Convex development deployment URL]"

# Authentication
NEXTAUTH_SECRET="your-development-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (Optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Email (Optional)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""

# File Upload
UPLOAD_PATH="./public/uploads"
MAX_FILE_SIZE="10485760" # 10MB

# Performance
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

#### `.env.production` (Production)

```env
# Database
CONVEX_URL="[Convex production deployment URL]"

# Authentication
NEXTAUTH_SECRET="your-production-secret-key-here"
NEXTAUTH_URL="https://your-domain.com"

# OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="noreply@your-domain.com"
SMTP_PASS="app-specific-password"

# File Upload
UPLOAD_PATH="./public/uploads"
MAX_FILE_SIZE="10485760"

# Performance
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://your-domain.com"
```

## Database Setup

### 1. Create PostgreSQL Database

```sql
-- Create production database
CREATE DATABASE manitos_prod;
CREATE USER manitos_user WITH ENCRYPTED PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE manitos_prod TO manitos_user;

-- Create development database (optional)
CREATE DATABASE manitos_dev;
GRANT ALL PRIVILEGES ON DATABASE manitos_dev TO manitos_user;
```

### 2. Run Database Migrations

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Optional) Seed database with initial data
npx prisma db seed
```

### 3. Verify Database Connection

```bash
# Test database connection
npx prisma db push --preview-feature
```

## Build Process

### Development Build

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build

```bash
# Install dependencies
npm ci --production=false

# Build application
npm run build

# Verify build
npm run start
```

## Deployment Options

### Option 1: Vercel (Recommended)

#### 1. Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings

#### 2. Environment Variables

Add the following environment variables in Vercel dashboard:

```bash
CONVEX_URL=[Convex deployment URL]
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://your-project.vercel.app
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

#### 3. Database Connection

For Vercel, use a cloud PostgreSQL service:

- **Supabase**: Free tier available
- **PlanetScale**: MySQL alternative
- **Railway**: PostgreSQL hosting
- **ElephantSQL**: PostgreSQL as a service

#### 4. Deploy

```bash
# Push to main branch to trigger deployment
git push origin main
```

### Option 2: Docker Deployment

#### 1. Create Dockerfile

```dockerfile
# Use Node.js 18 Alpine
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --production=false

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["npm", "start"]
```

#### 2. Create docker-compose.yml

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - CONVEX_URL=[Convex deployment URL]
      - NEXTAUTH_SECRET=your-secret
      - NEXTAUTH_URL=http://localhost:3000
    volumes:
      - ./public/uploads:/app/public/uploads
```

#### 3. Deploy with Docker

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Scale application
docker-compose up -d --scale app=3
```

### Option 3: Traditional Server

#### 1. Server Requirements

- Ubuntu 20.04+ or CentOS 7+
- 2GB RAM minimum, 4GB recommended
- 20GB storage minimum
- Node.js 18+

#### 2. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Nginx
sudo apt install nginx -y

# Install PM2 for process management
sudo npm install -g pm2
```

#### 3. Configure PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE manitos_prod;
CREATE USER manitos_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE manitos_prod TO manitos_user;
\q
```

#### 4. Deploy Application

```bash
# Clone repository
git clone https://github.com/your-org/manitos-pintadas.git
cd manitos-pintadas

# Install dependencies
npm ci --production=false

# Build application
npm run build

# Configure environment
cp .env.example .env.production
# Edit .env.production with your values

# Run database migrations
npx prisma migrate deploy
npx prisma generate

# Start application with PM2
pm2 start npm --name "manitos-dashboard" -- run start
pm2 save
pm2 startup
```

#### 5. Configure Nginx

```nginx
# /etc/nginx/sites-available/manitos-dashboard
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL configuration
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Handle Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache static assets
    location /_next/static {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API rate limiting
    location /api {
        proxy_pass http://localhost:3000;
        limit_req zone=api burst=20 nodelay;
    }
}

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;
```

#### 6. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Set up auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring and Maintenance

### Application Monitoring

#### 1. PM2 Monitoring

```bash
# Monitor application
pm2 monit

# View logs
pm2 logs manitos-dashboard

# Restart application
pm2 restart manitos-dashboard

# Update application
pm2 reload manitos-dashboard
```

#### 2. Nginx Monitoring

```bash
# Check Nginx status
sudo systemctl status nginx

# View access logs
sudo tail -f /var/log/nginx/access.log

# View error logs
sudo tail -f /var/log/nginx/error.log
```

#### 3. Database Monitoring

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Monitor database connections
psql -h localhost -U manitos_user -d manitos_prod -c "SELECT count(*) FROM pg_stat_activity;"

# Database size
psql -h localhost -U manitos_user -d manitos_prod -c "SELECT pg_size_pretty(pg_database_size('manitos_prod'));"
```

### Backup Strategy

#### 1. Database Backup

```bash
# Create backup script
#!/bin/bash
BACKUP_DIR="/var/backups/manitos"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/manitos_backup_$DATE.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump -h localhost -U manitos_user manitos_prod > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

#### 2. File Backup

```bash
# Backup uploaded files
tar -czf /var/backups/manitos/uploads_$(date +%Y%m%d).tar.gz /path/to/uploads/
```

#### 3. Automated Backups

```bash
# Add to crontab for daily backups
0 2 * * * /path/to/backup-script.sh
```

### Performance Optimization

#### 1. Database Optimization

```sql
-- Analyze database performance
EXPLAIN ANALYZE SELECT * FROM users WHERE role = 'ADMIN';

-- Create indexes for common queries
CREATE INDEX CONCURRENTLY idx_users_role_active ON users(role, is_active);
CREATE INDEX CONCURRENTLY idx_meetings_scheduled_date ON meetings(scheduled_date);
CREATE INDEX CONCURRENTLY idx_notifications_recipient_read ON notifications(recipient_id, read);

-- Vacuum and analyze
VACUUM ANALYZE;
```

#### 2. Application Optimization

```bash
# Enable production optimizations
NODE_ENV=production npm run build

# Configure PM2 for optimal performance
pm2 start npm --name "manitos-dashboard" -- run start --max-memory-restart 1G --instances max
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues

```bash
# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log

# Test database connection
psql -h localhost -U manitos_user -d manitos_prod -c "SELECT version();"
```

#### 2. Application Not Starting

```bash
# Check application logs
pm2 logs manitos-dashboard

# Check environment variables
pm2 show manitos-dashboard

# Restart application
pm2 restart manitos-dashboard
```

#### 3. Memory Issues

```bash
# Monitor memory usage
pm2 monit

# Check system memory
free -h

# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=2048" pm2 restart manitos-dashboard
```

#### 4. SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew

# Test SSL configuration
curl -I https://your-domain.com
```

## Security Checklist

### Pre-deployment

- [ ] Environment variables configured
- [ ] Database credentials secured
- [ ] SSL/TLS certificates installed
- [ ] Firewall configured
- [ ] File permissions set correctly
- [ ] Backup strategy implemented

### Post-deployment

- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Monitoring tools set up
- [ ] Backup verification
- [ ] Performance testing completed
- [ ] SSL certificate validation

## Support

For deployment support:

- 📧 Email: <deploy@manitospintadas.com>
- 📖 Documentation: <https://docs.manitospintadas.com/deployment>
- 🐛 Issues: <https://github.com/manitos-pintadas/dashboard/issues>
- 💬 Community: <https://community.manitospintadas.com>
